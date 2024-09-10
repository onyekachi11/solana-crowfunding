// "use client";
// import React, { useState } from "react";
// import * as web3 from "@solana/web3.js";
// import * as anchor from "@coral-xyz/anchor";
// import Modal from "./Modal";
// import Button from "./Button";
// import toast from "react-hot-toast";
// import Icon from "./Icon";
// import * as bs58 from "bs58";
// import { IoCloseCircle } from "react-icons/io5";
// import { sign } from "crypto";

// interface Campaign {
//   program: anchor.Program<anchor.Idl> | undefined;
//   payer: web3.PublicKey | null;
//   conection?: web3.Connection;
// }

// const CreateCampaign = ({ program, payer, conection }: Campaign) => {
//   const [openModal, setOpenModal] = useState(false);
//   const [openLinkModal, setOpenLinkModal] = useState(false);
//   const [isCopied, setIsCopied] = useState(false);
//   const [id, setId] = useState<string | null>("");
//   const [title, setTitle] = useState<string | null>(null);
//   const [description, setDescription] = useState<string | null>(null);
//   const [fundingGoal, setFundingGoal] = useState<number | null>(null);

//   const createACampaign = async (
//     title: string,
//     description: string,
//     fundingGoal: number
//   ) => {
//     // Create a new keypair for the campaign account
//     const campaignKeypair = anchor.web3.Keypair.generate();
//     const amount = new anchor.BN(fundingGoal * web3.LAMPORTS_PER_SOL);
//     const toastloading = toast.loading("Loading...");

//     try {
//       if (!payer) {
//         toast.error("no payer");
//         return null;
//       }
//       toastloading;

//       const tx = await program?.methods
//         ?.createCampaign(title, description, amount)
//         .accounts({
//           campaign: new web3.PublicKey(campaignKeypair.publicKey),
//           payer: new web3.PublicKey(payer),
//         })
//         .signers([campaignKeypair])
//         .rpc();

//       setId(campaignKeypair.publicKey.toString());
//       setOpenModal(false);
//       setOpenLinkModal(true);
//       toast.success(`Campaign created successfully!`, {
//         id: toastloading,
//       });

//       return tx;
//     } catch (error) {
//       console.error(error);
//       toast.error(`Error creating campaign`, {
//         id: toastloading,
//       });
//     }
//   };

//   // const shareLink = `http://localhost:3000/?campaignId=${id}`;
//   // const blinkLink = `http://localhost:3000/api/action?campaign_id=${id}`;

//   const shareLink = `https://solana-crowfunding.vercel.app/?campaign_id=${id}`;
//   const blinkLink = `https://solana-crowfunding.vercel.app/api/action?campaign_id=${id}`;

//   const handleCopy = async (link: string) => {
//     try {
//       await navigator.clipboard.writeText(link);
//       setIsCopied(true);
//       setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
//       toast.success("Link copied");
//     } catch (err) {
//       console.error("Failed to copy text: ", err);
//     }
//   };

//   // console.log("campaign", payer);
//   return (
//     <div className=" m-10">
//       <div>
//         <Button name="Create Campaign" onClick={() => setOpenModal(true)} />
//       </div>
//       <div className="mt-20">
//         {openModal && (
//           <Modal>
//             <div className="sm:w-[600px]  h-[700px] py-10 px-10 ">
//               <div className="flex flex-col justify-between h-full ">
//                 <div className="flex  flex-col gap-8 ">
//                   <div className="flex justify-between items-center  mb-3 gap-8">
//                     <p className="font-medium sm:text-[40px] text-[25px]">
//                       Create a campaign
//                     </p>
//                     <div
//                       onClick={() => setOpenModal(false)}
//                       className="cursor-pointer"
//                     >
//                       <IoCloseCircle size={30} />
//                     </div>
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="label" className="font-medium text-[20px]">
//                       Title
//                     </label>
//                     <input
//                       placeholder="campaign title "
//                       onChange={(event) => setTitle(event.target.value)}
//                       className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-6 py-3 w-full"
//                     />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="label" className="font-medium text-[20px]">
//                       Description
//                     </label>
//                     <input
//                       type="textarea"
//                       placeholder="campaign description"
//                       onChange={(event) => setDescription(event.target.value)}
//                       className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-6 py-3 w-full"
//                     />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label htmlFor="label" className="font-medium text-[20px]">
//                       Campaign Goal (SOL)
//                     </label>
//                     <input
//                       type="campaign goal"
//                       placeholder="amount"
//                       onChange={(event) =>
//                         setFundingGoal(Number(event.target.value))
//                       }
//                       className="bg-transparent border border-[#aba2a2b8] outline-none rounded-md px-6 py-3 w-full"
//                     />
//                   </div>
//                 </div>
//                 <Button
//                   name="Submit"
//                   onClick={() => {
//                     if (
//                       title == null ||
//                       description == null ||
//                       fundingGoal == null
//                     ) {
//                       toast(
//                         <span>
//                           <p>Fill up inputs</p>
//                         </span>,
//                         {
//                           icon: <Icon />,
//                         }
//                       );
//                     } else {
//                       createACampaign(title, description, fundingGoal);
//                     }
//                   }}
//                 />
//               </div>
//             </div>
//           </Modal>
//         )}
//       </div>

//       {openLinkModal && (
//         <Modal>
//           <div className="w-[600px] p-9">
//             <div className="flex justify-between items-center">
//               <p className="font-medium text-[20px] ">
//                 Share your campaign link
//               </p>
//               <div
//                 onClick={() => setOpenLinkModal(false)}
//                 className="cursor-pointer"
//               >
//                 <IoCloseCircle size={30} />
//               </div>
//             </div>

//             <div className="flex justify-between items-center  mt-6 gap-2 w-full">
//               <p className="border border-[#aba2a2b8] p-3 w-[72%] overflow-x-auto whitespace-nowrap rounded">
//                 <a href={shareLink}>{shareLink}</a>
//               </p>
//               <Button
//                 name={isCopied ? "Copied!" : "Copy Link"}
//                 onClick={() => handleCopy(shareLink)}
//               />
//             </div>
//           </div>
//           <div className="w-[600px] p-9">
//             <div className="flex justify-between items-center">
//               <p className="font-medium text-[20px] ">Share your blink link</p>
//             </div>

//             <div className="flex justify-between items-center  mt-6 gap-2 w-full">
//               <p className="border border-[#aba2a2b8] p-3 w-[72%] overflow-x-auto whitespace-nowrap rounded">
//                 <a href={blinkLink}>{blinkLink}</a>
//               </p>
//               <Button
//                 name={isCopied ? "Copied!" : "Copy Link"}
//                 onClick={() => handleCopy(blinkLink)}
//               />
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default CreateCampaign;

"use client";
import React, { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import Modal from "./Modal";
import Button from "./Button";
import toast from "react-hot-toast";
import Icon from "./Icon";
import * as bs58 from "bs58";
import { IoCloseCircle } from "react-icons/io5";
import { useCanvasClient } from "@/hooks/useCanvasClient";
import { CanvasInterface } from "@dscvr-one/canvas-client-sdk";

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
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [fundingGoal, setFundingGoal] = useState<number | null>(null);

  const { client, user, content, isReady } = useCanvasClient();

  const createUnsignedTransaction = async (
    campaignKeypair: web3.Keypair,
    signer: web3.PublicKey,
    amount: anchor.BN
  ) => {
    try {
      if (!payer2) {
        console.error("no payer");
        return;
      }
      console.log("before", payer2);

      // Create the transaction instruction
      const ix = await program?.methods
        .createCampaign(title, description, amount)
        .accounts({
          campaign: campaignKeypair.publicKey,
          payer: new web3.PublicKey(payer2),
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction();

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
      tx.partialSign(campaignKeypair);

      // Serialize the transaction to return
      const serializedTx = tx.serialize({ requireAllSignatures: false });
      const unsignedTx = bs58.default.encode(serializedTx);

      console.log("after", payer2);
      return unsignedTx;
    } catch (error: any) {
      console.log("after error", payer2);
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
    // const toastloading = toast.loading("Loading...");

    // toastloading;

    console.log(
      "Campaign Keypair PublicKey:",
      campaignKeypair?.publicKey?.toString()
    );

    if (!campaignKeypair?.publicKey) {
      console.error("Campaign publicKey is undefined");
      toast.error("Campaign publicKey is undefined");
      return;
    }

    if (isReady) {
      if (!payer2) {
        toast.error("no payer");
        return null;
      }
      const toastloading = toast.loading("Loading...");

      try {
        toastloading;

        const unsignedTx = (await createUnsignedTransaction(
          campaignKeypair,
          new web3.PublicKey(payer2),
          amount
        )) as string;
        console.log(unsignedTx);

        const response = await client?.signAndSendTransaction({
          unsignedTx: unsignedTx as string,
          chainId: "solana:103",
        });

        console.log(response);
        if (response?.untrusted?.success === true) {
          setId(campaignKeypair.publicKey.toString());
          setOpenModal(false);
          setOpenLinkModal(true);
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

        // // Wait for confirmation
        // const confirmation = tx && (await waitForConfirmation(tx));
        // if (!confirmation) {
        //   toast.error("Transaction confirmation failed", { id: toastloading });
        //   return null;
        // }
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

  const waitForConfirmation = async (signature: string, timeout = 60000) => {
    const connection = new web3.Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );
    const start = Date.now();
    let status = await connection.getSignatureStatus(signature);

    while (Date.now() - start < timeout) {
      if (
        status?.value?.confirmationStatus === "confirmed" ||
        status?.value?.confirmationStatus === "finalized"
      ) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before checking again
      status = await connection.getSignatureStatus(signature);
    }
    return false;
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
