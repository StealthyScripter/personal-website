import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import "../styles/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brian Wendot | Portfolio",
  description: "Software Developer & Digital Craftsman - Creating exceptional digital experiences through clean code, innovative solutions, and user-centered design",
  keywords: ["Brian Wendot", "Software Developer", "Web Developer", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Brian Wendot", url: "https://brianwendot.com" }],
  openGraph: {
    title: "Brian Wendot | Portfolio",
    description: "Software Developer & Digital Craftsman",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
