"use client";
import React, { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import Modal from "./Modal";
import Button from "./Button";
import toast from "react-hot-toast";
import Icon from "./Icon";
import { IoCloseCircle } from "react-icons/io5";
import { useCanvasClient } from "@/hooks/useCanvasClient";

interface Campaign {
  program: anchor.Program<anchor.Idl> | undefined;
  payer: web3.PublicKey | null;
  payer2: web3.PublicKey | null;
}

const CreateCampaign = ({ program, payer, payer2 }: Campaign) => {
  const [openModal, setOpenModal] = useState(false);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [id, setId] = useState<string | null>("");
  const [title, setTitle] = useState<string | null>();
  const [description, setDescription] = useState<string | null>();
  const [fundingGoal, setFundingGoal] = useState<number | null>();

  const { client, user, content, isReady } = useCanvasClient();

  // // Helper function to create unsigned transaction for WalletConnect
  // const createUnsignedTransaction = async (
  //   campaignPublicKey: web3.PublicKey,
  //   payer: web3.PublicKey,
  //   amount: anchor.BN
  // ) => {
  //   // Implementation depends on your specific needs
  //   // This is a placeholder
  //   const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  //   const recentBlockhash = await connection.getRecentBlockhash();

  //   const ix = await program?.methods
  //     .createCampaign(title, description, new anchor.BN(amount))
  //     .accounts({
  //       campaign: campaignPublicKey,
  //       payer: payer,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .instruction();

  //   const tx = new web3.Transaction();

  //   tx.recentBlockhash = recentBlockhash.blockhash;
  //   tx.feePayer = payer && payer;

  //   tx.add(ix as web3.TransactionInstruction);
  //   return tx.serialize({ verifySignatures: false }).toString("base64");
  // };

  const createUnsignedTransaction = async (
    campaignPublicKey: web3.PublicKey,
    payer: web3.PublicKey,
    amount: anchor.BN
  ) => {
    try {
      // // Connect to Solana cluster (ensure this is correct: devnet, testnet, mainnet)
      // const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

      // // Get the most recent blockhash from the Solana network
      // const { blockhash } = await connection.getRecentBlockhash();
      // console.log("Recent Blockhash:", blockhash); // Log blockhash for debugging

      // Create the transaction instruction using your Anchor program
      const ix = await program?.methods
        .createCampaign(title, description, amount)
        .accounts({
          campaign: campaignPublicKey,
          payer: payer,
          // systemProgram: web3.SystemProgram.programId, // Ensure System Program is used
        })
        .rpc();
      // .instruction();

      // Check if instruction is valid
      if (!ix) {
        throw new Error("Failed to create transaction instruction.");
      }

      // // Create a new transaction object
      // const tx = new web3.Transaction();
      // tx.recentBlockhash = blockhash; // Set the recent blockhash
      // tx.feePayer = payer; // Set the payer for transaction fees

      // // Add the instruction to the transaction
      // tx.add(ix as web3.TransactionInstruction);
      // console.log("Transaction object created:", tx); // Log transaction object for debugging

      // // Serialize the transaction for sending to DSCVR Canvas or web client
      // const serializedTx = tx
      //   .serialize({ verifySignatures: false })
      //   .toString("base64");
      // console.log("Serialized transaction (base64):", serializedTx); // Log serialized tx for verification

      // Return the serialized transaction
      return ix;
    } catch (error: any) {
      console.error("Error creating unsigned transaction:", error);
      throw new Error(`Transaction creation failed: ${error}`);
    }
  };

  const createACampaign = async (
    title: string,
    description: string,
    fundingGoal: number
  ) => {
    // Create a new keypair for the campaign account
    const campaignKeypair = anchor.web3.Keypair.generate();
    const amount = new anchor.BN(fundingGoal * web3.LAMPORTS_PER_SOL);
    const toastloading = toast.loading("Loading...");

    toastloading;

    if (isReady) {
      if (!payer2) {
        toast.error("no payer");
        return null;
      }
      // const tnx = await createtx();

      const unsignedTx = await createUnsignedTransaction(
        campaignKeypair.publicKey,
        payer2,
        amount
      );

      await client?.signAndSendTransaction({
        unsignedTx: unsignedTx,
        chainId: "solana:103",
        awaitCommitment: "confirmed",
      });
    } else {
      try {
        if (!payer) {
          toast.error("no payer");
          return null;
        }
        const tx = await program?.methods
          ?.createCampaign(title, description, amount)
          .accounts({
            campaign: new web3.PublicKey(campaignKeypair.publicKey),
            payer: payer,
          })
          .signers([campaignKeypair])
          .rpc();
        setId(campaignKeypair.publicKey.toString());
        setOpenModal(false);
        setOpenLinkModal(true);
        toast.success(`Campaign created successfully!`, {
          id: toastloading,
        });

        return tx;
      } catch (error) {
        console.error(error);
        toast.error(`Error creating campaign`, {
          id: toastloading,
        });
      }
    }
  };

  // const shareLink = `http://localhost:3000/?campaignId=${id}`;
  // const blinkLink = `http://localhost:3000/api/action?campaign_id=${id}`;

  const shareLink = `https://solana-crowfunding.vercel.app/?campaign_id=${id}`;
  const blinkLink = `https://solana-crowfunding.vercel.app/api/action?campaign_id=${id}`;

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
      toast.success("Link copied");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // console.log("campaign", payer);
  return (
    <div className=" m-10">
      <div>
        <Button name="Create Campaign" onClick={() => setOpenModal(true)} />
      </div>
      <div className="mt-20">
        {openModal && (
          <Modal>
            <div className="sm:w-[600px]  h-[700px] py-10 px-10 ">
              <div className="flex flex-col justify-between h-full ">
                <div className="flex  flex-col gap-8 ">
                  <div className="flex justify-between items-center  mb-3 gap-8">
                    <p className="font-medium sm:text-[40px] text-[25px]">
                      Create a campaign
                    </p>
                    <div
                      onClick={() => setOpenModal(false)}
                      className="cursor-pointer"
                    >
                      <IoCloseCircle size={30} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="label" className="font-medium text-[20px]">
                      Title
                    </label>
                    <input
                      placeholder="campaign title "
                      onChange={(event) => setTitle(event.target.value)}
                      className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-6 py-3 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="label" className="font-medium text-[20px]">
                      Description
                    </label>
                    <input
                      type="textarea"
                      placeholder="campaign description"
                      onChange={(event) => setDescription(event.target.value)}
                      className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-6 py-3 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="label" className="font-medium text-[20px]">
                      Campaign Goal (SOL)
                    </label>
                    <input
                      type="campaign goal"
                      placeholder="amount"
                      onChange={(event) =>
                        setFundingGoal(Number(event.target.value))
                      }
                      className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-6 py-3 w-full"
                    />
                  </div>
                </div>
                <Button
                  name="Submit"
                  onClick={() => {
                    if (
                      title == null ||
                      description == null ||
                      fundingGoal == null
                    ) {
                      toast(
                        <span>
                          <p>Fill up inputs</p>
                        </span>,
                        {
                          icon: <Icon />,
                        }
                      );
                    } else {
                      createACampaign(title, description, fundingGoal);
                    }
                  }}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>

      {openLinkModal && (
        <Modal>
          <div className="w-[600px] p-9">
            <div className="flex justify-between items-center">
              <p className="font-medium text-[20px] ">
                Share your campaign link
              </p>
              <div
                onClick={() => setOpenLinkModal(false)}
                className="cursor-pointer"
              >
                <IoCloseCircle size={30} />
              </div>
            </div>

            <div className="flex justify-between items-center  mt-6 gap-2 w-full">
              <p className="border border-[#aba2a2b8] p-3 w-[72%] overflow-x-auto whitespace-nowrap rounded">
                <a href={shareLink}>{shareLink}</a>
              </p>
              <Button
                name={isCopied ? "Copied!" : "Copy Link"}
                onClick={() => handleCopy(shareLink)}
              />
            </div>
          </div>
          <div className="w-[600px] p-9">
            <div className="flex justify-between items-center">
              <p className="font-medium text-[20px] ">Share your blink link</p>
            </div>

            <div className="flex justify-between items-center  mt-6 gap-2 w-full">
              <p className="border border-[#aba2a2b8] p-3 w-[72%] overflow-x-auto whitespace-nowrap rounded">
                <a href={blinkLink}>{blinkLink}</a>
              </p>
              <Button
                name={isCopied ? "Copied!" : "Copy Link"}
                onClick={() => handleCopy(blinkLink)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CreateCampaign;
