import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/app/context/GlobalContext";
import { Toaster } from "@/components/ui/sonner";
import ClientOnly from "@/components/ClientOnly";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerJS Developer Tool for Tron",
  description: "A tool for developers to test and develop with LedgerJS for Tron",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Language" content="en" />
        <script src="/force-lang-en.js" defer></script>
      </head>
      <body className={inter.className}>
        <ClientOnly>
          <GlobalProvider>
            {children}
            <Toaster />
          </GlobalProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
