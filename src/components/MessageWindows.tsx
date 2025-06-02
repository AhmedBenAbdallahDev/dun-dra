'use client';

import { useUIStore } from '@/stores/uiStore';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const MessageWindows = () => {
  const { 
    errorWarnMsg, 
    buyWarnMsg, 
    sellWarnMsg,
    bugWindow,
    maintenanceWindow,
    setErrorWarnMsg,
    setBuyWarnMsg,
    setSellWarnMsg,
    setBugWindow,
    setMaintenanceWindow,
    clearMessages 
  } = useUIStore();

  // Clear a specific message
  const clearMessage = (type: 'error' | 'buy' | 'sell' | 'bug' | 'maintenance') => {
    switch (type) {
      case 'error':
        setErrorWarnMsg('');
        break;
      case 'buy':
        setBuyWarnMsg('');
        break;
      case 'sell':
        setSellWarnMsg('');
        break;
      case 'bug':
        setBugWindow(false);
        break;
      case 'maintenance':
        setMaintenanceWindow(false);
        break;
    }
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (errorWarnMsg) {
      const timer = setTimeout(() => setErrorWarnMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorWarnMsg, setErrorWarnMsg]);

  useEffect(() => {
    if (buyWarnMsg) {
      const timer = setTimeout(() => setBuyWarnMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [buyWarnMsg, setBuyWarnMsg]);

  useEffect(() => {
    if (sellWarnMsg) {
      const timer = setTimeout(() => setSellWarnMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [sellWarnMsg, setSellWarnMsg]);

  return (
    <>      {/* Error/Warning Message */}
      {errorWarnMsg && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-red-600/95 backdrop-blur-sm border border-red-400/60 rounded-xl p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-100">⚠️ Warning</h4>
                  <p className="text-sm text-red-200 mt-1">{errorWarnMsg}</p>
                </div>
              </div>
              <button
                onClick={() => clearMessage('error')}
                className="text-red-300 hover:text-white transition-colors hover:bg-red-500/30 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Warning Message */}
      {buyWarnMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm">
          <div className="bg-orange-600/95 backdrop-blur-sm border border-orange-400/60 rounded-xl p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-100">🛒 Purchase Notice</h4>
                  <p className="text-sm text-orange-200 mt-1">{buyWarnMsg}</p>
                </div>
              </div>
              <button
                onClick={() => clearMessage('buy')}
                className="text-orange-300 hover:text-white transition-colors hover:bg-orange-500/30 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Warning Message */}
      {sellWarnMsg && (
        <div className="fixed top-4 left-4 z-50 max-w-sm">
          <div className="bg-yellow-600/95 backdrop-blur-sm border border-yellow-400/60 rounded-xl p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-100">💰 Sale Notice</h4>
                  <p className="text-sm text-yellow-200 mt-1">{sellWarnMsg}</p>
                </div>
              </div>
              <button
                onClick={() => clearMessage('sell')}
                className="text-yellow-300 hover:text-white transition-colors hover:bg-yellow-500/30 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bug Report Window */}
      {bugWindow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-red-500/60 rounded-xl p-6 max-w-md mx-4 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">🐛 Bug Report</h3>
            </div>
            <p className="text-slate-300 mb-6">
              If you encountered a bug, please report it to help improve the game experience.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => clearMessage('bug')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // In a real app, this would open a bug report form or redirect
                  console.log('Bug report requested');
                  clearMessage('bug');
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-lg"
              >
                Report Bug
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Window */}
      {maintenanceWindow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-amber-500/60 rounded-xl p-6 max-w-md mx-4 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">🔧 Maintenance Notice</h3>
            </div>
            <p className="text-slate-300 mb-6">
              The game is currently under maintenance. Some features may be temporarily unavailable.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => clearMessage('maintenance')}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-lg transition-all duration-200 shadow-lg"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Messages Button (for development) */}
      {(errorWarnMsg || buyWarnMsg || sellWarnMsg) && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={clearMessages}
            className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border border-slate-600/60 rounded-lg text-slate-300 text-xs transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Clear All
          </button>
        </div>
      )}
    </>
  );
};

export default MessageWindows;
