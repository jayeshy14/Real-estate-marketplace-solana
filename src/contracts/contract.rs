use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer, MintTo},
};

declare_id!("J3oYDmKG4XqhyJvgP6Dd74tH5u9LByezSkacHLSWDQC9");

#[program]
mod real_estate_marketplace {
    use super::*;

    pub fn initialize_counter(ctx: Context<InitializeCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.building_count = 0;
        Ok(())
    }

    pub fn list_building(
        ctx: Context<ListBuilding>,
        apartments_count: u64,
        apartment_price: u64,
        ipfs_hash: String,
    ) -> Result<()> {
        let building = &mut ctx.accounts.building;
        building.building_id = ctx.accounts.building_mint.key();
        building.lister = ctx.accounts.signer.key();
        building.apartments_count = apartments_count;
        building.remaining_apartments = apartments_count;
        building.apartment_price = apartment_price;
        building.ipfs_hash = ipfs_hash;
        building.sold_out = false;

        let counter = &mut ctx.accounts.counter;
        counter.building_count += 1;

        // Mint NFT for the building
        let cpi_accounts = MintTo {
            mint: ctx.accounts.building_mint.to_account_info(),
            to: ctx.accounts.building_token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        Ok(())
    }

    pub fn buy_apartment(
        ctx: Context<BuyApartment>,
        apartment_count: u64,
    ) -> Result<()> {
        let building = &mut ctx.accounts.building;

        require!(
            apartment_count <= building.remaining_apartments,
            RealEstateError::NotEnoughApartments
        );

        // Calculate the total price
        let total_price = building.apartment_price * apartment_count;

        // Ensure the buyer has enough funds
        let buyer_balance = ctx.accounts.buyer_token_account.amount;
        require!(
            buyer_balance >= total_price,
            RealEstateError::InsufficientFunds
        );

        building.remaining_apartments -= apartment_count;

        if !building.apartment_owners.contains(&ctx.accounts.buyer.key().to_bytes()) {
            building.apartment_owners.push(ctx.accounts.buyer.key().to_bytes());
        }

        if building.remaining_apartments == 0 {
            building.sold_out = true;
        }

        // Transfer funds from buyer to lister
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.lister_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, total_price)?;

        // Mint fractional tokens to the buyer
        let cpi_accounts = MintTo {
            mint: ctx.accounts.fractional_mint.to_account_info(),
            to: ctx.accounts.buyer_fractional_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, apartment_count)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(mut, signer)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + 8,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ListBuilding<'info> {
    #[account(mut, signer)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 4 + (32 * 50) + 4 + 64 + 1,
        seeds = [b"building", signer.key().as_ref(), counter.building_count.to_le_bytes().as_ref()],
        bump
    )]
    pub building: Account<'info, Building>,
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer,
        seeds = [b"building_mint", signer.key().as_ref(), counter.building_count.to_le_bytes().as_ref()],
        bump
    )]
    pub building_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = building_mint,
        associated_token::authority = signer
    )]
    pub building_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer,
        seeds = [b"fractional_mint", signer.key().as_ref(), counter.building_count.to_le_bytes().as_ref()],
        bump
    )]
    pub fractional_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct BuyApartment<'info> {
    #[account(mut, has_one = lister)]
    pub building: Account<'info, Building>,
    #[account(mut)]
    pub lister: Signer<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub lister_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = fractional_mint,
        associated_token::authority = buyer
    )]
    pub buyer_fractional_token_account: Account<'info, TokenAccount>,
    pub fractional_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct Building {
    pub building_id: Pubkey,
    pub lister: Pubkey,
    pub apartments_count: u64,
    pub remaining_apartments: u64,
    pub apartment_price: u64,
    pub apartment_owners: Vec<[u8; 32]>,
    pub ipfs_hash: String,
    pub sold_out: bool,
}

#[account]
pub struct Counter {
    pub building_count: u64,
}

#[error_code]
pub enum RealEstateError {
    #[msg("Not enough apartments available.")]
    NotEnoughApartments,
    #[msg("Insufficient funds to buy the apartment(s).")]
    InsufficientFunds,
}