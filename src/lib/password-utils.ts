export type PasswordAnalysis = {
  passwordLength: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeatedChars: boolean;
  hasSequential: boolean;
  isCommonMatch: boolean;
  entropyBits: number;
  score: number;
  crackTimeStr: string;
  crackTimeDesc: string;
  strengthLabel: string;
};

// Common weak passwords (simplified list for demonstration)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', '123456789', 'qwerty', '12345', '1234', '111111', 
  '1234567', 'dragon', 'admin', 'welcome', 'letmein', 'monkey', 'sunshine', '123123'
]);

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      passwordLength: 0,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSymbols: false,
      hasRepeatedChars: false,
      hasSequential: false,
      isCommonMatch: false,
      entropyBits: 0,
      score: 0,
      crackTimeStr: 'Instant',
      crackTimeDesc: 'A blank password offers zero security.',
      strengthLabel: 'NONE',
    };
  }

  const passwordLength = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  // Pattern detection
  const hasRepeatedChars = /(.)\1{2,}/.test(password); // 3 or more repeated chars
  const lowerPass = password.toLowerCase();
  
  // Basic sequential check
  let hasSequential = false;
  const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      if (lowerPass.includes(seq.substring(i, i + 3))) {
        hasSequential = true;
        break;
      }
    }
  }

  const isCommonMatch = COMMON_PASSWORDS.has(lowerPass);

  // Entropy Calculation (Rough estimate)
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 32;
  
  if (poolSize === 0) poolSize = 1;

  let entropyBits = Math.floor(passwordLength * Math.log2(poolSize));

  // Penalize for patterns
  if (hasRepeatedChars) entropyBits -= 10;
  if (hasSequential) entropyBits -= 10;
  if (isCommonMatch) entropyBits = Math.min(10, entropyBits / 2); // Heavy penalty

  entropyBits = Math.max(0, entropyBits);

  // Scoring (0-100)
  // Target > 80 bits for 100 score
  let score = Math.min(100, Math.floor((entropyBits / 80) * 100));
  
  // Extra checks for scoring
  if (isCommonMatch) {
    score = Math.min(10, score);
  } else if (passwordLength < 8) {
    score = Math.min(40, score);
  } else if (passwordLength < 12) {
    score = Math.min(75, score);
  }

  if (hasRepeatedChars || hasSequential) {
    score -= 10;
  }
  score = Math.max(0, score);

  // Crack time estimation (Assuming 100 billion guesses / sec offline attack)
  const guessesPerSec = 100_000_000_000;
  // Average guesses needed = 2^(E-1)
  let seconds = Math.pow(2, Math.max(0, entropyBits - 1)) / guessesPerSec;
  
  let crackTimeStr = '';
  if (isCommonMatch) {
    crackTimeStr = 'Instant';
  } else if (seconds < 1) {
    crackTimeStr = 'Instant';
  } else if (seconds < 60) {
    crackTimeStr = `${Math.floor(seconds)} seconds`;
  } else if (seconds < 3600) {
    crackTimeStr = `${Math.floor(seconds / 60)} minutes`;
  } else if (seconds < 86400) {
    crackTimeStr = `${Math.floor(seconds / 3600)} hours`;
  } else if (seconds < 31536000) {
    crackTimeStr = `${Math.floor(seconds / 86400)} days`;
  } else if (seconds < 3153600000) {
    crackTimeStr = `${Math.floor(seconds / 31536000)} years`;
  } else if (seconds < 31536000000) {
    crackTimeStr = `${Math.floor(seconds / 315360000) * 100} years`;
  } else {
    // Large formatting
    const years = seconds / 31536000;
    if (years > 1_000_000_000) crackTimeStr = '1+ Billion years';
    else if (years > 1_000_000) crackTimeStr = `${Math.floor(years / 1_000_000)}M+ years`;
    else crackTimeStr = `${Math.floor(years / 1_000)}k+ years`;
  }

  let strengthLabel = 'WEAK';
  if (score >= 80) strengthLabel = 'STRONG';
  else if (score >= 60) strengthLabel = 'GOOD';
  else if (score >= 40) strengthLabel = 'FAIR';

  return {
    passwordLength,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasRepeatedChars,
    hasSequential,
    isCommonMatch,
    entropyBits,
    score,
    crackTimeStr,
    crackTimeDesc: 'Based on estimated password entropy and a hypothetical offline attack scenario.',
    strengthLabel,
  };
}

export type GenerateOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export function generatePassword(options: GenerateOptions): string {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numChars = '0123456789';
  const symChars = '!@#$%^&*()_+~|}{[]:;?><,./-=';

  let charPool = '';
  if (options.uppercase) charPool += upperChars;
  if (options.lowercase) charPool += lowerChars;
  if (options.numbers) charPool += numChars;
  if (options.symbols) charPool += symChars;

  if (!charPool) return ''; // fallback if all options are unchecked

  let password = '';
  // Ensure at least one character from selected sets
  if (options.uppercase) password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  if (options.lowercase) password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  if (options.numbers) password += numChars.charAt(Math.floor(Math.random() * numChars.length));
  if (options.symbols) password += symChars.charAt(Math.floor(Math.random() * symChars.length));

  // Fill the rest
  while (password.length < options.length) {
    password += charPool.charAt(Math.floor(Math.random() * charPool.length));
  }

  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export async function checkPwnedPassword(password: string): Promise<number> {
  if (!password) return 0;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  const prefix = hashHex.substring(0, 5);
  const suffix = hashHex.substring(5);
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from HIBP API');
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [lineSuffix, count] = line.split(':');
      if (lineSuffix.trim() === suffix) {
        return parseInt(count.trim(), 10);
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error checking password:', error);
    throw error;
  }
}
