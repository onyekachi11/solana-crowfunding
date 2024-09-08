import MainApp from "@/components/mainApp";
import React, { Suspense } from "react";
import { headers } from "next/headers";
import Script from "next/script";

const Page = () => {
  const nonce: any = headers().get("x-nonce");

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <MainApp />
      </Suspense>
      {/* <Suspense fallback={<p>Loading...</p>}> */}
      <Script
        src="https://www.googletagmanager.com/gtag/js"
        strategy="afterInteractive"
        nonce={nonce}
      />
      {/* </Suspense> */}
    </>
  );
};

export default Page;
