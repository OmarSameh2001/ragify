import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar/navbar";
import { ThemeProvider } from "@/context/theme";
import { EnviromentProvider } from "@/context/enviroment";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryProvider from "@/context/query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ragify",
  description: "Talk to your documents with Ragify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider>
        <EnviromentProvider>
          <QueryProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Navbar />
            {children}
          </body>
          </QueryProvider>
        </EnviromentProvider>
      </ThemeProvider>
    </html>
  );
}
