// "use client";
// import * as web3 from "@solana/web3.js";
// import * as anchor from "@coral-xyz/anchor";
// import "dotenv/config";
// import {
//   useWallet,
//   useConnection,
//   useAnchorWallet,
//   AnchorWallet,
// } from "@solana/wallet-adapter-react";

// import { Suspense, useEffect, useState } from "react";
// import Campaign from "@/components/campaign";
// import Navbar from "@/components/Navbar";
// import CreateCampaign from "@/components/createCampaign";
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { useResizeObserver } from "@/hooks/useResizeObserver";
// import { useCanvasClient } from "@/hooks/useCanvasClient";
// import { CanvasInterface, CanvasClient } from "@dscvr-one/canvas-client-sdk";

// import { SOLANA_CHAINS, SOLANA_DEVNET_CHAIN } from "@solana/wallet-standard";
// import { toast } from "react-toastify";

// export default function MainApp() {
//   const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();

//   const connections = new web3.Connection(
//     web3.clusterApiUrl("devnet"),
//     "finalized"
//   );

//   const programId = new web3.PublicKey(
//     "Eis8iYtZBk7HmgBEvgj1soAtCZjqV8mDcRbcqo1U4TPc"
//   );

//   const provider = new anchor.AnchorProvider(
//     connections,
//     window && window.solana,
//     {
//       preflightCommitment: "finalized",
//     }
//   );
//   console.log(provider);

//   // Load program
//   useEffect(() => {
//     const fetchProgram = async () => {
//       try {
//         const idl = await anchor.Program.fetchIdl(programId, provider);
//         if (idl) {
//           const crowdFunderProgram = new anchor.Program(idl, provider);
//           setProgram(crowdFunderProgram);
//         }
//       } catch (error) {
//         console.error("Error fetching IDL:", error);
//       }
//     };

//     fetchProgram();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const payer = provider.publicKey as web3.PublicKey;
//   const payer2 = payer ? new web3.PublicKey(payer?.toJSON()) : null;
//   //   console.log("payer", payer);
//   console.log("payer2", payer2);
//   return (
//     <>
//       <div className="h-full">
//         <Navbar />
//         <p>{program ? "prgram true" : "program false"}</p>
//         <CreateCampaign
//           program={program}
//           payer={payer2}
//           conection={connections}
//         />
//         <Suspense fallback={<div> loading</div>}>
//           <Campaign program={program} payer={payer2} />
//         </Suspense>
//       </div>
//     </>
//   );
// }

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

export default function MainApp() {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();
  const [dscvrResponse, setDscvrResponse] = useState<any>();

  const { publicKey, connected, connect, wallets } = useWallet();

  const { connection } = useConnection();

  const { setVisible } = useWalletModal();

  const { client, user, content, isReady } = useCanvasClient();
  useResizeObserver(client);

  const wallet = useAnchorWallet();

  const connections = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  //   const provider = new anchor.AnchorProvider(connections, window.solana, {
  //     preflightCommitment: "confirmed",
  //   });

  const handleConnect = async () => {
    if (isReady) {
      const response = await client?.connectWallet("solana:103");

      client?.destroy();

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
    if (typeof window !== "undefined" && window.solana) {
      // Ensure that window.solana exists before creating the provider
      const provider = new anchor.AnchorProvider(connections, window.solana, {
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
  const payer3 = program ? program?.provider.publicKey : null;

  const payer2 = dscvrResponse?.untrusted.address;

  console.log(payer, payer2, payer3);

  console.log(payer2 ? new web3.PublicKey(payer2?.toJSON()) : null);

  return (
    <>
      <div className="h-full">
        <Navbar connect={handleConnect} />
        <p>{dscvrResponse?.untrusted?.address}</p>
        <p>{isReady ? "true" : "false"}</p>
        <p>{program ? "prgram true" : "program false"}</p>
        <CreateCampaign
          program={program}
          payer={payer}
          payer2={payer2}
          //   conection={connections}
        />
        <Suspense fallback={<div> loading</div>}>
          <Campaign program={program} payer={payer} />
        </Suspense>
      </div>
    </>
  );
}
