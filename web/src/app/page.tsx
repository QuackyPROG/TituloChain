'use client';

import React, { useState } from 'react';
import TitleInput from '@/components/TitleInput';
import EncumbranceReport, { VerificationResult } from '@/components/EncumbranceReport';
import VerificationToken from '@/components/VerificationToken';
import PaymentFlowDiagram from '@/components/PaymentFlowDiagram';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (titleNumber: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titleNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'An error occurred during verification.');
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to reach the verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center py-16 px-4 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3 max-w-xl">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-400">
          <svg
            className="h-4.5 w-4.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Stellar & Soroban Powered Verification</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
          TituloChain
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Secure Philippine Land Title Encumbrance Verification. Check titles instantly for mortgages, liens, and claims.
        </p>
      </div>

      {/* Main Interactive Section */}
      <div className="w-full flex flex-col items-center space-y-6">
        <TitleInput onSubmit={handleVerify} loading={loading} />

        {error && (
          <div className="w-full max-w-md p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-start space-x-3">
            <svg
              className="h-5.5 w-5.5 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold text-slate-200">Verification Failed</p>
              <p className="text-xs text-rose-400/90 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <>
            <EncumbranceReport result={result} />
            <VerificationToken token={result.token} explorerUrl={result.explorerUrl} />
          </>
        )}

        <PaymentFlowDiagram />
      </div>

      {/* Footer */}
      <footer className="pt-8 text-center text-xs text-slate-600 max-w-md border-t border-slate-900 w-full">
        Built for the StellarX PH Hackathon @ PUP QC QC. Registered under RWA & Social Impact track.
      </footer>
    </main>
  );
}
