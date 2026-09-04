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
      className="w-full flex flex-col items-center"
    >
      
      {/* Hero */}
      <div className="flex flex-col items-center text-center space-y-3 mb-10 mt-2 md:mt-6">
        <h1 className="text-[24px] md:text-[40px] font-semibold tracking-tight text-[#1A1A1A] leading-tight">Secure Generator</h1>
        <p className="text-[#6B7280] text-[11px] md:text-[15px] max-w-md mx-auto">
          Create strong, unpredictable passwords that are highly resistant to cracking.
        </p>
      </div>

      <div className="w-full max-w-[760px] mx-auto bg-white border border-[#E5E7EB] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Output Section */}
        <div className="bg-[#0A0A0A] p-3 md:p-8 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          <div className="flex-1 w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 md:px-5 py-2.5 md:py-4 flex items-center justify-between group min-h-[36px] md:min-h-[44px]">
            <span className="font-mono text-[13px] md:text-[17px] tracking-wide text-white break-all select-all">{password}</span>
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#1A1A1A] px-3 md:px-5 py-2 md:py-4 rounded-lg font-semibold text-[11px] md:text-[13px] transition-colors min-h-[36px] md:min-h-[44px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center justify-center bg-[#222222] hover:bg-[#333333] border border-[#333333] text-white p-2 md:p-4 rounded-lg transition-colors min-w-[36px] md:min-w-[44px] min-h-[36px] md:min-h-[44px]"
              title="Generate new password"
            >
              <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="p-3.5 md:p-8 space-y-5 md:space-y-8">
          
          {/* Length Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[11px] md:text-[13px] font-medium text-[#1A1A1A]">Password Length</label>
              <span className="font-mono text-[12px] md:text-[15px] font-semibold text-[#1A1A1A]">{options.length}</span>
            </div>
            
            <input
              type="range"
              min="8"
              max="64"
              value={options.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
            />
            <div className="flex justify-between text-[10px] md:text-[11px] text-[#9CA3AF] font-medium">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          <div className="h-px w-full bg-[#E5E7EB]"></div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox 
              label="Uppercase (A-Z)" 
              checked={options.uppercase} 
              onChange={(v) => handleOptionChange('uppercase', v)} 
            />
            <Checkbox 
              label="Lowercase (a-z)" 
              checked={options.lowercase} 
              onChange={(v) => handleOptionChange('lowercase', v)} 
            />
            <Checkbox 
              label="Numbers (0-9)" 
              checked={options.numbers} 
              onChange={(v) => handleOptionChange('numbers', v)} 
            />
            <Checkbox 
              label="Symbols (!@#$)" 
              checked={options.symbols} 
              onChange={(v) => handleOptionChange('symbols', v)} 
            />
          </div>

        </div>
      </div>
    </motion.div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors min-h-[36px] md:min-h-[44px]">
      <div className={`w-3.5 h-3.5 md:w-5 md:h-5 rounded flex items-center justify-center border transition-colors ${
        checked ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'bg-white border-[#D1D5DB]'
      }`}>
        {checked && <Check className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-white" strokeWidth={3} />}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-[11px] md:text-[13px] font-medium text-[#1A1A1A] select-none">{label}</span>
    </label>
  );
}
