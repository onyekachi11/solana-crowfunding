import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
import { expect } from "chai";

describe("crowdfunding", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;
  const provider = anchor.getProvider();

  let campaignPubkey1: anchor.web3.PublicKey;
  let campaignPubkey2: anchor.web3.PublicKey;

  const payer1 = anchor.web3.Keypair.generate();
  const payer2 = anchor.web3.Keypair.generate();

  // Generate new keypairs for the Campaign accounts
  const campaignKeypair1 = anchor.web3.Keypair.generate();
  const campaignKeypair2 = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to payer1
    const airdropSignature1 = await provider.connection.requestAirdrop(
      payer1.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL in lamports
    );
    await provider.connection.confirmTransaction(airdropSignature1);

    // Airdrop SOL to payer2
    const airdropSignature2 = await provider.connection.requestAirdrop(
      payer2.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL // 2 SOL in lamports
    );
    await provider.connection.confirmTransaction(airdropSignature2);
  });

  it("Creates two campaigns with different users", async () => {
    // Define the campaign details
    const title1 = "Campaign 1";
    const description1 = "This is the first test campaign.";
    const fundingGoal1 = new anchor.BN(3000000000);

    const title2 = "Campaign 2";
    const description2 = "This is the second test campaign.";
    const fundingGoal2 = new anchor.BN(2000000000);

    // // Generate new keypairs for the Campaign accounts
    // const campaignKeypair1 = anchor.web3.Keypair.generate();
    // const campaignKeypair2 = anchor.web3.Keypair.generate();

    // Create the first campaign with payer1
    const cam1 = await program.methods
      .createCampaign(title1, description1, fundingGoal1)
      .accounts({
        campaign: campaignKeypair1.publicKey,
        payer: payer1.publicKey,
      })
      .signers([payer1, campaignKeypair1])
      .rpc();

    // Create the second campaign with payer2
    const cam2 = await program.methods
      .createCampaign(title2, description2, fundingGoal2)
      .accounts({
        campaign: campaignKeypair2.publicKey,
        payer: payer2.publicKey,
      })
      .signers([payer2, campaignKeypair2])
      .rpc();

    // Store the campaign public keys for later use
    campaignPubkey1 = campaignKeypair1.publicKey;
    campaignPubkey2 = campaignKeypair2.publicKey;

    console.log(cam1, cam2);

    // Fetch and log the created campaigns
    const campaignAccount1 = await program.account.campaign.fetch(
      campaignPubkey1
    );
    // console.log("Campaign 1:", campaignAccount1);

    const campaignAccount2 = await program.account.campaign.fetch(
      campaignPubkey2
    );
    // console.log("Campaign 2:", campaignAccount2);
  });

  it("Gets a campaign created by a different user", async () => {
    // Fetch the first campaign using payer2's wallet (different user)
    const campaignAccount = await program.account.campaign.fetch(
      campaignPubkey1
    );

    // Log the fetched campaign to verify correct retrieval
    console.log(
      "Fetched Campaign by Payer2:",
      campaignAccount.fundingGoal.toNumber()
    );

    // Assertions to verify the campaign details
    expect(campaignAccount.title).to.equal("Campaign 1");
    expect(campaignAccount.description).to.equal(
      "This is the first test campaign."
    );
    expect(campaignAccount.creator.toBase58()).to.equal(
      payer1.publicKey.toBase58()
    );
    expect(campaignAccount.fundingGoal.toNumber()).to.equal(3000000000);
  });

  it("Fund campaign", async () => {
    const campaignBalance = await provider.connection.getBalance(
      campaignPubkey1
    );
    const payer2balance = await provider.connection.getBalance(
      payer2.publicKey
    );
    // console.log("Campaign Account Balance:", campaignBalance);
    // console.log("payer 1 Account Balance:", payer2balance);

    program.methods
      .fundCampaign(new anchor.BN(1000000000))
      .accounts({
        payer: payer2.publicKey,
        campaign: campaignPubkey1,
      })
      .signers([payer2])
      .rpc();

    program.methods
      .fundCampaign(new anchor.BN(500000000))
      .accounts({
        payer: payer1.publicKey,
        campaign: campaignPubkey1,
      })
      .signers([payer1])
      .rpc();

    setTimeout(async () => {
      const campaignAccount1 = await program.account.campaign.fetch(
        campaignPubkey1
      );

      console.log("Campaign 1:", campaignAccount1.currentFunding.toNumber());

      const campaignBalanceafter = await provider.connection.getBalance(
        campaignPubkey1
      );
      const payer2balanceafter = await provider.connection.getBalance(
        payer2.publicKey
      );
      console.log("Campaign Account Balance:", campaignBalanceafter);
      // console.log("payer 1 Account Balance:", payer2balanceafter);

      expect(campaignAccount1.currentFunding.toNumber()).to.equal(200000000);
    }, 5000);

    // // Log the fetched campaign to verify correct retrieval
    // console.log("Fetched Campaign by Payer2:", campaignAccount);
  });
});
