# Research: TituloChain dApp

**Branch**: `001-titulochain-dapp` | **Phase**: 0

---

## 1. On-Chain Verification Record Strategy

**Decision**: New Soroban contract `titulo-verify` with a `record(title_hash: BytesN<32>) → Symbol` function, called from a Next.js API route using a server-side signer keypair.

**Rationale**:
- The PRD requires no wallet connection for the judge. A server-side signer solves this without pre-computing transactions.
- A Soroban contract invocation is more visually compelling in Stellar Expert than a plain XLM memo transaction — the judge sees a contract call, not just a payment.
- The existing scaffold's `contract.ts` pattern (build → simulate → assemble → sign → submit → poll) can be reused almost verbatim for the API route.
- Emitting a Soroban event per verification means the data is indexed by the RPC node and retrievable forever.

**Alternatives considered**:
- *Memo-hash on a self-payment*: Faster to build, but less impressive for the demo. No contract visible in explorer. Rejected.
- *Pre-computed transactions*: Avoids server-side secrets, but means on-chain records are fake (same tx every time). Rejected because the PRD says "real transaction."
- *Freighter wallet required*: Simplest Soroban path, but PRD explicitly says "no wallet required to view a report." Rejected.

---

## 2. Verification Token Generation

**Decision**: `TOKEN = (first 12 hex chars of SHA-256(title_number + "|" + ledger_timestamp)).toUpperCase()`

**Rationale**:
- Stateless: can be verified client-side by recomputing from the stored data.
- Short enough to display without truncation (12 chars → e.g., `A3F9C12E8B40`).
- The Soroban contract computes and stores it; the API route returns it to the frontend.
- The Stellar Expert link encodes the transaction hash, not the token, so the token is purely a display artifact.

**Alternatives considered**:
- UUID v4: Not reproducible from the title data; requires the contract to store it. Acceptable but less elegant.
- Full tx hash: Too long to display as a "token." Rejected as the primary token.

---

## 3. Test Title Data

**Decision**: 5 fictional Philippine title numbers with pre-written encumbrance data, stored as a TypeScript constant in `web/src/lib/titles.ts`.

**Title numbers chosen**:
| Title | Type | Encumbrances |
|---|---|---|
| TCT-89012-PM | Transfer Certificate of Title | 1 mortgage, 1 tax lien |
| TCT-44521-MM | Transfer Certificate of Title | Clean (none) |
| CCT-10087-QC | Condominium Certificate | 1 adverse claim |
| OCT-00231-PN | Original Certificate of Title | 1 mortgage |
| TCT-77341-LG | Transfer Certificate of Title | 2 mortgages |

**Rationale**: The PRD demo flow uses "TCT-89012-PM" explicitly (Step 2). Providing both "encumbered" and "clean" titles lets judges see both code paths.

---

## 4. x402 Payment Flow Diagram

**Decision**: Static inline JSX component `<PaymentFlowDiagram />` rendered below the report, using HTML/CSS boxes and arrows (no external diagram library).

**Rationale**:
- No runtime dependency. Renders immediately.
- The PRD says "a diagram or explainer on the page." An ASCII-box-style diagram in styled divs is sufficient for the demo.
- The 4-step flow (Request → 402 Response → Payment Signed → Report Delivered) maps to 4 boxes with arrows.

**Alternatives considered**:
- Mermaid.js: Adds a runtime dependency. Rejected.
- Static PNG/SVG: Harder to iterate on during the 3-hour build. Rejected.

---

## 5. Frontend Architecture

**Decision**: Replace the scaffold's `page.tsx` with a TituloChain single-page UI. Keep all `lib/` utilities and `hooks/` intact (they will be needed if wallet connection is added later). Remove or hide the current wallet/payment/savings components from the main page; they are not in scope for TituloChain's demo.

**Key Stellar SDK patterns confirmed (from existing scaffold)**:
- `rpc.Server` already instantiated in `stellar.ts`
- `simulate → assembleTransaction → toXDR → sign → sendTransaction → pollTransaction` is the correct Soroban write flow
- Server-side signing: use `Keypair.fromSecret(process.env.RECORD_SIGNER_SECRET)` and `tx.sign(keypair)` before submitting

**New files needed**:
- `web/src/lib/titles.ts` — mock title data
- `web/src/lib/verifier.ts` — SHA-256 token generation (using Web Crypto or Node crypto)
- `web/src/app/api/verify/route.ts` — Next.js API route (server-side signer + contract call)
- `web/src/components/TitleInput.tsx`
- `web/src/components/EncumbranceReport.tsx`
- `web/src/components/VerificationToken.tsx`
- `web/src/components/PaymentFlowDiagram.tsx`
- `contracts/titulo-verify/` — new Soroban contract

**Modified files**:
- `web/src/app/page.tsx` — replace scaffold UI with TituloChain UI
- `web/src/lib/stellar.ts` — add `TITULO_CONTRACT_ID` constant
- `Cargo.toml` — add `titulo-verify` to workspace members
- `scripts/deploy.ps1` / `deploy.sh` — add titulo-verify deploy step

---

## 6. Soroban Contract Design

**Decision**: Minimal contract — one function `record(title_hash: BytesN<32>) → Symbol` with an emitted event. No query function (data is indexed via events + tx explorer).

**Rationale**: The demo only needs to *write* a record and show the explorer link. Reading back records is done via the explorer URL, not a contract read. Keeping the contract minimal reduces deployment risk in the 3-hour window.

```rust
pub fn record(env: Env, title_hash: BytesN<32>) -> Symbol {
    let ts = env.ledger().timestamp();
    // token = first 8 bytes of hash(title_hash_bytes + ts) rendered as hex Symbol
    let token = compute_token(&env, &title_hash, ts);
    env.events().publish(
        (Symbol::new(&env, "verification"),),
        (title_hash.clone(), ts, token.clone()),
    );
    token
}
```

**Storage**: No persistent storage needed. The event log is the record. TTL management not required.

---

## 7. Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_TITULO_CONTRACT_ID` | `.env.local` | Contract ID for the titulo-verify contract |
| `RECORD_SIGNER_SECRET` | `.env.local` (server-only, no `NEXT_PUBLIC_`) | Secret key of the pre-funded testnet account that signs verification transactions |
| `NEXT_PUBLIC_SOROBAN_RPC` | already exists | Soroban RPC endpoint |
| `NEXT_PUBLIC_HORIZON_URL` | already exists | Horizon for the explorer base URL |

---

## 8. Explorer URL Pattern

```
https://stellar.expert/explorer/testnet/tx/{txHash}
```

This is the canonical Stellar testnet transaction explorer URL. The tx hash is returned by `server.sendTransaction()` after polling confirms SUCCESS.
