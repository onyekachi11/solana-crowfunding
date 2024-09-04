import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";

const programId = new web3.PublicKey(
  "Eis8iYtZBk7HmgBEvgj1soAtCZjqV8mDcRbcqo1U4TPc"
);

const connection = new web3.Connection(
  anchor.web3.clusterApiUrl("devnet"),
  "confirmed"
);

const provider = new anchor.AnchorProvider(
  connection,
  {} as anchor.Wallet, // Empty wallet for read-only operations
  { preflightCommitment: "confirmed" }
);

let program: anchor.Program<anchor.Idl>;
let program2: anchor.Program<anchor.Idl> | any;

(async () => {
  try {
    const idl = await anchor.Program.fetchIdl<anchor.Idl>(programId, provider);
    if (idl) {
      program = new anchor.Program<anchor.Idl>(idl, provider);
      program2 = new anchor.Program<anchor.Idl>(idl, provider);
    }
  } catch (error) {
    console.error("Error fetching IDL:", error);
  }
})();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaign_id");

  const campaign: any = await program2?.account.campaign.fetch(
    new web3.PublicKey(campaignId as web3.PublicKeyInitData)
  );

  const response: ActionGetResponse = {
    icon: "https://images.app.goo.gl/dZ8L7Q2TEDYzZ4wb6",
    description: campaign?.description,
    type: "action",
    label: "Fund Campaign",
    title: campaign?.title,
    error: {
      message: "This blink is not implemented yet",
    },
    disabled: campaign.isActive == false,
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
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const postRequest: ActionPostRequest = await request.json();
  const userPubkey = new web3.PublicKey(postRequest.account);

  const url = new URL(request.url);
  const fundAmount = url.searchParams.get("fund_amount");
  const campaignId = url.searchParams.get("campaign_id");

  if (!program) {
    return Response.json(
      { error: "Program not initialized" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }

  try {
    // Prepare the transaction instruction
    const ix = await program.methods
      .fundCampaign(new anchor.BN(Number(fundAmount) * web3.LAMPORTS_PER_SOL))
      .accounts({
        payer: userPubkey,
        campaign: new web3.PublicKey(campaignId as web3.PublicKeyInitData),
      })
      .instruction();

    // Create a new transaction and add the instruction
    const transaction = new web3.Transaction();

    // Set the fee payer
    transaction.feePayer = userPubkey;

    // Get a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const response: ActionPostResponse = {
      transaction: serializedTransaction.toString("base64"),
      message: `Transaction prepared for ${userPubkey.toBase58()}`,
    };
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  } catch (error) {
    console.error("Error preparing transaction:", error);
    return Response.json(
      { error: "Failed to prepare transaction" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

// export const OPTIONS = GET;

// http://localhost:3000/api/action?campaign_id=3W5ve1T9Hjy1uaq1LUG8kemgbCefj7eSnKaz4kWnWSoa
