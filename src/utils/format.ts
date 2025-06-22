export function safeParseJSON<T>(jsonString: string | null): T | null {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Error parsing JSON from storage:", e);
        return null;
    }
}
