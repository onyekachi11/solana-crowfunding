import * as anchor from "@coral-xyz/anchor";
// import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";
import toast from "react-hot-toast";

/**
 * For create transaction, campaignKeypair, title, description and amount is needed
 *
 * For fund transaction, just the campaign id and amount is needed.
 *
 * For withdraw transaction, just the campaign id is needed.
 */

export const createUnsignedTransaction = async (
  functionValue: "create" | "fund" | "withdraw",
  program: anchor.Program<anchor.Idl> | undefined,
  payer2: web3.PublicKey,
  options: {
    campaignKeypair?: web3.Keypair;
    amount?: anchor.BN;
    title?: string;
    description?: string;
    campaignId?: string;
  } = {}
) => {
  try {
    if (!payer2) {
      console.error("no payer");
      return;
    }

    let ix: anchor.web3.TransactionInstruction | undefined;
    const { campaignKeypair, title, description, amount, campaignId } = options;

    // Create campaign transaction instruction
    if (functionValue === "create" && campaignKeypair) {
      ix = await program?.methods
        .createCampaign(title, description, amount)
        .accounts({
          campaign: campaignKeypair.publicKey,
          payer: new web3.PublicKey(payer2),
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction();
    }
    // Fund campaign transaction instruction
    if (functionValue === "fund" && campaignId && amount) {
      ix = await program?.methods
        ?.fundCampaign(new anchor.BN(amount))
        .accounts({
          payer: new web3.PublicKey(payer2),
          campaign: campaignId,
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction();
      // .signers([payer])
      // .rpc({ preflightCommitment: "processed", blockhash });
    }
    // Fund campaign transaction instruction
    if (functionValue === "withdraw" && campaignId) {
      ix = await program?.methods
        ?.withdrawFund()
        .accounts({
          creator: payer2,
          campaign: campaignId,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
      // .signers([payer])
      // .rpc({ preflightCommitment: "processed", blockhash });
    }

    if (!ix) {
      throw new Error("Failed to create transaction instruction.");
    }

    // Get the latest blockhash
    const latestBlockhash =
      await program?.provider.connection.getLatestBlockhash();

    // Create a new transaction and add the instruction
    const tx = new web3.Transaction().add(ix);

    // Set the fee payer
    tx.feePayer = new web3.PublicKey(payer2);

    // Set the recent blockhash
    tx.recentBlockhash = latestBlockhash?.blockhash;

    // Partially sign the transaction with campaignKeypair
    campaignKeypair && tx.partialSign(campaignKeypair);

    // Serialize the transaction to return
    const serializedTx = tx.serialize({ requireAllSignatures: false });
    const unsignedTx = bs58.encode(serializedTx);

    return unsignedTx;
  } catch (error: any) {
    console.error("Error creating unsigned transaction:", error);
    toast.error("Error creating transaction");
  }
};
