# Quickstart Validation Guide: TituloChain

**Branch**: `001-titulochain-dapp` | **Phase**: 1

---

## Prerequisites

1. Node.js 20+ and npm installed
2. Rust + Cargo installed (`rustup` recommended)
3. Stellar CLI installed: `cargo install --locked stellar-cli`
4. Freighter browser extension installed and switched to **Test Net** (optional — wallet not required for the judge demo flow)
5. A funded testnet account for the signer (funded via Friendbot)

---

## Setup

### Step 1: Install frontend dependencies
```bash
cd web
npm install
```

### Step 2: Deploy the `titulo-verify` Soroban contract

On Windows (PowerShell):
```powershell
.\scripts\deploy.ps1
```

On Linux/macOS:
```bash
./scripts/deploy.sh
```

The deploy script outputs a contract ID. Copy it.

### Step 3: Fund the signer account

Generate a keypair for the server-side signer:
```bash
stellar keys generate signer --network testnet
stellar keys show signer
```

Fund it via Friendbot:
```
https://friendbot.stellar.org?addr=<PUBLIC_KEY>
```

### Step 4: Configure environment variables

Create `web/.env.local`:
```env
NEXT_PUBLIC_TITULO_CONTRACT_ID=<contract_id_from_step_2>
RECORD_SIGNER_SECRET=<secret_key_from_step_3>
NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Step 5: Start the dev server
```bash
cd web
npm run dev
```

Open `http://localhost:3000`.

---

## Validation Scenarios

### Scenario 1: Encumbered title (happy path)
1. Enter `TCT-89012-PM` in the title input field
2. Click "Verify Title"
3. **Expected**: Loading indicator appears, then within 3 seconds:
   - Report shows title number, verification timestamp, and two encumbrances (mortgage + tax lien)
   - No blockchain terminology in the report itself
   - A 12-character token is displayed with a "Copy" button
   - A "View on-chain" link is shown

4. Click "View on-chain"
5. **Expected**: Stellar Expert opens showing the verification transaction on testnet

### Scenario 2: Clean title
1. Enter `TCT-44521-MM`
2. Click "Verify Title"
3. **Expected**: Report shows "No encumbrances found — this title appears clean" (or similar)
4. Token and explorer link still displayed

### Scenario 3: Unknown title
1. Enter `XYZ-99999-ZZ`
2. Click "Verify Title"
3. **Expected**: Error message: title not found. No report rendered.

### Scenario 4: Adverse claim title
1. Enter `CCT-10087-QC`
2. **Expected**: Report shows one adverse claim with creditor and registration date

### Scenario 5: Two-mortgage title
1. Enter `TCT-77341-LG`
2. **Expected**: Report shows two mortgage entries

---

## What to Check in Stellar Expert

After Scenario 1, the explorer link should show:
- Transaction status: **SUCCESS**
- Source account: the signer's public key
- Contract invocation: `titulo-verify` contract, function `record`
- Event: topic `verification`, data contains the title hash, timestamp, and token

---

## Demo Checklist (Judge Walkthrough)

- [ ] Cost per query displayed on page before submission (0.50 USDC)
- [ ] Report renders in under 3 seconds
- [ ] Report is readable without blockchain knowledge
- [ ] Token is copyable
- [ ] Explorer link opens a real testnet transaction
- [ ] x402 payment flow diagram is visible on the page
- [ ] Invalid title number shows a clear error message

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| 503 from `/api/verify` | `RECORD_SIGNER_SECRET` or contract ID missing | Check `web/.env.local` |
| `tx_bad_auth` in Stellar | Wrong network passphrase | Ensure `Networks.TESTNET` is used (it is, by default in `stellar.ts`) |
| Verification times out | Testnet congestion | Wait and retry; have a fallback screenshot ready |
| Contract call simulation fails | Contract not deployed or wrong ID | Re-run deploy script and update `NEXT_PUBLIC_TITULO_CONTRACT_ID` |
