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
import { useCanvasContext } from "@/providers/CanvasClient";
import Link from "next/link";
import { createUnsignedTransaction } from "@/app/uils";
import { useRouter } from "next/navigation";

interface Campaign {
  program: anchor.Program<anchor.Idl> | undefined;
  payer: web3.PublicKey | null;
  payer2: web3.PublicKey | null;
}

const CreateCampaign = ({ program, payer, payer2 }: Campaign) => {
  const [openModal, setOpenModal] = useState(false);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isBlinkCopied, setBlinkCopied] = useState(false);
  const [id, setId] = useState<string | null>("");
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [fundingGoal, setFundingGoal] = useState<number | null>(null);

  const { client, user, content, isReady } = useCanvasClient();
  const router = useRouter();

  const createACampaign = async (
    title: string,
    description: string,
    fundingGoal: number
  ) => {
    // Create a new keypair for the campaign account
    const campaignKeypair = anchor.web3.Keypair.generate();
    const amount = new anchor.BN(fundingGoal * web3.LAMPORTS_PER_SOL);

    if (!campaignKeypair?.publicKey) {
      console.error("Campaign publicKey is undefined");
      toast.error("Campaign publicKey is undefined");
      return;
    }
    if (!program) {
      console.error("Program not loaded, Pls refresh");
      return;
    }

    if (isReady) {
      //this is for canvas

      if (!payer2) {
        toast.error("no payer");
        return null;
      }
      const toastloading = toast.loading("Loading...");

      try {
        toastloading;

        const unsignedTx = (await createUnsignedTransaction(
          "create",
          program,
          payer2,
          {
            amount: amount,
            title: title,
            description: description,
            campaignKeypair: campaignKeypair,
          }
        )) as string;

        console.log(unsignedTx);

        const response = await client?.signAndSendTransaction({
          unsignedTx: unsignedTx as string,
          chainId: "solana:103",
        });

        if (response?.untrusted?.success === true) {
          setId(campaignKeypair.publicKey.toString());
          setOpenModal(false);
          setOpenLinkModal(true);
          router.push(`/${id}`);
          toast.success(`Campaign created successfully!`, {
            id: toastloading,
          });
        } else {
          toast.error(`Error creating campaign`, {
            id: toastloading,
          });
        }
      } catch (e) {
        if (e) {
          console.error(e);
          toast.error(`FAILED`, {
            id: toastloading,
          });
          return null;
        }
      }
    } else {
      //this is for norma  app
      const toastloading = toast.loading("Loading...");
      try {
        if (!payer) {
          toast.error("no payer");
          return null;
        }

        toastloading;

        const tx = await program?.methods
          ?.createCampaign(title, description, amount)
          .accounts({
            campaign: new web3.PublicKey(campaignKeypair.publicKey),
            payer: new web3.PublicKey(payer),
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

  // const shareLink = `https://clusters-tender-twins-dating.trycloudflare.com/${id}`;
  const shareLink = `https://solana-crowfunding.vercel.app/${id}`;
  // const blinkLink = `https://solana-crowfunding.vercel.app/api/action?campaign_id=${id}`;
  const blinkLink = `https://dscvr-blinks.vercel.app?action=https://solana-crowfunding.vercel.app/api/action?campaign_id=${id}`;

  // const handleCopy = async (link: string, value: "share" | "blink") => {
  //   const response = await client?.copyToClipboard(link);
  //   if (response?.untrusted.success === true) {
  //     if (value === "share") {
  //       setIsCopied(true);
  //     } else if (value === "blink") {
  //       setBlinkCopied(true);
  //     }
  //     setTimeout(() => {
  //       if (value === "share") {
  //         setIsCopied(false);
  //       } else if (value === "blink") {
  //         setBlinkCopied(false);
  //       }
  //     }, 2000); // Reset copied state after 2 seconds
  //   } else {
  //     console.error("Failed to copy text: ");
  //     toast.error("Failed to copy text: ");
  //   }
  // };

  const handleCopy = async (link: string, value: "share" | "blink") => {
    function copy() {
      const stateMap = {
        share: setIsCopied,
        blink: setBlinkCopied,
      };
      // Set the relevant state to true
      const setState = stateMap[value];
      if (setState) {
        setState(true);

        // Reset the state to false after 2 seconds
        setTimeout(() => {
          setState(false);
        }, 2000);
      }
    }

    if (isReady) {
      try {
        const response = await client?.copyToClipboard(link);
        if (response?.untrusted.success === true) {
          copy();
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
        await navigator.clipboard.writeText(link);
        copy();
        toast.success("Link copied");
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text: ");
      }
    }
  };

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
                {/* <a href={shareLink}>{shareLink}</a> */}
                <Link href={`/${id}`}>{shareLink}</Link>
              </p>
              <Button
                name={isCopied ? "Copied!" : "Copy Link"}
                onClick={() => handleCopy(shareLink, "share")}
              />
            </div>
          </div>
          <div className="w-[600px] p-9">
            <div className="flex justify-between items-center">
              <p className="font-medium text-[20px] ">Share your blink link</p>
            </div>

            <div className="flex justify-between items-center  mt-6 gap-2 w-full">
              <p className="border border-[#aba2a2b8] p-3 w-[72%] overflow-x-auto whitespace-nowrap rounded">
                <Link href={`/${blinkLink}`}>{blinkLink}</Link>
              </p>
              <Button
                name={isBlinkCopied ? "Copied!" : "Copy Link"}
                onClick={() => handleCopy(blinkLink, "blink")}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CreateCampaign;

// const val = async (
//   response: CanvasInterface.User.ConnectWalletResponse
// ) => {
//   // We don't need to call connectWallet again here, as it's already done by connectWalletAndSendTransaction
//   console.log("inside val", response);
//   return new Promise<CanvasInterface.User.UnsignedTransaction>(
//     (resolve) => {
//       resolve({ unsignedTx, awaitCommitment: "confirmed" });
//     }
//   );
// };

// const response = client?.connectWalletAndSendTransaction(
//   "solana:103",
//   val
// );

// console.log("outside val", response);
