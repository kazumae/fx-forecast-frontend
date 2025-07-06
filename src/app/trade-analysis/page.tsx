'use client';

import { useState } from 'react';
import TradeAnalysisList from '@/components/trade-analysis/TradeAnalysisList';
import NewTradeAnalysis from '@/components/trade-analysis/NewTradeAnalysis';

export default function TradeAnalysisPage() {
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">トレード解析</h1>
          {!showNewAnalysis && (
            <button
              onClick={() => setShowNewAnalysis(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規解析
            </button>
          )}
        </div>

        {showNewAnalysis ? (
          <NewTradeAnalysis onCancel={() => setShowNewAnalysis(false)} />
        ) : (
          <TradeAnalysisList />
        )}
      </div>
    </div>
  );
}