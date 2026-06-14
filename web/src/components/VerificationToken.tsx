'use client';

import React, { useState } from 'react';

interface VerificationTokenProps {
  token: string;
  explorerUrl: string;
}

export default function VerificationToken({ token, explorerUrl }: VerificationTokenProps) {
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
            On-Chain Verification Proof
          </h3>
          <p className="text-xs text-slate-500">
            This cryptographic proof confirms the integrity of this report on the Stellar blockchain.
          </p>
        </div>

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition duration-200"
          >
            <span>View on-chain</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>

      <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
        <span className="text-xs font-mono text-slate-500 select-none px-2 uppercase tracking-wide">
          TOKEN
        </span>
        <code className="flex-1 font-mono text-base font-bold text-slate-100 uppercase tracking-widest text-center select-all">
          {token}
        </code>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition duration-200 flex items-center space-x-1"
        >
          {copied ? (
            <>
              <svg
                className="h-3.5 w-3.5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
