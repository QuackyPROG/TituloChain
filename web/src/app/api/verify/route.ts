import { NextResponse } from 'next/server';
import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Keypair,
  nativeToScVal,
  xdr,
  hash as stellarHash,
  rpc,
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE, TITULO_CONTRACT_ID } from '../../../lib/stellar';
import { lookupTitle } from '../../../lib/titles';
import { computeToken } from '../../../lib/verifier';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titleNumber } = body;

    if (!titleNumber) {
      return NextResponse.json(
        { error: 'TITLE_NOT_FOUND', message: 'Title number is required.' },
        { status: 404 }
      );
    }

    const titleRecord = lookupTitle(titleNumber);
    if (!titleRecord) {
      return NextResponse.json(
        {
          error: 'TITLE_NOT_FOUND',
          message: `Title number "${titleNumber}" is not in our records. Please check the number and try again.`,
        },
        { status: 404 }
      );
    }

    const signerSecret = process.env.RECORD_SIGNER_SECRET;
    const contractId = TITULO_CONTRACT_ID;

    // Graceful degradation / Setup check
    if (!signerSecret || !contractId) {
      console.warn('On-chain signer or contract ID not configured. Returning 503.');
      return NextResponse.json(
        {
          error: 'SIGNER_NOT_CONFIGURED',
          message: 'Verification service is not yet configured on the server. Set RECORD_SIGNER_SECRET and NEXT_PUBLIC_TITULO_CONTRACT_ID.',
        },
        { status: 503 }
      );
    }

    let txHash = '';
    const verifiedAt = new Date().toISOString();

    try {
      const keypair = Keypair.fromSecret(signerSecret);
      const sourcePublicKey = keypair.publicKey();

      // Load account sequence number fresh
      const account = await server.getAccount(sourcePublicKey);

      // Build contract call
      const contract = new Contract(contractId);
      const titleBytes = Buffer.from(titleRecord.titleNumber, 'utf8');
      const titleHash = stellarHash(titleBytes);
      const titleHashScVal = xdr.ScVal.scvBytes(titleHash);

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('record', titleHashScVal))
        .setTimeout(30)
        .build();

      // Simulate transaction before sending
      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim)) {
        console.error('Soroban transaction simulation failed:', sim);
        return NextResponse.json(
          {
            error: 'CONTRACT_ERROR',
            message: 'Failed to simulate verification transaction on-chain. Please verify contract deployment.',
          },
          { status: 500 }
        );
      }

      // Assemble, sign and submit
      const assembledTx = rpc.assembleTransaction(tx, sim).build();
      assembledTx.sign(keypair);

      const sendRes = await server.sendTransaction(assembledTx);
      if (sendRes.status === 'ERROR') {
        console.error('Stellar submit rejected transaction:', sendRes);
        return NextResponse.json(
          {
            error: 'CONTRACT_ERROR',
            message: `Stellar rejected the verification transaction: ${JSON.stringify(sendRes.errorResult ?? sendRes)}`,
          },
          { status: 500 }
        );
      }

      txHash = sendRes.hash;

      // Poll until finality with a 30-second timeout (T023)
      let txSuccess = false;
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const getRes = await server.getTransaction(txHash);
        if (getRes.status !== 'NOT_FOUND') {
          if (getRes.status === 'SUCCESS') {
            txSuccess = true;
            break;
          }
          console.error(`Transaction finished with unexpected status: ${getRes.status}`);
          return NextResponse.json(
            {
              error: 'CONTRACT_ERROR',
              message: `Verification transaction failed on-chain with status: ${getRes.status}`,
            },
            { status: 500 }
          );
        }
      }

      if (!txSuccess) {
        console.error('Verification transaction timed out after 30 seconds.');
        return NextResponse.json(
          {
            error: 'CONTRACT_ERROR',
            message: 'Verification timed out while waiting for blockchain confirmation. Please retry.',
          },
          { status: 500 }
        );
      }
    } catch (contractErr) {
      console.error('On-chain transaction execution failed:', contractErr);
      return NextResponse.json(
        {
          error: 'CONTRACT_ERROR',
          message: 'Failed to record verification on-chain. Please try again.',
        },
        { status: 500 }
      );
    }

    // Compute token using the helper
    const token = computeToken(titleRecord.titleNumber, verifiedAt);
    const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;

    return NextResponse.json({
      titleNumber: titleRecord.titleNumber,
      verifiedAt,
      encumbrances: titleRecord.encumbrances,
      isClean: titleRecord.encumbrances.length === 0,
      token,
      txHash,
      explorerUrl,
    });
  } catch (error) {
    console.error('API verification general failure:', error);
    return NextResponse.json(
      { error: 'CONTRACT_ERROR', message: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}
