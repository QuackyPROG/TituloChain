# Interface Contracts: TituloChain

**Branch**: `001-titulochain-dapp` | **Phase**: 1

---

## 1. Next.js API Route: `POST /api/verify`

### Request
```http
POST /api/verify
Content-Type: application/json

{ "titleNumber": "TCT-89012-PM" }
```

### Response — success (200)
```json
{
  "titleNumber": "TCT-89012-PM",
  "verifiedAt": "2026-06-14T09:23:45.000Z",
  "encumbrances": [
    {
      "type": "mortgage",
      "creditor": "BPI Family Savings Bank",
      "amount": "₱2,500,000.00",
      "registrationDate": "2021-03-15"
    },
    {
      "type": "tax_lien",
      "creditor": "Bureau of Internal Revenue",
      "amount": "₱48,200.00",
      "registrationDate": "2023-08-01"
    }
  ],
  "isClean": false,
  "token": "A3F9C12E8B40",
  "txHash": "a1b2c3d4e5f6...",
  "explorerUrl": "https://stellar.expert/explorer/testnet/tx/a1b2c3d4e5f6..."
}
```

### Response — title not found (404)
```json
{
  "error": "TITLE_NOT_FOUND",
  "message": "Title number \"XYZ-99999-ZZ\" is not in our records. Please check the number and try again."
}
```

### Response — signer not configured (503)
```json
{
  "error": "SIGNER_NOT_CONFIGURED",
  "message": "Verification service is not yet configured. Set RECORD_SIGNER_SECRET and NEXT_PUBLIC_TITULO_CONTRACT_ID."
}
```

### Response — contract error (500)
```json
{
  "error": "CONTRACT_ERROR",
  "message": "Failed to record verification on-chain. Please try again."
}
```

---

## 2. Soroban Contract: `titulo-verify`

### Function: `record`

**Signature (Rust)**:
```rust
pub fn record(env: Env, title_hash: BytesN<32>) -> Symbol
```

**Parameters**:
- `title_hash: BytesN<32>` — SHA-256 hash of the title number string (UTF-8 bytes)

**Returns**:
- `Symbol` — 12-character uppercase hex token derived from SHA-256(title_hash || ledger_timestamp)

**Side effects**:
- Emits one event per call:
  ```
  topics: [Symbol("verification")]
  data:   (BytesN<32> title_hash, u64 timestamp, Symbol token)
  ```

**Error conditions**: None (always succeeds if invoked correctly). The contract has no access control — any caller may record a verification.

**TypeScript invocation (in API route)**:
```typescript
import { nativeToScVal, xdr, hash } from '@stellar/stellar-sdk';

// Compute title_hash client-side (server-side in API route)
const titleBytes = Buffer.from(titleNumber, 'utf8');
const titleHash = hash(titleBytes); // SHA-256, returns Buffer (32 bytes)
const titleHashScVal = xdr.ScVal.scvBytes(titleHash);

// Build the contract call
const op = contract.call('record', titleHashScVal);
```

---

## 3. Frontend Component Interfaces

### `TitleInput`
```typescript
interface TitleInputProps {
  onSubmit: (titleNumber: string) => void;
  loading: boolean;
}
```

### `EncumbranceReport`
```typescript
interface EncumbranceReportProps {
  result: VerificationResult;
}
```

### `VerificationToken`
```typescript
interface VerificationTokenProps {
  token: string;
  explorerUrl: string;
}
```

### `PaymentFlowDiagram`
No props — fully static component.

---

## 4. Environment Variable Contract

| Variable | Visibility | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_TITULO_CONTRACT_ID` | Browser + Server | Yes (for on-chain) | Deployed `titulo-verify` contract ID |
| `RECORD_SIGNER_SECRET` | Server only | Yes (for on-chain) | Stellar secret key of the pre-funded signer account |
| `NEXT_PUBLIC_SOROBAN_RPC` | Browser + Server | No (has default) | Soroban RPC URL |
| `NEXT_PUBLIC_HORIZON_URL` | Browser + Server | No (has default) | Horizon URL |

**Graceful degradation**: If `NEXT_PUBLIC_TITULO_CONTRACT_ID` or `RECORD_SIGNER_SECRET` are not set, the `/api/verify` route returns 503. The frontend should detect this and show a "demo mode" notice if needed.
