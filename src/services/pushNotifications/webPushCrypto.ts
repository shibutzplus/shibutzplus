/**
 * Pure Web Crypto Web Push Payload Builder (RFC 8291 / RFC 8292)
 * Zero external dependencies, 100% compatible with Edge, Cloudflare Workers, Node.js.
 */

// Base64URL Helpers
export function encodeBase64Url(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\//g, "_")
        .replace(/\+/g, "-")
        .replace(/=+$/, "");
}

export function decodeBase64Url(str: string): Uint8Array {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
        base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function objectToBase64Url(obj: Record<string, unknown>): string {
    return encodeBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

function be16(val: number): number {
    return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}

function arrayChunk(arr: Uint8Array, chunkSize: number): Uint8Array[] {
    const chunks: Uint8Array[] = [];
    let i = 0;
    while (i < arr.length) {
        chunks.push(arr.slice(i, i + chunkSize));
        i += chunkSize;
    }
    return chunks;
}

function generateNonce(base: Uint8Array, index: number): Uint8Array {
    const nonce = base.slice(0, 12);
    for (let i = 0; i < 6; ++i) {
        nonce[nonce.length - 1 - i] ^= Math.floor(index / Math.pow(256, i)) & 0xff;
    }
    return nonce;
}

function encodeLength(int: number): Uint8Array {
    return new Uint8Array([0, int]);
}

function createInfo(clientPublic: Uint8Array, serverPublic: Uint8Array, type: string): Uint8Array {
    return new Uint8Array([
        ...new TextEncoder().encode(`Content-Encoding: ${type}\0`),
        ...new TextEncoder().encode("P-256\0"),
        ...encodeLength(clientPublic.byteLength),
        ...clientPublic,
        ...encodeLength(serverPublic.byteLength),
        ...serverPublic,
    ]);
}

function createInfo2(type: string): Uint8Array {
    return new Uint8Array([
        ...new TextEncoder().encode(`Content-Encoding: ${type}\0`),
    ]);
}

function ecJwkToBytes(jwk: JsonWebKey): Uint8Array {
    if (!jwk.x || !jwk.y) {
        throw new Error("JWK coordinates missing");
    }
    const xBytes = decodeBase64Url(jwk.x);
    const yBytes = decodeBase64Url(jwk.y);
    return new Uint8Array([0x04, ...xBytes, ...yBytes]);
}

function createHMAC(data: Uint8Array | ArrayBuffer) {
    const rawData = data instanceof Uint8Array ? data : new Uint8Array(data);
    if (rawData.byteLength === 0) {
        return {
            hash: () => Promise.resolve(new ArrayBuffer(32)),
        };
    }
    const keyPromise = crypto.subtle.importKey(
        "raw",
        rawData as unknown as BufferSource,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    return {
        hash: async (input: Uint8Array | ArrayBuffer) => {
            const k = await keyPromise;
            return crypto.subtle.sign("HMAC", k, input as unknown as BufferSource);
        },
    };
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array | ArrayBuffer) {
    const prkhPromise = createHMAC(salt)
        .hash(ikm)
        .then((prk) => createHMAC(prk));
    return {
        extract: async (info: Uint8Array, len: number) => {
            const input = new Uint8Array([
                ...info,
                1,
            ]);
            const prkh = await prkhPromise;
            const hash = await prkh.hash(input);
            return new Uint8Array(hash).slice(0, len);
        },
    };
}

async function vapidHeaders(
    subscription: { endpoint: string },
    vapid: { subject: string; publicKey: string; privateKey: string }
) {
    const vapidPublicKeyBytes = decodeBase64Url(vapid.publicKey);
    const publicKey = await crypto.subtle.importKey(
        "jwk",
        {
            kty: "EC",
            crv: "P-256",
            x: encodeBase64Url(vapidPublicKeyBytes.slice(1, 33)),
            y: encodeBase64Url(vapidPublicKeyBytes.slice(33, 65)),
            d: vapid.privateKey,
        },
        {
            name: "ECDSA",
            namedCurve: "P-256",
        },
        false,
        ["sign"]
    );

    const headerStr = objectToBase64Url({ typ: "JWT", alg: "ES256" });
    const payloadStr = objectToBase64Url({
        aud: new URL(subscription.endpoint).origin,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: vapid.subject,
        iat: Math.floor(Date.now() / 1000),
    });
    const dataStr = `${headerStr}.${payloadStr}`;
    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        publicKey,
        new TextEncoder().encode(dataStr)
    );

    const jwt = `${dataStr}.${encodeBase64Url(signature)}`;

    return {
        headers: {
            authorization: `WebPush ${jwt}`,
            "crypto-key": `p256ecdsa=${vapid.publicKey}`,
        },
    };
}

async function encryptNotification(
    subscription: { keys: { p256dh: string; auth: string } },
    plaintext: Uint8Array
) {
    const clientPublicBytes = decodeBase64Url(subscription.keys.p256dh);
    const clientPublicKey = await crypto.subtle.importKey(
        "jwk",
        {
            kty: "EC",
            crv: "P-256",
            x: encodeBase64Url(clientPublicBytes.slice(1, 33)),
            y: encodeBase64Url(clientPublicBytes.slice(33, 65)),
            ext: true,
        },
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        []
    );
    const authSecretBytes = decodeBase64Url(subscription.keys.auth);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Ephemeral local key
    const localKeyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        ["deriveBits"]
    );
    const localPublicJwk = await crypto.subtle.exportKey("jwk", localKeyPair.publicKey);
    const localPublicKeyBytes = ecJwkToBytes(localPublicJwk);

    const sharedSecret = await crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: clientPublicKey,
        },
        localKeyPair.privateKey,
        256
    );

    const cekInfo = createInfo(clientPublicBytes, localPublicKeyBytes, "aesgcm");
    const nonceInfo = createInfo(clientPublicBytes, localPublicKeyBytes, "nonce");
    const keyInfo = createInfo2("auth");

    const ikmHkdf = await hkdf(authSecretBytes, sharedSecret);
    const ikm = await ikmHkdf.extract(keyInfo, 32);
    const messageHkdf = await hkdf(salt, ikm);
    const cekBytes = await messageHkdf.extract(cekInfo, 16);
    const nonceBytes = await messageHkdf.extract(nonceInfo, 12);

    const cekCryptoKey = await crypto.subtle.importKey(
        "raw",
        cekBytes as unknown as BufferSource,
        {
            name: "AES-GCM",
            length: 128,
        },
        false,
        ["encrypt"]
    );

    const cipherChunks = await Promise.all(
        arrayChunk(plaintext, 4095).map(async (chunk, idx) => {
            const padSize = 0;
            const x = new Uint16Array([be16(padSize)]);
            const padded = new Uint8Array([
                ...new Uint8Array(x.buffer, x.byteOffset, x.byteLength),
                ...chunk,
            ]);
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: generateNonce(nonceBytes, idx) as unknown as BufferSource,
                },
                cekCryptoKey,
                padded as unknown as BufferSource
            );
            return new Uint8Array(encrypted);
        })
    );

    const flatLen = cipherChunks.reduce((acc, c) => acc + c.byteLength, 0);
    const ciphertext = new Uint8Array(flatLen);
    let offset = 0;
    for (const c of cipherChunks) {
        ciphertext.set(c, offset);
        offset += c.byteLength;
    }

    return {
        ciphertext,
        salt,
        localPublicKeyBytes,
    };
}

export interface PushMessageOptions {
    ttl?: number;
    urgency?: "very-low" | "low" | "normal" | "high";
    topic?: string;
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface VapidKeys {
    subject: string;
    publicKey: string;
    privateKey: string;
}

export async function buildPushPayload(
    message: { data: string | number | Record<string, unknown>; options?: PushMessageOptions },
    subscription: PushSubscriptionData,
    vapid: VapidKeys
) {
    const { headers } = await vapidHeaders(subscription, vapid);
    const rawData =
        typeof message.data === "string" || typeof message.data === "number"
            ? String(message.data)
            : JSON.stringify(message.data);
    const encrypted = await encryptNotification(subscription, new TextEncoder().encode(rawData));

    return {
        headers: {
            ...headers,
            "crypto-key": `dh=${encodeBase64Url(encrypted.localPublicKeyBytes)};${headers["crypto-key"]}`,
            encryption: `salt=${encodeBase64Url(encrypted.salt)}`,
            ttl: (message.options?.ttl || 60).toString(),
            ...(message.options?.urgency && {
                urgency: message.options.urgency,
            }),
            ...(message.options?.topic && {
                topic: message.options.topic,
            }),
            "content-encoding": "aesgcm",
            "content-length": encrypted.ciphertext.byteLength.toString(),
            "content-type": "application/octet-stream",
        },
        method: "POST",
        body: encrypted.ciphertext,
    };
}
