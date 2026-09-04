import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, DatabaseZap, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';

interface SavedPassword {
  id: string;
  password: string;
  strength: string;
  score: number;
  length: number;
  entropy: number;
  crackResistance: string;
  createdAt: any;
}

export default function History() {
  const [records, setRecords] = useState<SavedPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const fetchRecords = async () => {
    if (!db) {
      setError("Firebase is not initialized. Please provide configuration in src/lib/firebase.ts");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'passwords'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: SavedPassword[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as SavedPassword);
      });
      setRecords(data);
    } catch (err: any) {
      console.error("Error fetching records:", err);
      if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        setError("Permission Denied: Update your Firestore Security Rules in the Firebase Console to allow read access.");
      } else {
        setError("Failed to fetch records. Check your Firebase configuration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'passwords', id));
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record.");
    }
  };

  const handleDeleteAll = async () => {
    if (!db || records.length === 0) return;
    const confirm = window.confirm("Are you sure you want to delete all saved passwords? This cannot be undone.");
    if (!confirm) return;
    
    setIsDeletingAll(true);
    try {
      for (const record of records) {
        await deleteDoc(doc(db, 'passwords', record.id));
      }
      setRecords([]);
    } catch (err) {
      console.error("Error deleting all records:", err);
      alert("Failed to delete all records.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    if (typeof timestamp.toDate === 'function') {
      try {
        return timestamp.toDate().toLocaleString(undefined, { 
          year: 'numeric', month: 'short', day: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        });
      } catch (e) {
        return 'Unknown date';
      }
    }
    return 'Pending...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center"
    >
      <div className="flex flex-col items-center text-center space-y-3 mb-10 mt-2 md:mt-6">
        <h1 className="text-[24px] md:text-[40px] font-semibold tracking-tight text-[#1A1A1A] leading-tight">Password History</h1>
        <p className="text-[#6B7280] text-[11px] md:text-[15px] max-w-md mx-auto">
          Review locally saved passwords. Stored in plaintext for demonstration purposes only.
        </p>
      </div>

      <div className="w-full max-w-[1024px] mx-auto bg-white border border-[#E5E7EB] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-2.5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 md:gap-3">
            <DatabaseZap className="w-4 h-4 md:w-5 md:h-5 text-[#6B7280]" />
            <span className="font-semibold text-[#1A1A1A] text-[12px] md:text-[15px]">Saved Records ({records.length})</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <button
              onClick={fetchRecords}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2.5 md:px-4 py-1.5 md:py-2 min-h-[36px] md:min-h-[44px] border border-[#E5E7EB] text-[#1A1A1A] text-[11px] md:text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={isLoading || isDeletingAll || records.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2.5 md:px-4 py-1.5 md:py-2 min-h-[36px] md:min-h-[44px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[11px] md:text-[13px] font-semibold rounded-lg hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
            >
              {isDeletingAll ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              Delete All
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#DC2626]" />
              <p className="text-[14px] font-medium text-[#1A1A1A] max-w-md">{error}</p>
              <p className="text-[13px] text-[#6B7280]">Update src/lib/firebase.ts with your configuration.</p>
            </div>
          ) : isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D1D5DB]" />
            </div>
          ) : records.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center space-y-2">
              <DatabaseZap className="w-8 h-8 text-[#D1D5DB] mb-2" />
              <p className="text-[15px] font-semibold text-[#1A1A1A]">No passwords saved</p>
              <p className="text-[13px] text-[#6B7280]">Analyze a password and click 'Save Password' to see it here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-2 py-2.5 md:px-6 md:py-4 text-[9px] md:text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">Password</th>
                  <th className="px-2 py-2.5 md:px-6 md:py-4 text-[9px] md:text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">Strength</th>
                  <th className="px-2 py-2.5 md:px-6 md:py-4 text-[9px] md:text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">Metrics</th>
                  <th className="px-2 py-2.5 md:px-6 md:py-4 text-[9px] md:text-[11px] font-bold tracking-wider text-[#6B7280] uppercase hidden md:table-cell">Crack Time</th>
                  <th className="px-2 py-2.5 md:px-6 md:py-4 text-[9px] md:text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">Date</th>
                  <th className="px-2 py-2.5 md:px-6 md:py-4 text-[9px] md:text-[11px] font-bold tracking-wider text-[#6B7280] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-2 py-2.5 md:px-6 md:py-4">
                      <span className="font-mono text-[11px] md:text-[14px] font-medium text-[#1A1A1A] select-all">{record.password}</span>
                    </td>
                    <td className="px-2 py-2.5 md:px-6 md:py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] md:text-[13px] font-semibold text-[#1A1A1A]">{record.strength}</span>
                        <span className="text-[10px] md:text-[12px] text-[#6B7280]">Score: {record.score}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 md:px-6 md:py-4">
                      <div className="flex flex-col text-[10px] md:text-[12px] text-[#6B7280]">
                        <span>Len: {record.length}</span>
                        <span>Ent: {Math.round(record.entropy)} bits</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 md:px-6 md:py-4 hidden md:table-cell">
                      <span className="text-[11px] md:text-[13px] text-[#1A1A1A]">{record.crackResistance}</span>
                    </td>
                    <td className="px-2 py-2.5 md:px-6 md:py-4">
                      <span className="text-[10px] md:text-[12px] text-[#6B7280] whitespace-nowrap">{formatDate(record.createdAt)}</span>
                    </td>
                    <td className="px-2 py-2.5 md:px-6 md:py-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 min-h-[36px] min-w-[36px] md:min-h-[44px] md:min-w-[44px] flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors inline-flex"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
