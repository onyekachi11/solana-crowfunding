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
import { useCanvasContext } from "@/providers/CanvasClient";

export default function MainApp() {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();
  const [dscvrResponse, setDscvrResponse] = useState<any>();
  const [address, setAddress] = useState("");

  const { publicKey, connected, connect, wallets, disconnect } = useWallet();

  const { connection } = useConnection();

  const { setVisible } = useWalletModal();

  const { client, isReady } = useCanvasClient();

  useResizeObserver(client);

  const connections = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  console.log(client);

  const handleConnect = async () => {
    if (client) {
      const response = await client?.connectWallet("solana:103");

      //   console.log(response);
      if (response?.untrusted.success == false) {
        toast.error("Could not connect");
        console.error("Failed to connect wallet", response.untrusted?.error);
        return;
      } else {
        setDscvrResponse(response);
        setAddress(response?.untrusted?.address);
      }
    } else {
      try {
        setVisible(true);
        if (wallets.length > 0) {
          await connect();
        } else {
          console.error("No wallets available");
          toast.error("No wallets available");
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast.error("Failed to connect wallet");
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
    if (isReady) {
      setBodyHeight(900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load program
  useEffect(() => {
    if (typeof window !== "undefined" && window.solana) {
      // Ensure that window.solana exists before creating the provider
      const provider = new anchor.AnchorProvider(connection, window.solana, {
        preflightCommitment: "finalized",
      });

      // Fetch the program or do other actions that require the provider here
      const fetchProgram = async () => {
        try {
          const idl = await anchor.Program.fetchIdl(programId, provider);
          if (idl) {
            const crowdFunderProgram = new anchor.Program(idl, provider);
            setProgram(crowdFunderProgram);
          }
        } catch (error) {
          console.error("Error fetching IDL:", error);
        }
      };

      fetchProgram();
    } else {
      console.error("Solana wallet not found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  const payer = publicKey ? new web3.PublicKey(publicKey) : null;

  const dscvrPayer = dscvrResponse?.untrusted.address;
  const payer2 = dscvrPayer ? new web3.PublicKey(dscvrPayer) : null;

  console.log(payer);

  return (
    <>
      <div className="h-full">
        <Navbar connect={handleConnect} address={address} />
        {/* <p>
          {client?.isReady ? "client.isReady = true" : "client.isReady = false"}
        </p> */}
        {/* <p>{program ? "prgram true" : "program false"}</p> */}
        <CreateCampaign program={program} payer={payer} payer2={payer2} />
        <Suspense fallback={<div> loading</div>}>
          <Campaign program={program} payer={payer} payer2={payer2} />
        </Suspense>
      </div>
    </>
  );
}
