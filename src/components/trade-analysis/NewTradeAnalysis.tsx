'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewTradeAnalysisProps {
  onCancel: () => void;
}

export default function NewTradeAnalysis({ onCancel }: NewTradeAnalysisProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currency_pair: 'XAUUSD',
    timeframe: '1h',
    trade_direction: 'long' as 'long' | 'short' | '',
    additional_context: '',
  });
  const [chartImage, setChartImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  const currencyPairs = [
    { display: 'XAUUSD', value: 'XAUUSD' },
    { display: 'USD/JPY', value: 'USDJPY' },
    { display: 'EUR/USD', value: 'EURUSD' },
    { display: 'GBP/USD', value: 'GBPUSD' },
    { display: 'EUR/JPY', value: 'EURJPY' },
    { display: 'GBP/JPY', value: 'GBPJPY' },
    { display: 'AUD/JPY', value: 'AUDJPY' },
    { display: 'EUR/GBP', value: 'EURGBP' },
    { display: 'AUD/USD', value: 'AUDUSD' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setChartImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chartImage) {
      setError('チャート画像を選択してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('currency_pair', formData.currency_pair);
      formDataToSend.append('timeframe', formData.timeframe);
      formDataToSend.append('chart_image', chartImage);
      
      if (formData.trade_direction) {
        formDataToSend.append('trade_direction', formData.trade_direction);
      }
      
      if (formData.additional_context) {
        formDataToSend.append('additional_context', formData.additional_context);
      }

      const response = await fetch('/api/trade-analysis/create', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('トレード解析の作成に失敗しました');
      }

      const data = await response.json();
      router.push(`/trade-analysis/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      currency_pair: 'XAUUSD',
      timeframe: '1h',
      trade_direction: 'long',
      additional_context: '',
    });
    setChartImage(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="currency_pair" className="block text-sm font-medium mb-2">
              通貨ペア
            </label>
            <select
              id="currency_pair"
              name="currency_pair"
              value={formData.currency_pair}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {currencyPairs.map((pair) => (
                <option key={pair.value} value={pair.value}>
                  {pair.display}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium mb-2">
              時間足
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={formData.timeframe}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {timeframes.map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="trade_direction" className="block text-sm font-medium mb-2">
              トレード方向（オプション）
            </label>
            <select
              id="trade_direction"
              name="trade_direction"
              value={formData.trade_direction}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">未指定</option>
              <option value="long">ロング</option>
              <option value="short">ショート</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="additional_context" className="block text-sm font-medium mb-2">
            追加情報（オプション）
          </label>
          <textarea
            id="additional_context"
            name="additional_context"
            value={formData.additional_context}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="エントリーポイント、市場環境、その他の関連情報などを記入してください..."
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">チャート画像（エントリーポイント付き）</h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium">チャートをアップロード</label>
            <div className="relative">
              <input
                type="file"
                id="chart_image"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <label
                htmlFor="chart_image"
                className="block w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 
                         rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 
                         text-center transition-colors"
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Chart preview"
                      className="max-w-full h-64 mx-auto object-contain"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      クリックして変更
                    </p>
                  </div>
                ) : (
                  <div className="py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      エントリーポイントがマークされたチャート画像を選択
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PNG、JPG、GIF形式（最大10MB）
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 
                       rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 
                       rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            >
              クリア
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !chartImage}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg
                     hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition-colors"
          >
            {isSubmitting ? '解析中...' : 'トレードを解析'}
          </button>
        </div>
      </form>
    </div>
  );
}