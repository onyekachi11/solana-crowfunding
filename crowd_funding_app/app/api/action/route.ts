import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  fetchTransaction,
} from "@solana/actions";
import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
// import { useWallet } from "@solana/wallet-adapter-react";

const programId = new web3.PublicKey(
  "Eis8iYtZBk7HmgBEvgj1soAtCZjqV8mDcRbcqo1U4TPc"
);

const connection = new web3.Connection(
  anchor.web3.clusterApiUrl("devnet"),
  "confirmed"
);

const providers = new anchor.AnchorProvider(
  connection,
  {} as anchor.Wallet, // Empty wallet for read-only operations
  { preflightCommitment: "confirmed" }
);

// const provider = new anchor.AnchorProvider(connection, window.solana, {
//   preflightCommitment: "finalized",
// });

let program: anchor.Program<anchor.Idl>;
let program2: anchor.Program<anchor.Idl> | any;

// console.log(program, program2);

(async () => {
  // const { publicKey, connected, connect, wallets, disconnect, wallet } =
  //   useWallet();

  // const provider = new anchor.AnchorProvider(
  //   connection,
  //   wallet?.adapter as unknown as anchor.Wallet, // Empty wallet for read-only operations
  //   { preflightCommitment: "confirmed" }
  // );

  try {
    const idl = await anchor.Program.fetchIdl<anchor.Idl>(programId, providers);
    if (idl) {
      program = new anchor.Program<anchor.Idl>(idl, providers);
      program2 = new anchor.Program<anchor.Idl>(idl, providers);
    }
    console.log(program2);
  } catch (error) {
    console.error("Error fetching IDL:", error);
  }
  // }
  // else {
  // console.error("Solana wallet not found");
  // }
})();

// export async function GET(request: Request) {
//   const url = new URL(request.url);
//   const campaignId = url.searchParams.get("campaign_id");

//   if (!campaignId) {
//     return new Response(
//       JSON.stringify({ error: "Missing campaign_id parameter" }),
//       { status: 400, headers: ACTIONS_CORS_HEADERS }
//     );
//   }

//   try {
//     const campaign: any = await program2?.account.campaign.fetch(
//       new web3.PublicKey(campaignId)
//     );

//     console.log(campaign);

//     if (campaign) {
//       const response: ActionGetResponse = {
//         icon: "https://images.app.goo.gl/dZ8L7Q2TEDYzZ4wb6",
//         description: campaign?.description,
//         type: "action",
//         label: "Fund Campaign",
//         title: campaign?.title,
//         disabled: campaign?.isActive === false,
//         links: {
//           actions: [
//             {
//               label: "Fund 0.1 SOL",
//               href: `/api/action?campaign_id=${campaignId}&fund_amount=0.1`,
//             },
//             {
//               label: "Fund 1 SOL",
//               href: `/api/action?campaign_id=${campaignId}&fund_amount=1`,
//             },
//             {
//               label: "Fund 5 SOL",
//               href: `/api/action?campaign_id=${campaignId}&fund_amount=5`,
//             },
//             {
//               label: "Enter amount to fund",
//               href: `/api/action?campaign_id=${campaignId}&fund_amount={amount}`,
//               parameters: [
//                 {
//                   name: "amount",
//                   label: "Enter amount",
//                   required: false,
//                 },
//               ],
//             },
//           ],
//         },
//       };
//       return new Response(JSON.stringify(response), {
//         headers: ACTIONS_CORS_HEADERS,
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching campaign:", error);
//     return new Response(JSON.stringify({ error: "Failed to fetch campaign" }), {
//       status: 500,
//       headers: ACTIONS_CORS_HEADERS,
//     });
//   }
// }

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry logic to fetch campaign data with a delay and timeout
async function fetchCampaignWithRetries(
  campaignId: string,
  retries: number = 5,
  delayMs: number = 1000
): Promise<any> {
  let campaign = null;
  for (let i = 0; i < retries; i++) {
    try {
      campaign = await program2?.account.campaign.fetch(
        new web3.PublicKey(campaignId)
      );
      if (campaign) {
        return campaign; // Return campaign if successful
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
    }
    await delay(delayMs); // Wait before retrying
  }
  throw new Error("Failed to fetch campaign after multiple attempts");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaign_id");

  if (!campaignId) {
    return new Response(
      JSON.stringify({ error: "Missing campaign_id parameter" }),
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  try {
    const campaign = await fetchCampaignWithRetries(campaignId);

    if (campaign) {
      const response: ActionGetResponse = {
        icon: "https://images.app.goo.gl/dZ8L7Q2TEDYzZ4wb6",
        description: campaign?.description,
        type: "action",
        label: "Fund Campaign",
        title: campaign?.title,
        disabled: campaign?.isActive === false,
        links: {
          actions: [
            {
              label: "Fund 0.1 SOL",
              href: `/api/action?campaign_id=${campaignId}&fund_amount=0.1`,
            },
            {
              label: "Fund 1 SOL",
              href: `/api/action?campaign_id=${campaignId}&fund_amount=1`,
            },
            {
              label: "Fund 5 SOL",
              href: `/api/action?campaign_id=${campaignId}&fund_amount=5`,
            },
            {
              label: "Enter amount to fund",
              href: `/api/action?campaign_id=${campaignId}&fund_amount={amount}`,
              parameters: [
                {
                  name: "amount",
                  label: "Enter amount",
                  required: false,
                },
              ],
            },
          ],
        },
      };
      return new Response(JSON.stringify(response), {
        headers: ACTIONS_CORS_HEADERS,
      });
    } else {
      // Handle case where campaign is null/undefined
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch campaign" }), {
      status: 500,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
}

export async function POST(request: Request) {
  const postRequest: ActionPostRequest = await request.json();
  const userPubkey = new web3.PublicKey(postRequest.account);

  const url = new URL(request.url);
  const fundAmount = url.searchParams.get("fund_amount");
  const campaignId = url.searchParams.get("campaign_id");

  if (!program) {
    return new Response(JSON.stringify({ error: "Program not initialized" }), {
      status: 500,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  if (!campaignId || !fundAmount) {
    return new Response(
      JSON.stringify({ error: "Missing campaign ID or fund amount" }),
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  try {
    const ix = await program.methods
      .fundCampaign(new anchor.BN(Number(fundAmount) * web3.LAMPORTS_PER_SOL))
      .accounts({
        payer: userPubkey,
        campaign: new web3.PublicKey(campaignId as web3.PublicKeyInitData),
      })
      .instruction();

    const transaction = new web3.Transaction();
    transaction.feePayer = userPubkey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    transaction.add(ix);

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const response: ActionPostResponse = {
      transaction: serializedTransaction.toString("base64"),
      message: `Transaction prepared for ${userPubkey.toBase58()}`,
    };
    return new Response(JSON.stringify(response), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error preparing transaction:", error);
    return new Response(
      JSON.stringify({ error: "Failed to prepare transaction" }),
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

// export async function OPTIONS(request: Request) {
//   return new Response(null, {
//     headers: {
//       ...ACTIONS_CORS_HEADERS,
//       "Content-Length": "0", // No content in OPTIONS response
//     },
//   });
// }

export const OPTIONS = GET;

// http://localhost:3000/api/action?campaign_id=3W5ve1T9Hjy1uaq1LUG8kemgbCefj7eSnKaz4kWnWSoa
