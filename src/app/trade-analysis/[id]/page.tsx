'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageModal from '@/components/common/ImageModal';
import { formatDateTime } from '@/lib/utils/date';

interface TradeImage {
  id: number;
  timeframe: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface TradeAnalysisDetail {
  id: number;
  currency_pair: string;
  timeframe: string;
  trade_direction?: string | null;
  overall_score: number;
  entry_analysis: string;
  technical_analysis?: string | null;
  risk_management?: string | null;
  market_context?: string | null;
  good_points: string[];
  improvement_points: string[];
  recommendations: string[];
  confidence_level?: number | null;
  additional_context?: string | null;
  created_at: string;
  updated_at?: string | null;
  images: TradeImage[];
  comments_count: number;
}

export default function TradeAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<TradeAnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnalysisDetail();
  }, [params.id]);

  const fetchAnalysisDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trade-analysis/${params.id}`);
      if (!response.ok) {
        throw new Error('トレード解析の取得に失敗しました');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const getTradeDirectionLabel = (direction?: string | null) => {
    if (!direction) return '-';
    return direction === 'long' ? 'ロング' : direction === 'short' ? 'ショート' : direction;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  const formatCurrencyPair = (pair: string) => {
    // Convert USDJPY to USD/JPY format for display
    if (pair === 'XAUUSD') return pair;
    if (pair.length === 6) {
      return `${pair.slice(0, 3)}/${pair.slice(3)}`;
    }
    return pair;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            {error || 'トレード解析が見つかりません'}
          </div>
          <Link
            href="/trade-analysis"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← トレード解析一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/trade-analysis"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← トレード解析一覧に戻る
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">トレード解析詳細</h1>
            <div className="text-sm text-gray-500">
              ID: #{analysis.id}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">通貨ペア</p>
              <p className="font-semibold">{formatCurrencyPair(analysis.currency_pair)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">時間足</p>
              <p className="font-semibold">{analysis.timeframe}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">トレード方向</p>
              <p className="font-semibold">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  analysis.trade_direction === 'long' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : analysis.trade_direction === 'short'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {getTradeDirectionLabel(analysis.trade_direction)}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">総合スコア</p>
              <p className="font-semibold">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}%
                </span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">信頼度</p>
              <p className="font-semibold">
                {analysis.confidence_level ? `${(analysis.confidence_level * 100).toFixed(0)}%` : '-'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">エントリー分析</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {analysis.entry_analysis}
              </p>
            </div>
          </div>

          {analysis.technical_analysis && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">テクニカル分析</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {analysis.technical_analysis}
                </p>
              </div>
            </div>
          )}

          {analysis.risk_management && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">リスク管理</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {analysis.risk_management}
                </p>
              </div>
            </div>
          )}

          {analysis.market_context && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">市場環境</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {analysis.market_context}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {analysis.good_points.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2 text-green-600 dark:text-green-400">良い点</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.good_points.map((point, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.improvement_points.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2 text-orange-600 dark:text-orange-400">改善点</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.improvement_points.map((point, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2 text-blue-600 dark:text-blue-400">推奨事項</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {analysis.additional_context && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">追加情報</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {analysis.additional_context}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">作成日時</p>
              <p className="font-semibold">{formatDateTime(analysis.created_at)}</p>
            </div>
            {analysis.updated_at && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">更新日時</p>
                <p className="font-semibold">{formatDateTime(analysis.updated_at)}</p>
              </div>
            )}
          </div>

          {analysis.images.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">チャート画像</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.images.map((image) => (
                  <div key={image.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="relative">
                      <img
                        src={`/api/trade-analysis/image/${image.id}`}
                        alt={`${image.timeframe} チャート`}
                        className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setModalImage({
                          src: `/api/trade-analysis/image/${image.id}`,
                          alt: `${image.timeframe} チャート`
                        })}
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
                        {image.timeframe}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {image.filename}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatFileSize(image.file_size)} • {formatDateTime(image.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">コメント</h2>
            <span className="text-sm text-gray-500">
              {analysis.comments_count} 件のコメント
            </span>
          </div>
          {/* TODO: Add comment functionality here */}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/trade-analysis')}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            新規トレード解析
          </button>
        </div>
      </div>

      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
}