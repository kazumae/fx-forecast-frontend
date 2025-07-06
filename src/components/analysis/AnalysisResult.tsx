'use client';

import { formatDateTime } from '@/lib/utils/date';

interface EntryPoint {
  point_type: string;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2?: number;
  risk_reward_ratio: number;
  timeframe: string;
  reasoning: string[];
  timing: string;
}

interface ParsedAnalysis {
  current_price: number;
  trend: string;
  timeframe: string;
  entry_points: EntryPoint[];
  market_overview: string;
}

interface AnalysisResponse {
  analysis: string;
  parsed_analysis?: ParsedAnalysis;
  timestamp: string;
  images_count: number;
  slack_notified: boolean;
  request_id?: number;
}

interface AnalysisResultProps {
  result: AnalysisResponse;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const formatPrice = (price: number) => price.toFixed(3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">分析時刻</p>
          <p className="font-semibold">{formatDateTime(result.timestamp)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">分析画像数</p>
          <p className="font-semibold">{result.images_count}枚</p>
        </div>
        {result.request_id && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-gray-600 dark:text-gray-400">リクエストID</p>
            <p className="font-semibold">#{result.request_id}</p>
          </div>
        )}
      </div>

      {result.parsed_analysis ? (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">市場概況</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">現在価格</p>
                <p className="text-xl font-bold">{formatPrice(result.parsed_analysis.current_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">トレンド</p>
                <p className="text-xl font-bold">{result.parsed_analysis.trend}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">分析時間足</p>
                <p className="text-xl font-bold">{result.parsed_analysis.timeframe}</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{result.parsed_analysis.market_overview}</p>
          </div>

          {result.parsed_analysis.entry_points.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">エントリーポイント</h3>
              <div className="space-y-4">
                {result.parsed_analysis.entry_points.map((entry, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                          {entry.point_type}
                        </span>
                        <span className={`text-sm font-bold ${
                          entry.direction === 'ロング' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {entry.direction}
                        </span>
                        <span className="text-sm text-gray-500">
                          {entry.timeframe}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        RR比: {entry.risk_reward_ratio.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">エントリー</p>
                        <p className="font-semibold">{formatPrice(entry.entry_price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">損切り</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          {formatPrice(entry.stop_loss)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">利確1</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatPrice(entry.take_profit_1)}
                        </p>
                      </div>
                      {entry.take_profit_2 && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">利確2</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatPrice(entry.take_profit_2)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-medium mb-1">タイミング</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{entry.timing}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">根拠</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {entry.reasoning.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">分析結果（テキスト）</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {result.analysis}
          </pre>
        </div>
      )}
    </div>
  );
}