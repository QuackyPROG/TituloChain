'use client';

import React, { useState } from 'react';

interface TitleInputProps {
  onSubmit: (titleNumber: string) => void;
  loading: boolean;
}

export default function TitleInput({ onSubmit, loading }: TitleInputProps) {
  const [titleNumber, setTitleNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleNumber.trim() && !loading) {
      onSubmit(titleNumber);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl space-y-4"
    >
      <div className="flex flex-col space-y-1.5">
        <label
          htmlFor="titleNumber"
          className="text-sm font-semibold text-slate-200 tracking-wide"
        >
          Enter Title Number
        </label>
        <span className="text-xs text-indigo-400 font-medium">
          Cost: 0.50 USDC per query
        </span>
        <input
          id="titleNumber"
          type="text"
          value={titleNumber}
          onChange={(e) => setTitleNumber(e.target.value)}
          placeholder="e.g. TCT-89012-PM"
          disabled={loading}
          className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200 disabled:opacity-50 font-mono"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !titleNumber.trim()}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Verifying...</span>
          </>
        ) : (
          <span>Verify Title</span>
        )}
      </button>
    </form>
  );
}
