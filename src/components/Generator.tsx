import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { generatePassword, GenerateOptions } from '../lib/password-utils';
import { motion } from 'motion/react';

export default function Generator() {
  const [options, setOptions] = useState<GenerateOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleGenerate = () => {
    setPassword(generatePassword(options));
    setCopied(false);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptionChange = (key: keyof GenerateOptions, value: boolean | number) => {
    setOptions(prev => {
      const next = { ...prev, [key]: value };
      // Prevent unchecking the last option
      if (!next.uppercase && !next.lowercase && !next.numbers && !next.symbols) {
        return prev;
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-[40px] font-semibold tracking-[-0.03em] leading-tight text-[#1A1A1A]">Secure Generator</h1>
        <p className="text-[#6B7280] text-sm max-w-md mx-auto">
          Create strong, unpredictable passwords that are highly resistant to cracking.
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Output Section */}
        <div className="bg-[#0A0A0A] p-6 md:p-8 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full bg-[#222222] border border-[#333333] rounded-lg px-5 py-4 flex items-center justify-between group">
            <span className="font-mono text-sm tracking-wide text-white break-all select-all">{password}</span>
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 md:flex-none p-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
              aria-label="Regenerate password"
            >
              <RefreshCw className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98] font-semibold text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Length Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label htmlFor="length-slider" className="text-[13px] font-medium text-[#1A1A1A]">Password Length</label>
              <span className="text-sm font-mono font-semibold text-indigo-600 w-8 text-right">{options.length}</span>
            </div>
            <input
              id="length-slider"
              type="range"
              min="8"
              max="32"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Character Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox
              id="opt-upper"
              label="Uppercase Letters"
              checked={options.uppercase}
              onChange={(c) => handleOptionChange('uppercase', c)}
            />
            <Checkbox
              id="opt-lower"
              label="Lowercase Letters"
              checked={options.lowercase}
              onChange={(c) => handleOptionChange('lowercase', c)}
            />
            <Checkbox
              id="opt-numbers"
              label="Numbers"
              checked={options.numbers}
              onChange={(c) => handleOptionChange('numbers', c)}
            />
            <Checkbox
              id="opt-symbols"
              label="Symbols"
              checked={options.symbols}
              onChange={(c) => handleOptionChange('symbols', c)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Checkbox({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30">
          <Check className={`w-3.5 h-3.5 text-white stroke-[3] transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700 select-none group-hover:text-gray-900">{label}</span>
    </label>
  );
}
