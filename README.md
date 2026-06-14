# TituloChain

A land title encumbrance verification dApp that records verification proofs on-chain, paired with an HTTP-402 micro-payment model explanation.

## Problem
In the Philippines, verifying land titles is slow and prone to fraud. Buyers and institutions must wait days or weeks for manual registry printouts to discover if a title is clean or encumbered (by mortgages, tax liens, etc.), resulting in transaction friction.

## How It Works
1. **Search**: Enter a Philippine land title number.
2. **On-chain Record**: The app simulates and writes a verification proof to the Stellar testnet, generating a 12-character cryptographic token.
3. **Verify**: View the transaction log directly on Stellar Expert.

## How It Uses Stellar
- **Soroban Smart Contract (`titulo-verify`)**: Invokes the `record(title_hash)` function to log SHA-256 title verification events on-chain.
- **Server-side Signer**: Automatically signs and pays transaction fees using a pre-funded testnet account for instant, wallet-free demos.
- **HTTP-402 Payments**: Simulates API-level monetization, charging 0.50 USDC per title query via trustless micropayments.

## Track
Track 3: DeFi, Stablecoins & Real-World Assets & Track 5: Social Impact

## Tech Stack
- **Framework**: Next.js 16 (TypeScript + Tailwind CSS v4)
- **Stellar SDK**: `@stellar/stellar-sdk` v15.1.0
- **Smart Contracts**: Rust / Soroban
- **Network**: Stellar Testnet

## Setup & Run
```bash
# Clone the repository
git clone https://github.com/QuackyPROG/TituloChain.git
cd TituloChain

# 1. Build and Deploy Contracts
.\scripts\deploy.ps1 # Windows
# or ./scripts/deploy.sh # Linux/macOS

# 2. Fund server-side signer
stellar keys generate signer --network testnet --fund

# 3. Configure web/.env.local
# Set RECORD_SIGNER_SECRET with signer secret key
# Set NEXT_PUBLIC_TITULO_CONTRACT_ID with the deployed contract ID

# 4. Run frontend
cd web
npm install
npm run dev
```

## Network Details
- **Network**: Stellar Testnet
- **RPC URL**: `https://soroban-testnet.stellar.org`
- **Horizon URL**: `https://horizon-testnet.stellar.org`
- **Contract ID**: `CCWAU5H7TRFTVMTWAG4VAIVNNOLP7GO4ICFLOMDOL62IAUXSDKXUNBVF`

## Test Title Numbers
Use these to test the dApp:
- `TCT-89012-PM`: Rodrigo Santos Villanueva (1 mortgage, 1 tax lien)
- `TCT-44521-MM`: Maria Consolacion Reyes (Clean)
- `CCT-10087-QC`: Alicia Bautista Tan (1 adverse claim)
- `OCT-00231-PN`: Heirs of Eduardo Cruz (1 mortgage)
- `TCT-77341-LG`: Roberto Hernandez Dela Cruz (2 mortgages)

## Team
- **QuackDev** — @QuackDev

## License
MIT
