# TituloChain — Hackathon MVP
## Product Requirements Document

**Version:** 1.0
**Context:** StellarX Philippines Hackathon
**Scope:** 3-hour build, single-demo deliverable

---

## 1. Executive Summary

### Problem Statement

Buying or inheriting property in the Philippines requires verifying whether a land title carries active liens, mortgages, or adverse claims. Today, that check requires a physical visit to the Registry of Deeds, a manual request for a Certified True Copy, and a wait of days to weeks. Fixers sell forged copies. Rural buyers skip the check entirely. There is no fast, trustless, and auditable way for an ordinary person to verify a title's encumbrance status before committing money.

### Proposed Solution

TituloChain is a title encumbrance verification service. A user enters a land title number and receives an encumbrance report — a summary of any active liens, mortgages, annotations, or adverse claims on that title. The report is paired with an on-chain verification record that proves the check was performed, by whom, and at exactly what time. Payment for the verification is collected per query.

### What the Hackathon Demo Must Prove

The demo does not attempt to solve the full problem. It proves three things:

1. The core user interaction works: enter a title number, receive a report.
2. An on-chain verification record is created and retrievable.
3. The payment model (per-query, in USDC) is architecturally sound and explainable.

### Success Criteria for the Demo

- A judge can enter any of the provided test title numbers and receive a formatted encumbrance report in under 3 seconds.
- A judge can copy the verification token and look up the corresponding on-chain record.
- A judge understands, without reading documentation, why this product needs blockchain and why Stellar specifically.
- The pitch answers "what problem does this solve and for whom" in under 60 seconds.

---

## 2. Users

### Who Uses This in the Demo

**Primary: The Property Buyer**
A Filipino purchasing residential property — a lot, a house, a condo unit. They have a title number given to them by the seller. Before handing over a downpayment, they want to know if the title is clean. They are not technically sophisticated. They should not need to understand what a blockchain is to use this product.

**Secondary: The Real Estate Lawyer or Notary**
A professional running due diligence on behalf of a client. They perform this check on every transaction they handle. Volume matters to them — they want a fast, verifiable result they can attach to a transaction file.

**Tertiary (demo only, not built): The AI Conveyancing Agent**
An automated agent performing property due diligence as part of a larger workflow. It calls the verification API programmatically, pays per query without human intervention, and receives a machine-readable report. This user exists to explain the x402 payment model to judges.

---

## 3. User Stories and Acceptance Criteria

### Story 1: Verify a Title

As a property buyer, I want to enter a land title number and receive an encumbrance report, so that I know whether the property I am buying is free of hidden debts or legal claims before I commit money.

**Acceptance Criteria:**
- The interface has a single text input and a submit button. No other fields are required.
- Submitting a valid test title number returns a report within 3 seconds.
- The report shows: title number, last verified date and time, a list of active encumbrances (type, creditor, amount, registration date), and a confirmation if none exist.
- The report is readable by a non-technical person. No blockchain terminology appears in the report itself.
- If an invalid or unrecognised title number is entered, the interface shows a clear message explaining the title was not found.

### Story 2: Receive Proof of Verification

As a property buyer, I want to receive a verification token after checking a title, so that I have auditable proof that I performed due diligence at a specific point in time.

**Acceptance Criteria:**
- After a successful report is returned, a verification token is displayed. The token is a short alphanumeric string the user can copy.
- A link is shown that opens the corresponding on-chain record in the Stellar testnet explorer.
- The on-chain record shows: the title number (or its hash), the timestamp of the verification, and the verification token.
- The token remains accessible for the duration of the demo. It does not expire.

### Story 3: Understand How Payment Works

As a judge, I want to understand how a buyer or an AI agent would pay for a verification, so that I can assess whether the business model is viable.

**Acceptance Criteria:**
- The interface displays the cost per query (0.50 USDC) before the user submits.
- A diagram or explainer on the page shows the payment flow: request → 402 response → payment signed → report delivered.
- The demo presentation includes a verbal walkthrough of this flow tied to the diagram.
- No live payment is required for the demo to function. The payment flow is demonstrated architecturally, not transactionally.

---

## 4. Non-Goals for the Hackathon

These are explicitly out of scope. Do not build them. Do not mention them as "coming soon" in the demo unless directly asked.

- No real Land Registration Authority data. All encumbrance reports are pre-written test data for 4–5 fictional title numbers.
- No user accounts, login, or wallet connection required to view a report.
- No live USDC payment execution. The x402 payment flow is shown as a diagram, not executed.
- No mobile-specific design. Desktop is sufficient for the demo.
- No PDF export of the report.
- No ability to register new title records through the UI.
- No integration with any external government database or API.
- No Philippine map or geographic interface.
- No history view of past queries.

---

## 5. The Demo Flow (What Judges Experience)

**Step 1.** The judge opens a URL in a browser. They see a clean interface: a headline, a one-sentence description of what the product does, a text field labelled "Enter title number," a cost displayed as "0.50 USDC per query," and a button.

**Step 2.** The judge types one of the provided test title numbers (e.g., "TCT-89012-PM") and submits.

**Step 3.** A loading indicator appears briefly, then the report renders below. The report shows the title number, the date and time of verification, and a list of encumbrances — for example, one active mortgage and one tax lien — with their details.

**Step 4.** Below the report, a verification token is displayed with a "Copy" button and a "View on-chain" link. The judge clicks the link and is taken to the Stellar testnet explorer showing the real transaction.

**Step 5.** Separately, the presenter points to a diagram on the page (or on a slide) that shows the x402 payment flow, explains that in production a buyer's wallet would sign a 0.50 USDC payment before receiving the report, and that this makes the service usable by both humans and AI agents without subscriptions or API keys.

**Total elapsed time for a judge to go from "I just opened the URL" to "I understand the product and have seen proof on-chain": under 3 minutes.**

---

## 6. What the Judges Must Walk Away Believing

- The problem is real and the Philippine market context makes it urgent.
- The on-chain verification record is a genuine improvement over a paper CTC — it is timestamped, unforgeable, and instantly verifiable by anyone.
- The per-query payment model via x402 is a credible business model at scale, including for AI agents.
- Stellar is not incidental to this product — the fee structure is what makes sub-dollar per-query pricing viable, and the on-chain record is what makes the verification trustworthy.
- The team scoped the problem correctly: they built the smallest working version of a real idea, not a half-built grand vision.

---

## 7. Risks to the Demo

| Risk | Likelihood | Mitigation |
|---|---|---|
| Testnet is slow or unresponsive during demo | Medium | Pre-record the on-chain explorer view as a fallback screenshot |
| Judge asks for a live payment | Low | Redirect to the x402 architecture diagram and explain the missing piece is the wallet integration, not the protocol |
| Judge challenges the data accuracy | Medium | State clearly that all data is test data and the real-world flow depends on LRA data access |
| Demo URL is unreachable | Low | Have a local version running on a laptop as backup |

---

*This document covers the 3-hour hackathon deliverable only. For the full product vision, business model, and post-hackathon roadmap, see TituloChain Full PRD.*