# Deploy the savings-goal and titulo-verify contracts to Stellar testnet, then write the contract
# IDs into web\.env.local so the frontend can call them.
#
# Prereqs (from the workshop setup checklist): Rust + the wasm32v1-none target,
# and the Stellar CLI (run `stellar --version` to confirm).
#
# Usage:  .\scripts\deploy.ps1 [identityName]   (default identity: workshop)

param([string]$Identity = "workshop")

$ErrorActionPreference = "Stop"
$Network = "testnet"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SavingsWasm = "target\wasm32v1-none\release\savings_goal.wasm"
$TituloWasm = "target\wasm32v1-none\release\titulo_verify.wasm"
$EnvFile = Join-Path $Root "web\.env.local"

Set-Location $Root

# 1. Ensure a funded testnet identity exists
$keys = stellar keys ls
if ($keys -notcontains $Identity) {
  Write-Host "Creating + funding testnet identity '$Identity'..."
  stellar keys generate $Identity --network $Network --fund
}

# 2. Build the contracts to wasm
Write-Host "Building contracts..."
stellar contract build

# 3. Deploy savings-goal to testnet (returns the contract ID, starting with C...)
Write-Host "Deploying savings-goal to $Network..."
$SavingsContractId = (stellar contract deploy --wasm $SavingsWasm --source-account $Identity --network $Network).Trim()
Write-Host "Deployed savings-goal contract ID: $SavingsContractId"

# 4. Initialise the savings goal (target = 1000). Ignore error if already initialised.
Write-Host "Initialising savings goal (target 1000)..."
try {
  stellar contract invoke --id $SavingsContractId --source-account $Identity --network $Network -- init --target 1000
} catch {
  Write-Host "(init skipped - contract may already be initialised)"
}

# 5. Deploy titulo-verify to testnet
Write-Host "Deploying titulo-verify to $Network..."
$TituloContractId = (stellar contract deploy --wasm $TituloWasm --source-account $Identity --network $Network).Trim()
Write-Host "Deployed titulo-verify contract ID: $TituloContractId"

# 6. Write contract IDs into web\.env.local
if (Test-Path $EnvFile) {
  (Get-Content $EnvFile) | Where-Object { 
    $_ -notmatch '^NEXT_PUBLIC_CONTRACT_ID=' -and $_ -notmatch '^NEXT_PUBLIC_TITULO_CONTRACT_ID=' 
  } | Set-Content $EnvFile
}
Add-Content $EnvFile "NEXT_PUBLIC_CONTRACT_ID=$SavingsContractId"
Add-Content $EnvFile "NEXT_PUBLIC_TITULO_CONTRACT_ID=$TituloContractId"

Write-Host ""
Write-Host "Wrote NEXT_PUBLIC_CONTRACT_ID=$SavingsContractId to web\.env.local"
Write-Host "Wrote NEXT_PUBLIC_TITULO_CONTRACT_ID=$TituloContractId to web\.env.local"
Write-Host "Restart npm run dev to pick up the new contract IDs."
