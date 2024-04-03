import type { Metadata } from "next";
import "./globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "@/context/auth";
import React from "react";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/mathlive/dist/mathlive-static.css" />
      </head>
      <body>
        <AuthProvider>
          <ChakraProvider>
            <div style={{height:"100%"}}>
              {children}
            </div>
          </ChakraProvider>
        </AuthProvider>
      </body>
    </html>
    
  );
}
