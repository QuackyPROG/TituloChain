# Tasks: TituloChain dApp

**Input**: Design documents from `specs/001-titulochain-dapp/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓, quickstart.md ✓

**Tests**: Soroban unit tests included for the contract (standard for Rust/Soroban projects). No frontend tests — not requested in spec.

**Organization**: Grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Workspace and project scaffolding required before any code is written.

- [x] T001 Add `titulo-verify` to `Cargo.toml` workspace members array alongside `savings-goal`
- [x] T002 [P] Create `contracts/titulo-verify/Cargo.toml` with soroban-sdk 22 dependency (copy structure from `contracts/savings-goal/Cargo.toml`, rename package to `titulo-verify`)
- [x] T003 [P] Create `contracts/titulo-verify/src/lib.rs` and `contracts/titulo-verify/src/test.rs` as empty stubs (`#![no_std]` + `mod test;`)
- [x] T004 [P] Create `web/.env.local` with placeholder env vars: `NEXT_PUBLIC_TITULO_CONTRACT_ID=`, `RECORD_SIGNER_SECRET=`, `NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org`, `NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org`
- [x] T005 [P] Update `scripts/deploy.ps1` to add a segundo step that builds and deploys `contracts/titulo-verify` and prints `NEXT_PUBLIC_TITULO_CONTRACT_ID`
- [x] T006 [P] Update `scripts/deploy.sh` (same as T005 for Linux/macOS)

**Checkpoint**: `cargo check` passes, `npm install` in `web/` succeeds, env file exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data and utilities that ALL user stories depend on. Must be complete before any story work begins.

- [x] T007 Add `TITULO_CONTRACT_ID` constant to `web/src/lib/stellar.ts` reading from `process.env.NEXT_PUBLIC_TITULO_CONTRACT_ID ?? ''`; export a `tituloDemoConfigured()` helper that returns `Boolean(TITULO_CONTRACT_ID)`
- [x] T008 [P] Create `web/src/lib/titles.ts` — define `Encumbrance` and `TitleRecord` TypeScript interfaces and the `TITLE_DATA` constant with all 5 test titles (TCT-89012-PM, TCT-44521-MM, CCT-10087-QC, OCT-00231-PN, TCT-77341-LG); export `lookupTitle(titleNumber: string): TitleRecord | null` that normalises input (trim + toUpperCase) before map lookup
- [x] T009 [P] Create `web/src/lib/verifier.ts` — export `computeToken(titleNumber: string, verifiedAt: string): string` that uses Node's `crypto.createHash('sha256')` on `titleNumber + '|' + verifiedAt`, returns the first 12 hex chars uppercased; this file is server-only (used only in the API route)

**Checkpoint**: TypeScript compiles (`cd web && npx tsc --noEmit`). `lookupTitle('tct-89012-pm')` returns the TCT-89012-PM record. `computeToken('TCT-89012-PM', '2026-06-14T09:00:00.000Z')` returns a 12-char uppercase hex string.

---

## Phase 3: User Story 1 — Title Encumbrance Verification (Priority: P1) 🎯 MVP

**Goal**: A judge enters a title number, receives a formatted encumbrance report within 3 seconds. No wallet required.

**Independent Test**: Enter `TCT-89012-PM` → report shows 2 encumbrances. Enter `TCT-44521-MM` → clean title confirmed. Enter `XYZ-00000` → "Title not found" message. No token or explorer link yet (that's US2).

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `web/src/components/TitleInput.tsx` — renders a text input, "Enter title number" label, "0.50 USDC per query" cost display below the label, and a "Verify Title" submit button; accepts `onSubmit(titleNumber: string)` and `loading: boolean` props; disabled while loading
- [x] T011 [P] [US1] Create `web/src/components/EncumbranceReport.tsx` — renders a formatted report card from a `VerificationResult` prop; sections: title number, "Verified at [datetime]", encumbrances list (each showing type/creditor/amount/date in plain language) or a "No encumbrances — this title appears clean" banner; no blockchain terminology; accepts `result: VerificationResult` prop (where token/txHash may be empty strings at this stage)
- [x] T012 [US1] Create `web/src/app/api/verify/route.ts` as a Next.js App Router POST handler — parse `{ titleNumber }` from request body, call `lookupTitle()`, return 404 `{ error: 'TITLE_NOT_FOUND', message: '...' }` on miss; for US1 checkpoint return 200 with a partial `VerificationResult` where `token` is `''`, `txHash` is `''`, `explorerUrl` is `''`, and `verifiedAt` is `new Date().toISOString()`
- [x] T013 [US1] Replace `web/src/app/page.tsx` with TituloChain main page: TituloChain headline + one-sentence description, `TitleInput` wired to `POST /api/verify`, loading state, `EncumbranceReport` rendered on success, error message rendered on 404, no existing scaffold components rendered
- [x] T014 [P] [US1] Update `web/src/app/layout.tsx` — set `<title>` to `TituloChain`, update `<meta name="description">` to match the product one-liner from the PRD

**Checkpoint**: `npm run dev` → open `http://localhost:3000` → enter `TCT-89012-PM` → formatted report appears within 3 seconds (no token yet). Enter `XYZ` → error message. `npm run build` succeeds.

---

## Phase 4: User Story 2 — On-Chain Verification Proof (Priority: P2)

**Goal**: Each successful verification creates a real on-chain record via the `titulo-verify` Soroban contract. A 12-char token and Stellar Expert link are displayed to the judge.

**Independent Test** (builds on US1): After a successful report, a token like `A3F9C12E8B40` appears. Clicking "View on-chain" opens Stellar Expert showing the real testnet transaction. Each submit generates a unique token (timestamp-derived).

### Implementation for User Story 2

- [x] T015 [US2] Write `contracts/titulo-verify/src/lib.rs` — implement `#[contract] struct TituloVerifyContract` with one `#[contractimpl]` function: `pub fn record(env: Env, title_hash: BytesN<32>) -> u64` that (1) gets `let ts = env.ledger().timestamp()`, (2) emits `env.events().publish((Symbol::new(&env, "verification"),), (title_hash, ts))`, (3) returns `ts`; add `mod test;` at the bottom
- [x] T016 [US2] Write `contracts/titulo-verify/src/test.rs` — unit tests: `test_record_returns_ledger_timestamp` (set ledger timestamp to 1000, call record with a dummy hash, assert return == 1000); `test_record_emits_event` (call record, assert one event emitted with topic `"verification"`)
- [ ] T017 [US2] Extend `web/src/app/api/verify/route.ts` to call the Soroban contract after a successful title lookup: (1) check `RECORD_SIGNER_SECRET` and `TITULO_CONTRACT_ID` env vars — return 503 `{ error: 'SIGNER_NOT_CONFIGURED' }` if missing; (2) compute `title_hash = hash(Buffer.from(titleNumber, 'utf8'))` using `@stellar/stellar-sdk`'s `hash()` function; (3) build and simulate a `record(title_hash)` contract call using a `Keypair.fromSecret(RECORD_SIGNER_SECRET)` signer and `server.getAccount()` for the sequence number; (4) assemble, sign, submit, poll for SUCCESS; (5) compute `token = computeToken(titleNumber, verifiedAt)` using the verifier lib; (6) return full `VerificationResult` with `token`, `txHash`, and `explorerUrl = https://stellar.expert/explorer/testnet/tx/${txHash}`; wrap everything in try/catch and return 500 `{ error: 'CONTRACT_ERROR' }` on failure
- [x] T018 [US2] Create `web/src/components/VerificationToken.tsx` — renders a labelled section below the report: "Verification Token" heading, the 12-char token in a monospace box, a "Copy" button (uses `navigator.clipboard.writeText`), and a "View on-chain →" anchor that opens `explorerUrl` in a new tab; accepts `{ token: string, explorerUrl: string }` props; renders nothing if `token` is empty
- [x] T019 [US2] Wire `VerificationToken` into `web/src/app/page.tsx` — render it below `EncumbranceReport` when `result.token` is non-empty

**Checkpoint**: `cargo test` passes in `contracts/titulo-verify/`. In the browser, after entering a test title, a token appears and "View on-chain" opens a real Stellar Expert transaction page. Each submit generates a distinct token.

---

## Phase 5: User Story 3 — Payment Flow Architecture Explainer (Priority: P3)

**Goal**: A static diagram on the page explains the x402 payment model. The per-query cost is visible before any submission.

**Independent Test**: The page renders a 4-box diagram (Request → 402 Response → Payment Signed → Report Delivered) without any user interaction. The cost "0.50 USDC per query" is visible on initial page load.

### Implementation for User Story 3

- [x] T020 [P] [US3] Create `web/src/components/PaymentFlowDiagram.tsx` — a fully static component, no props; renders a heading "How Payment Works (x402)", a brief sentence about the model, and a 4-step visual flow using styled `<div>` boxes connected by `→` arrows: Step 1 "Request /verify" → Step 2 "402 Payment Required (0.50 USDC)" → Step 3 "Wallet Signs Payment" → Step 4 "Report Delivered"; add a small footnote: "No live payment required for this demo"; use Tailwind utility classes for layout
- [x] T021 [US3] Wire `PaymentFlowDiagram` into `web/src/app/page.tsx` — render it below the `VerificationToken` section (or below the report area if no result yet); always visible, not conditional
- [x] T022 [US3] Confirm "0.50 USDC per query" cost text is visible in `TitleInput` (added in T010) on initial page load — no additional changes if already in place; update wording/styling if it blends into the background

**Checkpoint**: Open the page with no title entered → cost text and diagram are both visible. Flow diagram shows all 4 steps with arrows. No interactive elements in the diagram.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finishing touches that span multiple stories.

- [ ] T023 Add 30-second timeout to the `/api/verify` route's `pollTransaction` call (pass `maxAttempts: 30` or equivalent); surface a user-facing "Verification timed out — please retry" message in the frontend on 500 responses
- [ ] T024 [P] Add Enter-key submit to `TitleInput` — wrap the form in a `<form>` element with `onSubmit` handler, remove the explicit button click handler redundancy
- [ ] T025 [P] Update `IDEA.md` with TituloChain submission content: Track (RWA / Social Impact), one-liner, problem statement, Stellar usage summary, and demo checklist items from quickstart.md
- [ ] T026 [P] Update `README.md` with TituloChain setup steps: contract deploy, env var config, `npm run dev`, and the list of 5 test title numbers
- [ ] T027 Run all 5 validation scenarios from `specs/001-titulochain-dapp/quickstart.md` in the browser and confirm each expected outcome

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — independently testable without US2/US3
- **US2 (Phase 4)**: Depends on Phase 3 (extends the API route, needs the report UI) + requires Soroban contract deployed
- **US3 (Phase 5)**: Depends on Phase 2 only — can be done in parallel with US1 after Foundational
- **Polish (Phase 6)**: Depends on Phase 5 (all stories complete)

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Foundational — no other story dependency
- **US2 (P2)**: Extends the API route from US1 (T012 → T017); needs T010, T011 for the token display context
- **US3 (P3)**: Fully independent of US1/US2 — can be developed in parallel after Foundational

### Within Each Story

- T010, T011 [US1] can run in parallel (separate component files)
- T012 depends on T008 (lookupTitle) and T009 (computeToken)
- T013 depends on T010, T011, T012
- T015, T016 [US2] can run in parallel (lib.rs and test.rs)
- T017 [US2] depends on T012 (extends the route), T007 (TITULO_CONTRACT_ID), T009 (computeToken)
- T018 [US2] can run in parallel with T017 (separate component file)
- T019 depends on T018 and T013 (page.tsx already wired for US1)
- T020, T021, T022 [US3] are sequential (build component, wire it, verify cost text)

### Parallel Opportunities

- Phase 1: T002–T006 all parallelisable
- Phase 2: T008, T009 parallelisable (different files); T007 is short and quick
- US2: T015 + T016 (contract code and tests) in parallel; T018 in parallel with T017
- Polish: T024, T025, T026 in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational complete, launch in parallel:
Task A: "Create TitleInput component in web/src/components/TitleInput.tsx"   # T010
Task B: "Create EncumbranceReport component in web/src/components/EncumbranceReport.tsx" # T011

# Then sequentially:
Task C: "Create /api/verify route in web/src/app/api/verify/route.ts"  # T012 (needs T008, T009)
Task D: "Wire page.tsx with TitleInput + EncumbranceReport"             # T013 (needs T010-T012)
```

## Parallel Example: User Story 2

```bash
# After US1 checkpoint:
Task A: "Write titulo-verify contract src/lib.rs"   # T015
Task B: "Write titulo-verify unit tests test.rs"    # T016  (parallel with T015)
Task C: "Create VerificationToken component"        # T018  (parallel with T015/T016)

# Then sequentially (needs T015 deployed + T018 wired):
Task D: "Extend /api/verify route to call Soroban"  # T017
Task E: "Wire VerificationToken into page.tsx"       # T019
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational (T007–T009)
3. Complete Phase 3: US1 (T010–T014)
4. **STOP and VALIDATE**: `TCT-89012-PM` → report appears, error on bad title
5. Demo is functional for the judge core flow without on-chain

### Incremental Delivery

1. Setup + Foundational → workspace ready
2. US1 (T010–T014) → working report lookup, no on-chain → demo-able MVP
3. US2 (T015–T019) → contract deployed, real on-chain records, token + explorer link
4. US3 (T020–T022) → payment diagram visible
5. Polish (T023–T027) → error handling, Enter key, submission content

### Parallel Team Strategy (2 people)

After Foundational:
- **Person A**: US1 (T010–T014) — frontend components + API route stub
- **Person B**: US2 contract (T015–T016) — write and test Soroban contract, deploy

When US1 checkpoint passes and contract is deployed:
- **Person A**: US2 API extension (T017) + VerificationToken (T018, T019)
- **Person B**: US3 (T020–T022) + Polish (T023–T027)

---

## Notes

- [P] tasks touch different files — safe to run simultaneously
- Each user story has a named **Checkpoint** — stop and validate before moving to the next
- The `/api/verify` route is extended incrementally (stub in T012, on-chain in T017) — keep the route handler clean with early returns for each error case
- `RECORD_SIGNER_SECRET` must never appear in `NEXT_PUBLIC_*` variables or client-side code
- `cargo test` in `contracts/titulo-verify/` should pass before deploying (T016 must be green)
- The savings-goal contract and its scaffold components are untouched — this plan adds alongside, not replacing
