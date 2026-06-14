# Feature Specification: TituloChain dApp

**Feature Branch**: `001-titulochain-dapp`

**Created**: 2026-06-14

**Status**: Draft

**Input**: prd.md — Title encumbrance verification service for StellarX Philippines Hackathon @ PUP QC

## User Scenarios & Testing

### User Story 1 - Title Encumbrance Verification (Priority: P1)

A property buyer enters a Philippine land title number and receives a formatted encumbrance report in under 3 seconds. The report lists any active liens, mortgages, or adverse claims — or confirms the title is clean. No wallet, login, or technical knowledge required.

**Why this priority**: This is the entire product. Without it, there is no demo. All other stories depend on or extend this core interaction.

**Independent Test**: Open the app, enter `TCT-89012-PM`, click Verify — a formatted report appears within 3 seconds showing two encumbrances. Enter `TCT-44521-MM` — report confirms clean title. Enter `XYZ-00000` — clear error message shown.

**Acceptance Scenarios**:

1. **Given** the app is open with no wallet connected, **When** a judge enters `TCT-89012-PM` and clicks Verify, **Then** a report renders within 3 seconds showing title number, verification timestamp, one mortgage entry, and one tax lien entry with creditor/amount/date for each.
2. **Given** the app is open, **When** a judge enters `TCT-44521-MM`, **Then** the report renders confirming zero encumbrances with a "clean title" message.
3. **Given** the app is open, **When** a judge enters an unrecognised title number, **Then** a clear error message appears: "Title not found. Please check the number and try again." No report is shown.
4. **Given** the app is open, **When** the page loads, **Then** the cost per query is visible (0.50 USDC) before any search is submitted.

---

### User Story 2 - On-Chain Verification Proof (Priority: P2)

After receiving a report, the user sees a short alphanumeric verification token and a "View on-chain" link. Clicking the link opens the Stellar testnet explorer showing the corresponding real transaction — proof that the verification occurred at a specific point in time.

**Why this priority**: This is the core blockchain value proposition. Without it, TituloChain is just a lookup tool. The on-chain record is what makes verification auditable and unforgeable. P2 because the frontend report (US1) must work first.

**Independent Test**: After a successful report from US1, a token like `A3F9C12E8B40` is displayed with a Copy button and a "View on-chain" link. Clicking the link opens Stellar Expert showing a real testnet transaction. The token is present in the on-chain event data.

**Acceptance Scenarios**:

1. **Given** a successful title verification, **When** the report renders, **Then** a verification token (12 alphanumeric chars) is displayed below the report alongside a "Copy" button and a "View on-chain" link.
2. **Given** the verification token is displayed, **When** the judge clicks "View on-chain", **Then** the Stellar testnet explorer opens showing a SUCCESS transaction containing the verification event.
3. **Given** a second verification of the same title, **When** the report renders, **Then** a different token is shown (timestamp-derived — each verification is unique).

---

### User Story 3 - Payment Flow Architecture Explainer (Priority: P3)

A judge looking at the page understands the x402 per-query payment model without reading documentation. A diagram on the page shows the four-step flow: Request → 402 Response → Payment Signed → Report Delivered. The current per-query cost (0.50 USDC) is shown before submission.

**Why this priority**: Required by the PRD for judge education, but the demo functions without it (P1 + P2 are the working product). P3 because it is purely presentational.

**Independent Test**: The page renders a visible diagram showing the 4-step x402 flow. The cost "0.50 USDC per query" is visible above the input. No live payment is required for any of the other flows to work.

**Acceptance Scenarios**:

1. **Given** the page is open, **When** a judge reads the page before submitting, **Then** "0.50 USDC per query" is visible near the input field.
2. **Given** the page is open, **When** a judge scrolls or looks at the explainer section, **Then** a diagram or labeled flow shows: Request → 402 Response → Payment Signed → Report Delivered (4 distinct steps).
3. **Given** no wallet is connected, **When** a judge submits a title, **Then** the verification still succeeds (payment is architectural, not enforced in demo).

---

### Edge Cases

- What happens when the testnet is slow and the on-chain record takes longer than 3 seconds? Show a loading state for up to 30s, then surface a timeout error with the option to retry.
- What happens if `RECORD_SIGNER_SECRET` is not set? The API route returns 503 and the frontend shows a configuration error notice.
- What if the judge types the title number with spaces or lowercase? Normalise to trimmed uppercase before lookup.
- What if the Soroban contract is not deployed (`NEXT_PUBLIC_TITULO_CONTRACT_ID` not set)? Same 503 path as missing signer.

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept a title number string input and return a formatted encumbrance report within 3 seconds.
- **FR-002**: System MUST normalise title number input (trim whitespace, uppercase) before lookup.
- **FR-003**: System MUST display the cost per query (0.50 USDC) before any submission.
- **FR-004**: System MUST create a real on-chain verification record (Soroban contract event on Stellar testnet) for each successful lookup.
- **FR-005**: System MUST display a verification token and a Stellar Expert explorer link after each successful lookup.
- **FR-006**: System MUST NOT require a browser wallet to perform a verification.
- **FR-007**: System MUST display a clear error message when an unrecognised title number is entered.
- **FR-008**: System MUST display a static x402 payment flow diagram on the page.
- **FR-009**: The encumbrance report MUST use plain language — no blockchain terminology.
- **FR-010**: The on-chain signing MUST use a server-side keypair; the secret MUST NOT be exposed to the browser.

### Key Entities

- **TitleRecord**: A fictional land title with location, owner, area, and a list of encumbrances. Source of truth for the demo.
- **Encumbrance**: One active claim against a title — type (mortgage/tax_lien/adverse_claim), creditor, amount, registration date.
- **VerificationResult**: The full result of one verification — report data + on-chain token + tx hash + explorer URL.

## Success Criteria

- **SC-001**: A judge can enter any of the 5 test title numbers and receive a formatted report within 3 seconds.
- **SC-002**: A judge can copy the verification token and open the corresponding Stellar testnet explorer link to see the real transaction.
- **SC-003**: A judge understands the x402 payment model from the on-page diagram alone, without the presenter speaking.
- **SC-004**: The full judge journey from "page opened" to "on-chain record understood" completes in under 3 minutes.

## Assumptions

- All title data is fictional mock data; no real LRA database integration.
- No live USDC payment is executed; the x402 flow is demonstrated architecturally only.
- The signer account is pre-funded by Friendbot and holds only XLM (no USDC needed).
- Desktop browser only; mobile layout is not required.
- Testnet only; mainnet deployment is out of scope for the hackathon.
- The `titulo-verify` Soroban contract is deployed and its ID is available as an env var before the demo.
