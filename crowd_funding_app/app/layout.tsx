import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConnectWallet from "@/providers/connectWallet";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crowd Funder",
  description: "",
  viewport: "width=device-width, initial-scale=1",
  other: {
    "dscvr:canvas:version": "vNext",
    "og:image": "https://my-canvas.com/preview-image.png",
    "Content-Security-Policy":
      "default-src 'self'; connect-src 'self' https://api.dscvr.one https://api1.stg.dscvr.one https://*.helius-rpc.com https://api.devnet.solana.com;",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>
        <ConnectWallet>
          {children}
          <ToastContainer />
          <Toaster position="bottom-right" />
        </ConnectWallet>
      </body>
    </html>
  );
}
