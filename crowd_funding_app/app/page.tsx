"use client";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import "dotenv/config";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import { Suspense, useEffect, useState } from "react";
import Campaign from "@/components/campaign";
import Navbar from "@/components/Navbar";
import CreateCampaign from "@/components/createCampaign";

export default function Home() {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();

  const { publicKey, connected } = useWallet();

  const network = "devnet";

  const connection = new web3.Connection(
    anchor.web3.clusterApiUrl(network),
    "confirmed"
  );
  // const provider = new anchor.AnchorProvider(connection, window.solana, {
  //   preflightCommitment: "confirmed",
  // });
  // const provider = new anchor.AnchorProvider(connection, {} as anchor.Wallet, {
  //   preflightCommitment: "confirmed",
  // });

  const getWallet = () => {
    if (typeof window !== "undefined" && window.solana) {
      // Browser environment with Solana wallet extension
      return window.solana;
    } else {
      // Node.js environment or deployment
      // You should replace this with your actual keypair or another wallet implementation
      return {} as anchor.Wallet;
    }
  };

  const wallet = getWallet();

  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
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

  // const payer = provider.wallet.publicKey;
  // const payer2 = publicKey ? new web3.PublicKey(publicKey) : null;
  const payer4 = publicKey
    ? new web3.PublicKey(provider.wallet.publicKey)
    : null;
  // console.log("payer", payer);
  // console.log("payer2", publicKey);
  // console.log("payer3", payer2);
  console.log("payer4", payer4);
  return (
    <div className="h-full">
      <Navbar />
      <CreateCampaign program={program} payer={payer4} />
      <Suspense fallback={<div> loading</div>}>
        <Campaign program={program} payer={payer4} />
      </Suspense>
    </div>
  );
}
