import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded passcode for demonstration
    if (passcode === '9100') {
      onLogin();
    } else {
      setError(true);
      setPasscode('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center px-2"
    >
      <div className="w-full max-w-[400px] mt-6 md:mt-10">
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 md:p-8">
          <div className="flex flex-col items-center text-center space-y-3 mb-6 md:mb-8">
            <div className="p-2 md:p-3 bg-[#F3F4F6] rounded-full">
              <Lock className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A]" />
            </div>
            <div>
              <h2 className="text-[16px] md:text-[20px] font-semibold text-[#1A1A1A]">Admin Access</h2>
              <p className="text-[#6B7280] text-[11px] md:text-[13px] mt-1">Enter passcode to view History</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Passcode"
                autoFocus
                className={`w-full h-9 md:h-12 px-3 md:px-4 bg-white border ${error ? 'border-[#FCA5A5] focus:border-[#DC2626] focus:ring-[#FEE2E2]' : 'border-[#E5E7EB] focus:border-indigo-500 focus:ring-indigo-100'} rounded-lg text-[12px] md:text-[15px] font-mono focus:outline-none focus:ring-2 transition-all text-[#1A1A1A] text-center tracking-widest`}
              />
              {error && (
                <p className="text-[11px] md:text-[12px] text-[#DC2626] font-medium mt-2 text-center flex items-center justify-center gap-1">
                  Access denied
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!passcode}
              className="w-full h-9 md:h-12 bg-[#1A1A1A] text-white text-[12px] md:text-[14px] font-semibold rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Access History <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
