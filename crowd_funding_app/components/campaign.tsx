"use client";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import React, { Suspense, useEffect, useState } from "react";
import Button from "./Button";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParams } from "next/navigation";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { IoCloseCircle } from "react-icons/io5";
import Icon from "./Icon";
import { createUnsignedTransaction } from "@/app/uils";
import { useCanvasContext } from "@/providers/CanvasClient";
import { useCanvasClient } from "@/hooks/useCanvasClient";

interface Campaign {
  program: anchor.Program<anchor.Idl> | any;
  payer: web3.PublicKey | null;
  payer2: web3.PublicKey | null;
  connected?: boolean;
  connection?: web3.Connection;
}

export type CampaignAccount = {
  title: string;
  description: string;
  creator: anchor.web3.PublicKey;
  fundingGoal: anchor.BN;
  currentFunding: anchor.BN;
  isActive: boolean;
};

// Define the account type

const Campaign = ({
  program,
  payer,
  payer2,
  connected,
  connection,
}: Campaign) => {
  const [campaign, setCampaign] = useState<CampaignAccount | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { campaign_id } = useParams();
  const { client, isReady } = useCanvasClient();

  const blinkLink = `https://dscvr-blinks.vercel.app?action=https://solana-crowfunding.vercel.app/api/action?campaign_id=${campaign_id}`;

  const handleCopy = async () => {
    if (isReady) {
      try {
        const response = await client?.copyToClipboard(blinkLink);
        if (response?.untrusted.success === true) {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          // toast.success("Link copied");
        } else {
          console.error("Failed to copy text: ");
          toast.error("Failed to copy text: ");
        }
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text: ");
      }
    } else {
      try {
        await navigator.clipboard.writeText(blinkLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("Link copied");
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text: ");
      }
    }
  };

  const getCampaign = async () => {
    if (!program) {
      console.error("Program not loaded, Pls refresh");
      return;
    }
    const toastLoading = toast.loading("Loading...");

    // toastLoading;
    try {
      const campaignAccount = await program?.account.campaign.fetch(
        campaign_id
      );

      setCampaign(campaignAccount);
      toast.success("Campaign fetched successfully!", {
        id: toastLoading,
      });
      return campaignAccount;
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Error fetching campaign!", {
        id: toastLoading,
      });
    }
  };

  useEffect(() => {
    if (!campaign_id) {
      console.error("No campaign id provided");
      return;
    } else {
      getCampaign();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign_id, program]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fundCampaign = async (amount: number) => {
    if (!program) {
      console.error("Program not loaded, Pls refresh");
      // return;
    }
    if (isReady) {
      if (!payer2) {
        toast.error(`No wallet connected`);
        return;
      }
      const toastLoading = toast.loading("Loading...");

      try {
        const unsignedTx = (await createUnsignedTransaction(
          "fund",
          program,
          payer2,
          {
            campaignId: campaign_id as string,
            amount: new anchor.BN(amount),
          }
        )) as string;

        console.log(unsignedTx);

        const response = await client?.signAndSendTransaction({
          unsignedTx: unsignedTx as string,
          chainId: "solana:103",
        });

        await getCampaign();
        toast.success("Campaign funded successfully!", {
          id: toastLoading,
        });
        setOpenModal(false);

        if (response?.untrusted?.success === true) {
          await getCampaign();
          toast.success("Campaign funded successfully!", {
            id: toastLoading,
          });
          setOpenModal(false);
        } else {
          toast.error(`Error funding campaign`, {
            id: toastLoading,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(`FAILED`, {
          id: toastLoading,
        });
        return null;
      }
    } else {
      let toastLoading: string;
      if (!payer) {
        toast.error("no payer");
        return null;
      } else {
        toastLoading = toast.loading("Loading...");
      }

      try {
        console.log(payer);
        const { blockhash } =
          await program?.provider?.connection.getLatestBlockhash("confirmed");

        const tx = await program?.methods
          ?.fundCampaign(new anchor.BN(amount))
          .accounts({
            campaign: campaign_id,
            payer: new web3.PublicKey(payer.toString()),
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc({
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 5, // Retry confirmation
          });

        await getCampaign();
        toast.success("Campaign funded successfully!", {
          id: toastLoading,
        });
        setOpenModal(false);
        return tx;
      } catch (error: any) {
        setOpenModal(false);
        if (error.message.includes("TransactionExpiredTimeoutError")) {
          toast.error(
            "Transaction is taking longer than expected. Please check the status manually in Solana Explorer.",
            {
              id: toastLoading,
            }
          );
        }
        toast.error("Error funding campaign!", {
          id: toastLoading,
        });
        console.error("Error funding campaign:", error);
      }
    }
  };

  const withdraw = async () => {
    const toastLoading = toast.loading("Loading...");
    if (!program) {
      console.error("Program not loaded, Pls refresh");
      // return;
    }
    if (isReady) {
      if (!payer2) {
        toast.error("no payer");
        return null;
      }
      try {
        const unsignedTx = (await createUnsignedTransaction(
          "withdraw",
          program,
          payer2,
          {
            campaignId: campaign_id as string,
          }
        )) as string;

        console.log(unsignedTx);

        const response = await client?.signAndSendTransaction({
          unsignedTx: unsignedTx as string,
          chainId: "solana:103",
        });

        await getCampaign();
        toast.success("Campaign funded successfully!", {
          id: toastLoading,
        });
        setOpenModal(false);

        if (response?.untrusted?.success === true) {
          await getCampaign();
          toast.success("Campaign funded successfully!", {
            id: toastLoading,
          });
          setOpenModal(false);
        } else {
          toast.error(`Error creating campaign`, {
            id: toastLoading,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(`FAILED`, {
          id: toastLoading,
        });
        return null;
      }
    } else {
      try {
        // const { blockhash } =
        //   await program?.provider?.connection.getLatestBlockhash("confirmed");
        // Call the withdrawFund method on the program
        const tx = await program?.methods
          .withdrawFund()
          .accounts({
            creator: payer,
            campaign: campaign_id,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc({
            skipPreflight: false,
            preflightCommitment: "finalized",
            maxRetries: 5, // Retry confirmation
          });

        await getCampaign();
        toast.success("Funds withdrawn successfully!", {
          id: toastLoading,
        });
        setOpenModal(false);
        return tx;
      } catch (error: any) {
        setOpenModal(false);
        if (error.message.includes("TransactionExpiredTimeoutError")) {
          toast.error(
            "Transaction is taking longer than expected. Please check the status manually in Solana Explorer.",
            {
              id: toastLoading,
            }
          );
        } else {
          toast.error("Error withdrawing funds: " + error.message, {
            id: toastLoading,
          });
        }
        console.error("Error withdrawing funds:", error);
      }
    }
  };

  return (
    <>
      {campaign && (
        <div className=" m-10  p-7 rounded-sm glass flex flex-col gap-5 relative ">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center ">
            <p className="sm:text-[40px] text-[30px] font-semibold">
              {campaign?.title}
            </p>
            <p className="text-gray-400">
              Goal:{" "}
              <span>{Number(campaign.fundingGoal) / LAMPORTS_PER_SOL} </span>{" "}
              SOL /{" "}
              <span>{Number(campaign.currentFunding) / LAMPORTS_PER_SOL}</span>{" "}
              Funded
            </p>
          </div>
          <p className="sm:w-[70%] text-[20px]">{campaign?.description}</p>
          <div className="flex flex-col-reverse sm:flex-row justify-between sm:items-center gap-5">
            {campaign?.isActive === true ? (
              <div className="flex gap-2 items-center text-gray-400">
                <div className=" p-2 h-[4x] w-[4px] rounded-full bg-green-300 "></div>
                <p>Active</p>
              </div>
            ) : (
              <div className="flex gap-2 items-center text-gray-400">
                <div className=" p-2 h-[4x] w-[4px] rounded-full bg-red-400 "></div>
                <p>Inactive</p>
              </div>
            )}
            {!campaign?.isActive === true && (
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  name="Fund Campaign"
                  onClick={() => setOpenModal(true)}
                />
                {/* {creator === newPayerPublicKey && ( */}
                <Button name="Withdraw" onClick={() => withdraw()} />
                {/* )} */}
              </div>
            )}
          </div>
          <div className="w-[600p] mt-6">
            <div className="flex justify-between items-center">
              <p className="font-medium text-[20px] ">Blink link</p>
            </div>

            <div className="flex  flex-col sm:flex-row justify-between items-center  mt-4 gap-5 w-full">
              <p className="border border-[#aba2a2b8] p-3 w-full sm:w-[70%] overflow-x-auto whitespace-nowrap rounded">
                <a href={blinkLink}>{blinkLink}</a>
              </p>
              <div className="sm:w-[30%] sm:max-w-[200px] w-full">
                <Button
                  name={isCopied ? "Copied!" : "Copy Link"}
                  onClick={handleCopy}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {openModal && (
        <Modal>
          <div className="px-5 py-5 sm:py-16 sm:px-16 ">
            <div className="flex justify-between items-center mb-6">
              <p className="font-medium text-[20px] ">Amount to fund</p>
              <div
                onClick={() => setOpenModal(false)}
                className="cursor-pointer"
              >
                <IoCloseCircle size={30} />
              </div>
            </div>
            <div className="flex gap-5">
              <input
                type="text"
                placeholder="amount"
                onChange={(event) => setAmount(Number(event.target.value))}
                className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-4"
              />
              <Button
                name="Submit"
                onClick={() => {
                  if (amount == null) {
                    toast(
                      <span>
                        <p>Fill up inputs</p>
                      </span>,
                      {
                        icon: <Icon />,
                      }
                    );
                  } else {
                    fundCampaign(amount * LAMPORTS_PER_SOL);
                  }
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Campaign;
