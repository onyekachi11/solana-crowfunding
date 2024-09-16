import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  fetchTransaction,
} from "@solana/actions";
import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import Image from "../../../assets/stock-vector.jpg";
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

(async () => {
  try {
    const idl = await anchor.Program.fetchIdl<anchor.Idl>(programId, providers);
    if (idl) {
      program = new anchor.Program<anchor.Idl>(idl, providers);
      program2 = new anchor.Program<anchor.Idl>(idl, providers);
    }
  } catch (error) {
    console.error("Error fetching IDL:", error);
  }
  // }
  // else {
  // console.error("Solana wallet not found");
  // }
})();

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
  const campaignId = url.searchParams.get("campaign_id") as string;

  try {
    if (campaignId) {
      const campaign = await fetchCampaignWithRetries(campaignId);
      const response: ActionGetResponse = {
        icon: "https://res.cloudinary.com/dukepqryi/image/upload/v1726437261/crowdfunder.jpg",
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
                  // pattern,
                  type: "number",
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
      const response: ActionGetResponse = {
        icon: "https://res.cloudinary.com/dukepqryi/image/upload/v1726437261/crowdfunder.jpg",
        description:
          "Easy way to create a crowd funding campaign and reciveve donation with the help of solana blinks.",
        type: "action",
        label: "Fund Campaign",
        title: "Solana CrowdFunder",
        links: {
          actions: [
            {
              label: "Create New Campaign",
              href: `/api/action?title={title}&description={description}&fund_goal={fund_goal}`,

              parameters: [
                {
                  name: "title",
                  label: "Enter title",
                  required: true,
                },
                {
                  name: "description",
                  label: "Enter description",
                  required: true,
                },
                {
                  name: "fund_goal",
                  label: "Enter funding goal",
                  required: true,
                  type: "number",
                  pattern: "^\\d+(\\.\\d{0,2})?$",
                },
              ],
            },
          ],
        },
      };
      return new Response(JSON.stringify(response), {
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
  const title = url.searchParams.get("title");
  const description = url.searchParams.get("description");
  const fund_goal = url.searchParams.get("fund_goal");
  const campaignKeypair = anchor.web3.Keypair.generate();

  console.log(program);

  if (!program) {
    return new Response(JSON.stringify({ error: "Program not initialized" }), {
      status: 500,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  try {
    let ix: anchor.web3.TransactionInstruction;

    if (!campaignId) {
      ix = await program.methods
        .createCampaign(
          title,
          description,
          new anchor.BN(Number(fund_goal) * web3.LAMPORTS_PER_SOL)
        )
        .accounts({
          campaign: new web3.PublicKey(campaignKeypair.publicKey),
          payer: userPubkey,
        })
        .instruction();
    } else {
      if (!campaignId || !fundAmount) {
        return new Response(
          JSON.stringify({ error: "Missing campaign ID or fund amount" }),
          { status: 400, headers: ACTIONS_CORS_HEADERS }
        );
      }
      ix = await program.methods
        .fundCampaign(new anchor.BN(Number(fundAmount) * web3.LAMPORTS_PER_SOL))
        .accounts({
          payer: userPubkey,
          campaign: new web3.PublicKey(campaignId as web3.PublicKeyInitData),
        })
        .instruction();
    }

    const transaction = new web3.Transaction();
    transaction.feePayer = userPubkey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    transaction.add(ix);

    !campaignId && transaction.sign(campaignKeypair);

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    let message: string;

    if (title && description && fund_goal) {
      const url = `Share Link:\nhttps://solana-crowfunding.vercel.app/${campaignKeypair.publicKey.toString()}`;
      const shareBlink = `Share Blink link:\nhttps://dscvr-blinks.vercel.app?action=https://solana-crowfunding.vercel.app/${campaignKeypair.publicKey.toString()}`;

      // Wrap the URL if it's longer than 50 characters
      const wrappedUrl =
        url.length > 50 ? (url.match(/.{1,50}/g) ?? [url]).join("\n") : url;

      // Wrap the Share Blink link similarly
      const wrappedShareBlink =
        shareBlink.length > 50
          ? (shareBlink.match(/.{1,50}/g) ?? [shareBlink]).join("\n")
          : shareBlink;

      const separator = "\u00A0".repeat(30);
      // Ensure clear separation with additional line breaks and maybe a separator like "----"
      message = `${wrappedUrl}\n\n${separator}\n\n${wrappedShareBlink}`;
    } else {
      const userMessage = `Transaction prepared for ${userPubkey.toBase58()}`;

      // Wrap the userMessage if it's longer than 50 characters
      const wrappedUserMessage =
        userMessage.length > 50
          ? (userMessage.match(/.{1,50}/g) ?? [userMessage]).join("\n")
          : userMessage;

      message = wrappedUserMessage;
    }

    const response: ActionPostResponse = {
      transaction: serializedTransaction.toString("base64"),
      message: message,
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

export const OPTIONS = GET;
