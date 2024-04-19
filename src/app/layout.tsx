import type { Metadata } from "next";
import "./globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "@/context/auth";
import React from "react";


export const metadata: Metadata = {
  title: "Mathtoro",
  description: "[Mathtoro]数式チャットアプリ~数学を効率的に~",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/mathlive/dist/mathlive-static.css" />
      </head>
      <body>
        <AuthProvider>
          <ChakraProvider>
            {children}
          </ChakraProvider>
        </AuthProvider>
      </body>
    </html>
    
  );
}
