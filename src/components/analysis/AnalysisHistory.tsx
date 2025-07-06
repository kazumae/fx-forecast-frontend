'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageModal from '@/components/common/ImageModal';
import { formatDateTime } from '@/lib/utils/date';

interface ForecastImage {
  id: number;
  timeframe: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  url?: string | null;
}

interface ForecastHistoryItem {
  id: number;
  currency_pair: string;
  prompt: string;
  response: string;
  timeframes: string[] | null;
  created_at: string;
  updated_at: string | null;
  images: ForecastImage[];
}

interface ForecastHistoryResponse {
  items: ForecastHistoryItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface AnalysisHistoryProps {
  onSelectHistory?: (item: ForecastHistoryItem) => void;
}

export default function AnalysisHistory({ onSelectHistory }: AnalysisHistoryProps) {
  const router = useRouter();
  const [history, setHistory] = useState<ForecastHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/history?page=${page}&per_page=10`);
      if (!response.ok) {
        throw new Error('履歴の取得に失敗しました');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '履歴の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };


  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">履歴を読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
        {error}
      </div>
    );
  }

  if (!history || history.items.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        解析履歴がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">解析履歴</h2>
      
      <div className="space-y-4">
        {history.items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => router.push(`/analysis/${item.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {item.currency_pair}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(item.created_at)}
                    </span>
                    {item.timeframes && (
                      <div className="flex gap-1">
                        {item.timeframes.map((tf) => (
                          <span
                            key={tf}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                          >
                            {tf}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.response}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {false && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">プロンプト</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.prompt}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">分析結果</h4>
                  <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {item.response}
                  </pre>
                </div>

                {item.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">画像</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {item.images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={`/api/history/image/${image.id}`}
                            alt={`${image.timeframe} チャート`}
                            className="w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-700"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                            <div>{image.timeframe}</div>
                            <div>{formatFileSize(image.file_size)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {onSelectHistory && (
                  <button
                    onClick={() => onSelectHistory(item)}
                    className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    この結果を使用
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {history.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            前へ
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {page} / {history.total_pages}
          </span>
          <button
            onClick={() => setPage(Math.min(history.total_pages, page + 1))}
            disabled={page === history.total_pages}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}