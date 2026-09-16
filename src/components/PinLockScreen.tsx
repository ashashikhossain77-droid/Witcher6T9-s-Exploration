import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';

interface PinLockScreenProps {
  correctPinHash: string;
  onUnlock: () => void;
  onResetPin: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPinHash,
  onUnlock,
  onResetPin
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      setError(false);
      if (next.length >= 4 && next === correctPinHash) {
        onUnlock();
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPinHash) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xs w-full shadow-2xl text-center border border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">IE Tracking Locked</h2>
        <p className="text-xs text-slate-500 mt-1">Enter your Security PIN to access plant data</p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 my-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-blue-600 border-blue-600 scale-110'
                  : 'bg-transparent border-slate-300'
              } ${error ? 'border-rose-500 bg-rose-500' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-bold text-rose-600 mb-3 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Incorrect PIN. Try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 text-slate-800 font-extrabold text-lg transition shadow-2xs border border-slate-100"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold text-xs"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 text-slate-800 font-extrabold text-lg transition shadow-2xs border border-slate-100"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm"
          >
            ⌫
          </button>
        </div>

        <form onSubmit={handleManualSubmit}>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-md transition text-xs"
          >
            Unlock Now
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            if (confirm('Reset PIN lock? This removes the PIN requirement.')) {
              onResetPin();
            }
          }}
          className="mt-4 text-[11px] text-slate-400 hover:text-slate-600 transition underline"
        >
          Forgot PIN?
        </button>
      </div>
    </div>
  );
};
