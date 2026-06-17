import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const ShopNameSetup: React.FC = () => {
  const [shopName, setShopName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateShopName, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;
    
    setIsSubmitting(true);
    await updateShopName(shopName.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {user?.username}!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Please set up your shop name to continue. You only have to do this once.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="input-field w-full py-3 text-lg"
              placeholder="e.g. My Super Store"
              autoFocus
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !shopName.trim()}
            className="btn-primary w-full py-3 text-base mt-6 relative"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
