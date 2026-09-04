import React from 'react';
import { Shield, KeyRound, Smartphone, Fingerprint, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Tips() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-[40px] font-semibold tracking-[-0.03em] leading-tight text-[#1A1A1A]">Security Tips</h1>
        <p className="text-[#6B7280] text-sm max-w-md mx-auto">
          Essential practices for maintaining robust digital security.
        </p>
      </div>

      <div className="grid gap-4">
        <TipCard 
          icon={<KeyRound className="w-5 h-5 text-indigo-500" />}
          title="Use a Password Manager"
          description="Don't rely on your memory. Use a reputable password manager (like 1Password or Bitwarden) to generate and store unique passwords for every single account."
        />
        
        <TipCard 
          icon={<Fingerprint className="w-5 h-5 text-indigo-500" />}
          title="Enable Two-Factor Authentication (2FA)"
          description="Always enable 2FA where available. Prefer authenticator apps (like Authy or Google Authenticator) or hardware keys (like YubiKey) over SMS verification."
        />
        
        <TipCard 
          icon={<Shield className="w-5 h-5 text-indigo-500" />}
          title="Favor Length Over Complexity"
          description="A 20-character password made of random words (correct-horse-battery-staple) is often much harder to crack and easier to type than a 10-character password with random symbols."
        />
        
        <TipCard 
          icon={<Database className="w-5 h-5 text-indigo-500" />}
          title="Never Reuse Passwords"
          description="If a service you use is breached, hackers will test your email and password combination on thousands of other websites. Unique passwords prevent a single breach from ruining your digital life."
        />

        <TipCard 
          icon={<Smartphone className="w-5 h-5 text-indigo-500" />}
          title="Keep Software Updated"
          description="Many security breaches rely on known vulnerabilities in older software. Keep your operating system, browser, and password manager up to date."
        />
      </div>
    </motion.div>
  );
}

function TipCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-start group hover:border-gray-300 transition-colors">
      <div className="p-3 bg-gray-50 rounded-lg shrink-0 border border-[#E5E7EB]">
        {icon}
      </div>
      <div className="space-y-2 pt-1">
        <h3 className="font-semibold text-[#1A1A1A] leading-none">{title}</h3>
        <p className="text-[13px] text-[#6B7280] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
