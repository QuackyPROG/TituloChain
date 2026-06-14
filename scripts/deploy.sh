#!/usr/bin/env bash
# Deploy the savings-goal and titulo-verify contracts to Stellar testnet, then write the contract
# IDs into web/.env.local so the frontend can call them.
#
# Prereqs (from the workshop setup checklist): Rust + the wasm32v1-none target,
# and the Stellar CLI (run `stellar --version` to confirm).
#
# Usage:  ./scripts/deploy.sh [identityName]   (default identity: workshop)
set -euo pipefail

IDENTITY="${1:-workshop}"
NETWORK="testnet"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SAVINGS_WASM="target/wasm32v1-none/release/savings_goal.wasm"
TITULO_WASM="target/wasm32v1-none/release/titulo_verify.wasm"
ENV_FILE="$ROOT/web/.env.local"

cd "$ROOT"

# 1. Ensure a funded testnet identity exists
if ! stellar keys ls | grep -qx "$IDENTITY"; then
  echo "Creating + funding testnet identity '$IDENTITY'..."
  stellar keys generate "$IDENTITY" --network "$NETWORK" --fund
fi

# 2. Build the contracts to wasm
echo "Building contracts..."
stellar contract build

# 3. Deploy savings-goal to testnet (returns the contract ID, starting with C...)
echo "Deploying savings-goal to $NETWORK..."
SAVINGS_CONTRACT_ID=$(stellar contract deploy \
  --wasm "$SAVINGS_WASM" \
  --source-account "$IDENTITY" \
  --network "$NETWORK")
echo "Deployed savings-goal contract ID: $SAVINGS_CONTRACT_ID"

# 4. Initialise the savings goal (target = 1000). Ignore error if already initialised.
echo "Initialising savings goal (target 1000)..."
stellar contract invoke \
  --id "$SAVINGS_CONTRACT_ID" \
  --source-account "$IDENTITY" \
  --network "$NETWORK" \
  -- init --target 1000 || echo "(init skipped — contract may already be initialised)"

# 5. Deploy titulo-verify to testnet
echo "Deploying titulo-verify to $NETWORK..."
TITULO_CONTRACT_ID=$(stellar contract deploy \
  --wasm "$TITULO_WASM" \
  --source-account "$IDENTITY" \
  --network "$NETWORK")
echo "Deployed titulo-verify contract ID: $TITULO_CONTRACT_ID"

# 6. Write contract IDs into web/.env.local
if [ -f "$ENV_FILE" ]; then
  grep -v -E '^(NEXT_PUBLIC_CONTRACT_ID|NEXT_PUBLIC_TITULO_CONTRACT_ID)=' "$ENV_FILE" > "$ENV_FILE.tmp" || true
  mv "$ENV_FILE.tmp" "$ENV_FILE"
fi
echo "NEXT_PUBLIC_CONTRACT_ID=$SAVINGS_CONTRACT_ID" >> "$ENV_FILE"
echo "NEXT_PUBLIC_TITULO_CONTRACT_ID=$TITULO_CONTRACT_ID" >> "$ENV_FILE"

echo ""
echo "Wrote NEXT_PUBLIC_CONTRACT_ID=$SAVINGS_CONTRACT_ID to web/.env.local"
echo "Wrote NEXT_PUBLIC_TITULO_CONTRACT_ID=$TITULO_CONTRACT_ID to web/.env.local"
echo "Restart 'npm run dev' to pick up the new contract IDs."
