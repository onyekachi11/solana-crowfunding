use anchor_lang::prelude::*;
// use std::mem::size_of;

declare_id!("Eis8iYtZBk7HmgBEvgj1soAtCZjqV8mDcRbcqo1U4TPc");

#[program]
pub mod crowdfunding {

    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        funding_goal: u64,
    ) -> Result<Pubkey> {
        require!(funding_goal > 0, CrowdfundingError::InvalidFundingGoal);

        let campaign = &mut ctx.accounts.campaign;
        campaign.title = title;
        campaign.description = description;
        campaign.funding_goal = funding_goal;
        campaign.current_funding = 0;
        campaign.is_active = true;
        campaign.creator = ctx.accounts.payer.key();

        Ok(ctx.accounts.campaign.key())
    }
    pub fn get_campaign(_ctx: Context<GetCampaign>) -> Result<()> {
        Ok(())
    }

    pub fn fund_campaign(ctx: Context<FundCampaign>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let payer = &mut ctx.accounts.payer;

        require!(
            campaign.is_active == true,
            CrowdfundingError::CampaignInactive
        );

        msg!(
            "Attempting to transfer {} lamports from {} to {}",
            amount,
            payer.key(),
            campaign.key()
        );

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: payer.to_account_info(),
                    to: campaign.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("Transfer successful. Incrementing current_funding.");

        campaign.current_funding += amount;

        Ok(())
    }

    pub fn withdraw_fund(ctx: Context<WithdrawCampaign>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let creator = &ctx.accounts.creator;

        let amount_to_withdraw = campaign.current_funding;

        // Transfer funds from campaign account to creator
        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount_to_withdraw;
        **creator.to_account_info().try_borrow_mut_lamports()? += amount_to_withdraw;

        // Update campaign state
        campaign.is_active = false;
        campaign.current_funding = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct FundCampaign<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, // The user funding the campaign
    #[account(mut)]
    pub campaign: Account<'info, Campaign>, // The campaign being funded
    pub system_program: Program<'info, System>, // Reference to the Solana system program
}

#[derive(Accounts)]
pub struct WithdrawCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        constraint = campaign.creator == creator.key(),
        constraint = campaign.is_active == true,
        constraint = campaign.current_funding > campaign.funding_goal
    )]
    pub campaign: Account<'info, Campaign>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(init, payer = payer, space =Campaign::LEN)
]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetCampaign<'info> {
    pub campaign: Account<'info, Campaign>,
}

#[account]
pub struct Campaign {
    pub title: String,        //4
    pub description: String,  //4
    pub creator: Pubkey,      //32
    pub funding_goal: u64,    //8
    pub current_funding: u64, //8
    pub is_active: bool,      //1
}

impl Campaign {
    pub const LEN: usize = 8 // Discriminator
        + 4 + 32 // Title: length prefix (4 bytes) + max 32 characters
        + 4 + 256 // Description: length prefix (4 bytes) + max 256 characters
        + 32 // Pubkey (creator)
        + 8 // u64 (funding_goal)
        + 8 // u64 (current_funding)
        + 1; // bool (is_active)
}

#[error_code]
pub enum CrowdfundingError {
    #[msg("Funding goal must be greater than zero")]
    InvalidFundingGoal,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Campaign is inactive")]
    CampaignInactive,
    #[msg("Goal not reached")]
    InsufficientFunds,
}
