# Data Model: TituloChain

**Branch**: `001-titulochain-dapp` | **Phase**: 1

---

## 1. Frontend / TypeScript Types

### `TitleRecord`
Stored in `web/src/lib/titles.ts` as a static lookup map. Represents one land title and its known encumbrances.

```typescript
interface Encumbrance {
  type: 'mortgage' | 'tax_lien' | 'adverse_claim';
  creditor: string;        // e.g. "BPI Family Savings Bank"
  amount: string;          // e.g. "₱2,500,000.00"
  registrationDate: string; // ISO date string, e.g. "2021-03-15"
}

interface TitleRecord {
  titleNumber: string;     // e.g. "TCT-89012-PM"
  location: string;        // e.g. "Parañaque City, Metro Manila"
  owner: string;           // registered owner name (fictional)
  area: string;            // e.g. "320 sqm"
  encumbrances: Encumbrance[];  // empty array = clean title
}

// Lookup map keyed by normalised title number (uppercase, trimmed)
const TITLE_DATA: Record<string, TitleRecord> = { ... }
```

**Validation**: Normalise input by `titleNumber.trim().toUpperCase()` before lookup. Return `null` if key not found.

### `VerificationResult`
The shape returned by the `/api/verify` route and consumed by the frontend.

```typescript
interface VerificationResult {
  titleNumber: string;
  verifiedAt: string;          // ISO datetime string (UTC)
  encumbrances: Encumbrance[];
  isClean: boolean;            // encumbrances.length === 0
  token: string;               // 12-char hex token, e.g. "A3F9C12E8B40"
  txHash: string;              // Stellar testnet tx hash
  explorerUrl: string;         // https://stellar.expert/explorer/testnet/tx/{txHash}
}
```

### `VerifyRequest` (API route input)
```typescript
interface VerifyRequest {
  titleNumber: string;
}
```

### `VerifyError` (API route error response)
```typescript
interface VerifyError {
  error: 'TITLE_NOT_FOUND' | 'CONTRACT_ERROR' | 'SIGNER_NOT_CONFIGURED';
  message: string;
}
```

---

## 2. Soroban Contract State

### `titulo-verify` contract
**Storage**: None (stateless — records are in the event log).

**Event schema** (emitted per `record()` call):
```
topics: [Symbol("verification")]
data: (BytesN<32> title_hash, u64 timestamp, Symbol token)
```

**Token derivation** (on-chain):
- `token = hex(SHA-256(title_hash_bytes || timestamp_bytes))[0..12].to_uppercase()`
- Implemented in Rust using `env.crypto().sha256(&combined_bytes)`

---

## 3. Test Data Catalogue

All titles are fictional. Data is stored verbatim in `web/src/lib/titles.ts`.

### TCT-89012-PM
- Location: Parañaque City, Metro Manila
- Owner: Rodrigo Santos Villanueva
- Area: 320 sqm
- Encumbrances:
  - Mortgage: BPI Family Savings Bank | ₱2,500,000.00 | 2021-03-15
  - Tax Lien: Bureau of Internal Revenue | ₱48,200.00 | 2023-08-01

### TCT-44521-MM
- Location: Muntinlupa City, Metro Manila
- Owner: Maria Consolacion Reyes
- Area: 180 sqm
- Encumbrances: *(none — clean title)*

### CCT-10087-QC
- Location: Quezon City
- Owner: Alicia Bautista Tan
- Area: 64 sqm (condominium unit)
- Encumbrances:
  - Adverse Claim: Pedro Macaraeg | ₱0 | 2024-01-22

### OCT-00231-PN
- Location: Pampanga Province
- Owner: Heirs of Eduardo Cruz
- Area: 1,200 sqm
- Encumbrances:
  - Mortgage: Land Bank of the Philippines | ₱1,800,000.00 | 2020-11-04

### TCT-77341-LG
- Location: Laguna Province
- Owner: Roberto Hernandez Dela Cruz
- Area: 450 sqm
- Encumbrances:
  - Mortgage: Security Bank Corporation | ₱3,200,000.00 | 2019-06-10
  - Mortgage: PNB — Philippine National Bank | ₱950,000.00 | 2022-02-28

---

## 4. State Transitions

```
User types title number
        ↓
Input validated (trimmed, uppercased)
        ↓ found?
  YES → lookup TitleRecord
        ↓
  POST /api/verify
        ↓
  Server: hash title_number → BytesN<32>
        ↓
  Server: call contract.record(title_hash)
  (simulate → assemble → sign → submit → poll)
        ↓
  Server: return VerificationResult (report + token + txHash)
        ↓
  Frontend: render EncumbranceReport + VerificationToken

  NO  → show "Title not found" message
```

---

## 5. Security Boundaries

- `RECORD_SIGNER_SECRET` is a server-only env var. It is never exposed to the browser. The Next.js API route is the only consumer.
- The signer account holds a small XLM balance (funded by Friendbot) and is used only for verification transactions. It does not hold user funds.
- Title data is static mock data. No user input is stored anywhere.
