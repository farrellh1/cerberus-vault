import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { ChakraProvider } from "@chakra-ui/react";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cerberus Vault",
  description:
    "Cerberus Vault is a multi signature crypto wallet that will secure your assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>
          <ChakraProvider>
            <Navbar/>
            {children}
          </ChakraProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
