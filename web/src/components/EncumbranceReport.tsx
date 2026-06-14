'use client';

import React from 'react';
import { lookupTitle } from '../lib/titles';

export interface Encumbrance {
  type: 'mortgage' | 'tax_lien' | 'adverse_claim';
  creditor: string;
  amount: string;
  registrationDate: string;
}

export interface VerificationResult {
  titleNumber: string;
  verifiedAt: string;
  encumbrances: Encumbrance[];
  isClean: boolean;
  token: string;
  txHash: string;
  explorerUrl: string;
}

interface EncumbranceReportProps {
  result: VerificationResult;
}

const typeLabels: Record<Encumbrance['type'], string> = {
  mortgage: 'Real Estate Mortgage',
  tax_lien: 'Government Tax Lien',
  adverse_claim: 'Adverse Claim / Dispute',
};

const typeColors: Record<Encumbrance['type'], string> = {
  mortgage: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  tax_lien: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  adverse_claim: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function EncumbranceReport({ result }: EncumbranceReportProps) {
  const titleInfo = lookupTitle(result.titleNumber);
  const formattedDate = new Date(result.verifiedAt).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Official Verification Report
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1 font-mono tracking-tight">
            {result.titleNumber}
          </h2>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs text-slate-500 block">Verification Timestamp</span>
          <span className="text-sm font-medium text-slate-300">{formattedDate}</span>
        </div>
      </div>

      {/* Property Details */}
      {titleInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Registered Owner</span>
            <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{titleInfo.owner}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Property Location</span>
            <span className="text-sm font-medium text-slate-350 mt-0.5 block">{titleInfo.location}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Total Area</span>
            <span className="text-sm font-medium text-slate-350 mt-0.5 block">{titleInfo.area}</span>
          </div>
        </div>
      )}

      {/* Encumbrances Status Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200">Encumbrance & Lien Status</h3>

        {result.isClean ? (
          <div className="flex items-center space-x-3 p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <svg
              className="h-6 w-6 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold text-slate-100">No Encumbrances Found</p>
              <p className="text-xs text-emerald-500/80 mt-0.5">
                This property title appears clean and free of registered mortgages, tax liens, or adverse claims.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {result.encumbrances.map((enc, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        typeColors[enc.type]
                      }`}
                    >
                      {typeLabels[enc.type]}
                    </span>
                    <span className="text-xs text-slate-500">
                      Registered on {enc.registrationDate}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Claimant / Creditor:{' '}
                    <span className="text-slate-100">{enc.creditor}</span>
                  </p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Claim Amount</span>
                  <span className="text-lg font-bold text-slate-100">{enc.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
