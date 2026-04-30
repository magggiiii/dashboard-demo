import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/tokens.css";
import "../styles/motion.css";
import { CopilotProvider } from "@/components/CopilotProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { CopilotChatProvider } from "@/context/CopilotChatContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Dashboard POC",
  description: "A schema-driven Gen-UI dashboard powered by CopilotKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <CopilotProvider>
              <CopilotChatProvider>
                {children}
              </CopilotChatProvider>
            </CopilotProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
