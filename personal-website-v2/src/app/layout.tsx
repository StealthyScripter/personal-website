import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "../styles/globals.css";
import "../styles/index.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brian Wendot | Portfolio",
  description:
    "Software Developer & Digital Craftsman - Creating exceptional digital experiences through clean code, innovative solutions, and user-centered design",
  keywords: [
    "Brian Wendot",
    "Software Developer",
    "Web Developer",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Brian Wendot", url: "https://brianwendot.com" }],
  openGraph: {
    title: "Brian Wendot | Portfolio",
    description: "Software & Web Developer",
    url: "https://brianwendot.com",
    siteName: "Brian Wendot Portfolio",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Google Analytics script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S6CX32X971"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S6CX32X971');
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

