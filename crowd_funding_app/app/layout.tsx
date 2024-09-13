import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConnectWallet from "@/providers/connectWallet";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import { CanvasProvider } from "@/providers/CanvasClient";
import { Suspense } from "react";
import MainApp from "@/components/mainApp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crowd Funder",
  description: "",
  other: {
    "dscvr:canvas:version": "vNext",
    "og:image": "https://my-canvas.com/preview-image.png",
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
          {/* <CanvasProvider> */}
          <Suspense fallback={<p>Loading...</p>}>
            <MainApp />
          </Suspense>
          {children}
          <ToastContainer />
          <Toaster position="bottom-right" />
          {/* </CanvasProvider> */}
        </ConnectWallet>
      </body>
    </html>
  );
}
