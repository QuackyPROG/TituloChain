# TituloChain

Secure Land Title Encumbrance Verification Service.

## Idea
- **Track:** DeFi & RWA / Social Impact
- **Idea #:** N/A (Custom Hackathon Idea)
- **One-liner:** A land title encumbrance verification dApp that records verification proofs on-chain, paired with an HTTP-402 micro-payment model explanation.

## Problem
In the Philippines, buying land or verifying a property's status is plagued by administrative delays and manual verification queues. Property buyers and banks must wait days or weeks for official registry printouts to discover if a title has an outstanding mortgage, a tax lien, or an adverse claim. This opacity leads to transaction friction, double-sale fraud, and lost economic opportunities.

## How it uses Stellar
1. **Soroban Smart Contract (`titulo-verify`):** When a verification is requested, a stateless contract invocation is triggered on Stellar testnet. The `record(title_hash)` function publishes a verification event containing the title's SHA-256 hash and the ledger timestamp to the ledger.
2. **Server-side Signer:** To ensure judges and users can demo the service without setting up a wallet, a server-side pre-funded account automatically signs and pays transaction fees, recording a real testnet ledger entry.
3. **HTTP-402 Micro-payments (x402 explainer):** The dApp presents an explainer detailing the HTTP-402 standard, where each title query costs 0.50 USDC, illustrating a trustless, API-level monetization model for public registry data.

## What works in the demo
- [x] Verification of 5 mock land titles (TCT-89012-PM, TCT-44521-MM, CCT-10087-QC, OCT-00231-PN, TCT-77341-LG)
- [x] Real-time on-chain record creation on Stellar testnet via Soroban contract
- [x] Generation of a copyable 12-character cryptographic verification token
- [x] Link to view the real transaction event log on Stellar Expert explorer
- [x] Static x402 payment flow architecture diagram

## Setup / run
How to run locally:
1. Ensure Node.js 20+ and Cargo are installed.
2. Deploy the contract:
   ```powershell
   # Windows PowerShell
   .\scripts\deploy.ps1
   ```
   ```bash
   # Unix Bash
   ./scripts/deploy.sh
   ```
3. Generate and fund a server-side signer account:
   ```bash
   stellar keys generate signer --network testnet --fund
   ```
4. Copy the signer's secret key and the deployed contract ID into `web/.env.local`:
   ```env
   NEXT_PUBLIC_TITULO_CONTRACT_ID=<deployed_contract_id>
   RECORD_SIGNER_SECRET=<signer_secret_key>
   ```
5. Run the development server:
   ```bash
   cd web
   npm install
   npm run dev
   ```
6. Open `http://localhost:3000` in your browser.

## Submission checklist
- [x] Public GitHub repo with a license (MIT)
- [x] README explains problem, Stellar usage, and setup
- [x] Submitted via the workshop's official GitHub template
