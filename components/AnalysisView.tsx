import React from 'react';
import { CheckCircle, BrainCircuit, X } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisViewProps {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  onConfirm: (items: any[]) => void;
  onCancel: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ isAnalyzing, result, onConfirm, onCancel }) => {
  
  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl border-4 border-blue-100">
            <BrainCircuit className="text-blue-600 w-16 h-16 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analyzing...</h2>
        <p className="text-gray-500 max-w-xs">
          Identifying items and estimating freshness dates...
        </p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg flex justify-between items-center">
        <h2 className="text-xl font-bold">Analysis Results</h2>
        <button onClick={onCancel} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 -mt-4">
        {result.items.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                {item.category}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-500">Expires</span>
                <span className="font-bold text-gray-900">{item.expiryDate || 'Unknown'}</span>
              </div>
              
              {item.reasoning && (
                <div className="flex gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-xl">
                  <BrainCircuit size={16} className="shrink-0" />
                  <p>{item.reasoning}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 pb-10">
        <button 
          onClick={() => onConfirm(result.items)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <CheckCircle size={20} />
          Save All Items
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;