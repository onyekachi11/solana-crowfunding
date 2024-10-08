import MainApp from "@/components/mainApp";
import React, { Suspense } from "react";
import { headers } from "next/headers";
import Script from "next/script";

const Page = () => {
  const nonce: any = headers().get("x-nonce");

  return (
    <>
      {/* <Suspense fallback={<p>Loading...</p>}>
        <MainApp />
      </Suspense> */}
      <link
        rel="preload"
        href="https://www.googletagmanager.com/gtag/js"
        as="script"
      ></link>
      <Script
        src="https://www.googletagmanager.com/gtag/js"
        strategy="afterInteractive"
        nonce={nonce}
      />
    </>
  );
};

export default Page;
