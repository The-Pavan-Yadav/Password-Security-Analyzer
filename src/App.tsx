import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Analyzer from './components/Analyzer';
import Generator from './components/Generator';
import Tips from './components/Tips';

type Tab = 'analyzer' | 'generator' | 'tips';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-20">
      <div className="w-full max-w-[960px] mx-auto space-y-10 flex-1">
        
        {/* Top Navigation / Header */}
        <header className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2.5 text-[#1A1A1A]">
            <div className="p-2 bg-[#E5E7EB] rounded-full">
              <ShieldCheck className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">Password Security Analyzer</span>
          </div>

          <nav className="flex items-center gap-4 p-1 max-w-full overflow-x-auto hide-scrollbar">
            <TabButton 
              active={activeTab === 'analyzer'} 
              onClick={() => setActiveTab('analyzer')}
            >
              Analyzer
            </TabButton>
            <TabButton 
              active={activeTab === 'generator'} 
              onClick={() => setActiveTab('generator')}
            >
              Password Generator
            </TabButton>
            <TabButton 
              active={activeTab === 'tips'} 
              onClick={() => setActiveTab('tips')}
            >
              Security Tips
            </TabButton>
          </nav>
        </header>

        {/* Main Content Area */}
        <main>
          {activeTab === 'analyzer' && <Analyzer />}
          {activeTab === 'generator' && <Generator />}
          {activeTab === 'tips' && <Tips />}
        </main>
      </div>

      {/* Privacy Footer */}
      <footer className="w-full max-w-[960px] mx-auto mt-16 pt-8 border-t border-[#E5E7EB] flex items-center justify-center text-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6B7280]" />
          <p className="text-[11px] text-[#6B7280]">
            Your password stays on your device. Analysis is performed locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
        active 
          ? 'text-indigo-600' 
          : 'text-[#6B7280] hover:text-indigo-600'
      }`}
    >
      {children}
    </button>
  );
}

