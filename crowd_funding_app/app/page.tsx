"use client";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import "dotenv/config";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import { Suspense, useEffect, useState } from "react";
import Campaign from "@/components/campaign";
// import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreateCampaign from "@/components/createCampaign";

export default function Home() {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();

  const network = "devnet";

  const connection = new web3.Connection(
    anchor.web3.clusterApiUrl(network),
    "confirmed"
  );
  // const provider = new anchor.AnchorProvider(connection, window.solana, {
  //   preflightCommitment: "confirmed",
  // });
  const provider = new anchor.AnchorProvider(
    connection,
    {} as anchor.Wallet, // Empty wallet for read-only operations
    { preflightCommitment: "confirmed" }
  );

  const programId = new web3.PublicKey(
    "Eis8iYtZBk7HmgBEvgj1soAtCZjqV8mDcRbcqo1U4TPc"
  );

  // Load program
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const idl = await anchor.Program.fetchIdl<anchor.Idl>(
          programId,
          provider
        );
        if (idl) {
          const crowdFunderProgram = new anchor.Program<anchor.Idl>(
            idl,
            provider
          );
          setProgram(crowdFunderProgram);
        }
      } catch (error) {
        console.error("Error fetching IDL:", error);
      }
    };

    fetchProgram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log("Program loaded", program?.account);

  const payer = provider.wallet.publicKey;

  console.log(connection);
  return (
    <div className="h-screen">
      <Navbar />
      <CreateCampaign program={program} payer={payer} />
      <Suspense fallback={<div>Loading...</div>}>
        <Campaign program={program} payer={payer} programId={programId} />
      </Suspense>
    </div>
  );
}
