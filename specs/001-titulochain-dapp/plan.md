# Implementation Plan: TituloChain dApp

**Branch**: `001-titulochain-dapp` | **Date**: 2026-06-14 | **Spec**: [prd.md](../../prd.md)

**Input**: Feature specification from `prd.md` — title encumbrance verification service for the StellarX PH hackathon @ PUP QC.

## Summary

Build TituloChain: a land title encumbrance verification dApp. A user enters a Philippine land title number and receives an encumbrance report sourced from mock data, paired with a real on-chain verification record created on Stellar testnet via a new Soroban contract (`titulo-verify`). The payment model (0.50 USDC/query via x402) is shown as a static diagram — no live payment is executed in the demo. The existing StellarX scaffold (Next.js 16, stellar-sdk v15, Tailwind v4) is adapted; the existing savings-goal contract is left unchanged.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 20 (Next.js 16, React 19); Rust edition 2021 (soroban-sdk 22)

**Primary Dependencies**: Next.js 16.2.6, @stellar/stellar-sdk v15.1.0, @stellar/freighter-api v6 (unused in core demo flow — kept for future wallet integration), Tailwind v4, soroban-sdk 22

**Storage**: Static TypeScript constant (mock title data); Soroban event log (on-chain verification records — no persistent contract storage)

**Testing**: `cargo test` for Soroban contract unit tests; manual browser validation for frontend

**Target Platform**: Desktop browser (testnet), Next.js dev server (local) or Vercel (deployed demo)

**Project Type**: Web application (Next.js frontend) + Soroban smart contract

**Performance Goals**: Encumbrance report rendered in under 3 seconds from submit click (including on-chain record submission + polling)

**Constraints**: 3-hour hackathon build window; testnet only; no wallet required to verify a title; no live USDC payment; no external government database

**Scale/Scope**: 5 test title numbers, single-page demo UI, 1 Soroban contract, 1 Next.js API route

## Constitution Check

*The project constitution (`/.specify/memory/constitution.md`) contains unfilled template placeholders and no active principles.* No gates apply. All architectural decisions are documented in `research.md` with rationale.

Post-design re-check: No violations. The design is minimal and scoped to the PRD's "smallest working version" principle stated explicitly in the PRD (Section 6).

## Project Structure

### Documentation (this feature)

```text
specs/001-titulochain-dapp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output — API + contract interface contracts
└── tasks.md             # Phase 2 output (speckit-tasks)
```

### Source Code (repository root)

```text
contracts/
├── savings-goal/        # EXISTING — unchanged
│   └── src/lib.rs
└── titulo-verify/       # NEW
    ├── Cargo.toml
    └── src/
        ├── lib.rs       # record() function + event emission
        └── test.rs      # unit tests

web/src/
├── app/
│   ├── page.tsx         # REPLACE scaffold UI with TituloChain UI
│   ├── layout.tsx       # update title/metadata
│   └── api/
│       └── verify/
│           └── route.ts # NEW — POST /api/verify (server-side signer)
├── components/
│   ├── TitleInput.tsx        # NEW
│   ├── EncumbranceReport.tsx # NEW
│   ├── VerificationToken.tsx # NEW
│   └── PaymentFlowDiagram.tsx # NEW
│   [existing components left in place but not rendered on main page]
├── lib/
│   ├── titles.ts        # NEW — mock title data
│   ├── verifier.ts      # NEW — SHA-256 title hash helper (server-safe)
│   ├── stellar.ts       # MODIFY — add TITULO_CONTRACT_ID constant
│   ├── contract.ts      # EXISTING — unchanged (savings-goal still usable)
│   ├── payment.ts       # EXISTING — unchanged
│   ├── balances.ts      # EXISTING — unchanged
│   └── ...              # other existing lib files unchanged
└── hooks/
    └── useWallet.ts     # EXISTING — unchanged

scripts/
├── deploy.ps1           # MODIFY — add titulo-verify deploy step
└── deploy.sh            # MODIFY — add titulo-verify deploy step

Cargo.toml               # MODIFY — add titulo-verify workspace member
web/.env.local           # NEW (gitignored) — NEXT_PUBLIC_TITULO_CONTRACT_ID, RECORD_SIGNER_SECRET
```

**Structure Decision**: Option 2 variant — existing monorepo with Rust contracts + Next.js frontend. The titulo-verify contract is added alongside savings-goal. The frontend is a single-page app; the API route is the only server-side endpoint added.

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## Phase 0 Research Summary

See `research.md` for full findings. Key decisions:

1. **On-chain record**: New Soroban contract `titulo-verify` with `record(BytesN<32>) → Symbol`, called from a Next.js API route using a server-side signer keypair. No wallet required for judges.
2. **Token**: 12-char uppercase hex derived from SHA-256(title_hash ∥ ledger_timestamp), computed on-chain.
3. **Test data**: 5 fictional Philippine titles in `web/src/lib/titles.ts` — see `data-model.md` for full catalogue.
4. **x402 diagram**: Static inline JSX component, no external library.
5. **Signer**: Pre-funded testnet account, secret stored in `RECORD_SIGNER_SECRET` (server-only env var).

## Phase 1 Design Summary

See `data-model.md`, `contracts/api.md`, and `quickstart.md` for full details.

- **Data model**: `TitleRecord` / `Encumbrance` / `VerificationResult` TypeScript interfaces; Soroban contract emits events (no persistent storage).
- **API contract**: `POST /api/verify` → 200 VerificationResult | 404 TITLE_NOT_FOUND | 503 SIGNER_NOT_CONFIGURED | 500 CONTRACT_ERROR.
- **Soroban contract**: `record(title_hash: BytesN<32>) → Symbol` — stateless, emits event, returns token.
- **Validation guide**: `quickstart.md` covers 5 test scenarios and a judge demo checklist.
