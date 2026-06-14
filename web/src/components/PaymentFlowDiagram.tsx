'use client';

import React from 'react';

export default function PaymentFlowDiagram() {
  const steps = [
    {
      num: '01',
      title: 'Request /verify',
      desc: 'Client queries land title verification endpoint.',
    },
    {
      num: '02',
      title: '402 Required',
      desc: 'Server responds: payment of 0.50 USDC required.',
    },
    {
      num: '03',
      title: 'Sign Payment',
      desc: 'Client wallet signs and submits the USDC payment.',
    },
    {
      num: '04',
      title: 'Report Sent',
      desc: 'Server validates transaction and unlocks the report.',
    },
  ];

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <span>How Payment Works (x402 protocol)</span>
        </h3>
        <p className="text-xs text-slate-400">
          We implement a decentralized HTTP 402 payment protocol using Stellar USDC to query real-time title status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-start p-4 bg-slate-950/50 border border-slate-850 rounded-2xl group hover:border-slate-800 transition duration-200">
            <span className="text-2xl font-black text-indigo-500/20 font-mono tracking-wider absolute top-3 right-3 group-hover:text-indigo-500/30 transition duration-200">
              {step.num}
            </span>
            <span className="text-sm font-bold text-slate-200 mt-2">{step.title}</span>
            <span className="text-xs text-slate-400 mt-1.5 leading-relaxed">{step.desc}</span>
            {idx < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-slate-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
        <span>Handshake standard: HTTP-402 Payment Required</span>
        <span className="font-semibold text-indigo-400">Demo mode active: No real USDC spent</span>
      </div>
    </div>
  );
}
