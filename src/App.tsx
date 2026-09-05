import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import Analyzer from './components/Analyzer';
import Generator from './components/Generator';
import Tips from './components/Tips';
import History from './components/History';
import AdminLogin from './components/AdminLogin';

type Tab = 'analyzer' | 'generator' | 'tips' | 'history' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  return (
    <div className="w-full flex flex-col items-center min-h-screen max-w-[100vw] overflow-x-hidden">
      {/* Privacy Banner */}
      <div className="w-full bg-[#DC2626] rounded-b-md md:rounded-b-lg flex items-center justify-center px-2 md:px-4 py-1.5 md:py-0 min-h-[36px] md:min-h-[40px] shadow-sm box-border shrink-0 z-50">
        <div className="flex items-center gap-1.5 md:gap-2 max-w-[960px] w-full justify-center">
          <Lock className="w-[14px] h-[14px] md:w-4 md:h-4 text-white shrink-0" />
          <span className="text-white text-[10.5px] sm:text-[11px] md:text-[13px] font-medium leading-[1.3] md:leading-normal text-center">
            Your password stays on your device. Analysis is performed locally in your browser.
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center px-2 sm:px-4 py-5 md:py-16 w-full flex-1">
        <div className="w-full max-w-[960px] mx-auto space-y-5 md:space-y-10 flex-1 mt-1 md:mt-4">
        
        {/* Top Navigation / Header */}
        <header className="flex flex-col items-center space-y-3 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-2.5 text-[#1A1A1A]">
            <div className="p-1.5 md:p-2 bg-[#E5E7EB] rounded-full">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A]" />
            </div>
            <span className="text-[13px] md:text-[15px] font-bold tracking-tight text-center">Password Security Analyzer</span>
          </div>

          <nav className="flex flex-wrap justify-center items-center gap-1.5 md:gap-4 p-1 w-full">
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
          {activeTab === 'admin' && !isAdminAuth && (
            <AdminLogin onLogin={() => {
              setIsAdminAuth(true);
              setActiveTab('history');
            }} />
          )}
          {(activeTab === 'history' || (activeTab === 'admin' && isAdminAuth)) && (
            isAdminAuth ? (
              <History />
            ) : (
              <AdminLogin onLogin={() => {
                setIsAdminAuth(true);
                setActiveTab('history');
              }} />
            )
          )}
        </main>
      </div>

      {/* Privacy Footer */}
      <footer className="w-full max-w-[960px] mx-auto mt-12 md:mt-16 pt-6 md:pt-8 border-t border-[#E5E7EB] flex items-center justify-center text-center">
        <div className="flex items-center gap-2 relative">
          <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#6B7280]" />
          <p className="text-[10px] md:text-[13px] text-[#6B7280]">
            Your password stays on your device. Analysis is performed locally in your browser.
          </p>
        </div>
      </footer>

      {/* Hidden Admin Trigger */}
      <button 
        onClick={() => {
          setIsAdminAuth(false);
          setActiveTab('admin');
        }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 bg-transparent outline-none border-none shadow-none z-50 cursor-default"
        aria-hidden="true"
        tabIndex={-1}
      />
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 md:px-4 py-1.5 md:py-2 min-h-[36px] md:min-h-0 text-[11px] md:text-[13px] font-medium whitespace-nowrap transition-all duration-200 rounded-lg ${
        active 
          ? 'text-indigo-600 bg-indigo-50 md:bg-transparent' 
          : 'text-[#6B7280] hover:text-indigo-600 hover:bg-gray-50 md:hover:bg-transparent'
      }`}
    >
      {children}
    </button>
  );
}

