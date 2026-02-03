import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Heebo } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const heebo = Heebo({
    variable: "--font-heebo",
    subsets: ["hebrew", "latin"],
    weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://shibutzplus.com"),
    title: {
        default: "שיבוץ+ | ניהול מערכת שעות יומית",
        template: "%s | שיבוץ+",
    },
    description: "ניהול מערכת שעות יומית ושיבוץ מורים בקלות וביעילות, מותאם לסגני מנהלים ולרכזי מערכת בבתי ספר.",
    icons: {
        icon: "/favicon.png",
        apple: "/logo192.png",
    },
    openGraph: {
        title: "שיבוץ+ | ניהול מערכת שעות יומית",
        description: "ניהול מערכת שעות יומית ושיבוץ מורים בקלות וביעילות, מותאם לסגני מנהלים ולרכזי מערכת בבתי ספר.",
        url: "https://shibutzplus.com",
        siteName: "שיבוץ+",
        images: [
            {
                url: "/og_image.png",
                width: 1200,
                height: 630,
                alt: "שיבוץ+ | ניהול מערכת שעות יומית",
            },
        ],
        locale: "he_IL",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "שיבוץ+ | ניהול מערכת שעות יומית",
        description: "ניהול מערכת שעות יומית ושיבוץ מורים בקלות וביעילות, מותאם לסגני מנהלים ולרכזי מערכת בבתי ספר.",
        images: ["/og_image.png"],
    },
    robots: {
        index: false,
        follow: false,
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl">
            <body className={`${geistSans.variable} ${geistMono.variable} ${heebo.variable}`}>
                <Providers>{children}</Providers>
                <Script
                    id="clarity-script"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "t1d0tmgih6");
            `,
                    }}
                />
                <Script
                    id="sw-registration"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  navigator.serviceWorker.register("/sw.js").catch(() => {
                    // Service worker registration failed - app will work without PWA features
                  });
                });
              }
            `,
                    }}
                />
                <Script
                    id="dynamic-manifest"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              // Inject dynamic manifest link with teacher's home URL
              let startUrl = window.location.origin + '/';
              
              try {
                const teacherData = localStorage.getItem('teacher_data');
                if (teacherData) {
                  const teacher = JSON.parse(teacherData);
                  if (teacher.schoolId && teacher.id) {
                    startUrl = window.location.origin + '/teacher-material/' + teacher.schoolId + '/' + teacher.id;
                  }
                }
              } catch (e) {
                // Fallback to default URL if localStorage read fails
              }
              
              const link = document.createElement('link');
              link.rel = 'manifest';
              link.href = '/api/manifest?start_url=' + encodeURIComponent(startUrl);
              document.head.appendChild(link);
            `,
                    }}
                />
            </body>
        </html>
    );
}
