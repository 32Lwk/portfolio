import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/animations/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Yuto K. | Portfolio & Blog",
    template: "%s | Yuto K.",
  },
  description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
  keywords: ["ポートフォリオ", "ブログ", "フルスタックエンジニア", "医療AI", "Next.js", "TypeScript"],
  authors: [{ name: "Yuto K.", url: "https://github.com/32Lwk" }],
  creator: "Yuto K.",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://kawashimayuto.dev",
    title: "Yuto K. | Portfolio & Blog",
    description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
    siteName: "Yuto K. | Portfolio & Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuto K. | Portfolio & Blog",
    description: "名古屋大学 理学部物理学科に在籍する大学生。安全性や正確性が強く求められる分野に関心を持ち、「システムを誤らせない設計」を軸に、WebアプリケーションやAIを用いた個人開発に取り組んでいます。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var s=!t||t==='system';var d=s?window.matchMedia('(prefers-color-scheme: dark)').matches:t==='dark';document.documentElement.classList.toggle('dark',d);})();`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              メインコンテンツへスキップ
            </a>
            <Header />
            <main id="main-content" className="flex-1 pt-16">
            <PageTransition>{children}</PageTransition>
          </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
