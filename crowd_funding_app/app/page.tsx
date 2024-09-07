"use client";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import "dotenv/config";
import {
  useWallet,
  useConnection,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";

import { Suspense, useEffect, useState } from "react";
import Campaign from "@/components/campaign";
import Navbar from "@/components/Navbar";
import CreateCampaign from "@/components/createCampaign";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { useCanvasClient } from "@/hooks/useCanvasClient";
import { CanvasInterface, CanvasClient } from "@dscvr-one/canvas-client-sdk";

import { SOLANA_CHAINS, SOLANA_DEVNET_CHAIN } from "@solana/wallet-standard";
import { toast } from "react-toastify";

export default function Home() {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();
  const [dscvrResponse, setDscvrResponse] = useState<any>();

  const { publicKey, connected, connect, wallets } = useWallet();

  const { connection } = useConnection();

  const { setVisible } = useWalletModal();

  const network = "devnet";

  const { client, user, content, isReady } = useCanvasClient();
  useResizeObserver(client);

  // client.

  const wallet = useAnchorWallet();
  const provider = new anchor.AnchorProvider(
    connection,
    wallet as anchor.Wallet,
    {
      preflightCommitment: "confirmed",
    }
  );

  const handleConnect = async () => {
    if (isReady) {
      const response = await client?.connectWallet("solana:103");

      if (response?.untrusted.success == false) {
        toast.error("Could not connect");
        console.error("Failed to connect wallet", response.untrusted?.error);
        return;
      } else {
        setDscvrResponse(response);
      }
    } else {
      try {
        setVisible(true);
        if (wallets.length > 0) {
          await connect();
        } else {
          console.error("No wallets available");
          // You might want to show a user-friendly message here
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };

  const programId = new web3.PublicKey(
    "Eis8iYtZBk7HmgBEvgj1soAtCZjqV8mDcRbcqo1U4TPc"
  );

  //set discover heights
  useEffect(() => {
    const setBodyHeight = (height: number) => {
      document.body.style.height = height ? `${height}px` : "";
    };
    if (!isReady) {
      setBodyHeight(900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load program
  useEffect(() => {
    if (!provider) return;

    const fetchProgram = async () => {
      try {
        const idl = await anchor.Program.fetchIdl<anchor.Idl>(
          programId,
          provider
        );
        if (idl) {
          const crowdFunderProgram = new anchor.Program<anchor.Idl>(
            idl,
            // programId,
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

  const payer = publicKey
    ? new web3.PublicKey(provider.wallet.publicKey)
    : null;

  const payer2 =
    dscvrResponse && new web3.PublicKey(dscvrResponse?.untrusted?.address);

  // console.log("payer4", payer);
  return (
    <div className="h-full">
      <Navbar connect={handleConnect} />
      <p>{dscvrResponse?.untrusted?.address}</p>
      <p>{isReady ? "true" : "false"}</p>
      <p>{program ? "prgram true" : "program false"}</p>
      <CreateCampaign program={program} payer={payer} payer2={payer2} />
      <Suspense fallback={<div> loading</div>}>
        <Campaign program={program} payer={payer} />
      </Suspense>
    </div>
  );
}
