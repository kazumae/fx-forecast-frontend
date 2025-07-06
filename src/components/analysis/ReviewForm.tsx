'use client';

import { useState } from 'react';
import ImageUploadGrid from '@/components/analysis/ImageUploadGrid';

interface ReviewFormProps {
  forecastId: number;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ forecastId, onReviewSubmitted }: ReviewFormProps) {
  const [images, setImages] = useState<{ [key: string]: File | null }>({
    '1m': null,
    '5m': null,
    '15m': null,
    '1h': null,
    '4h': null,
    'd1': null,
  });
  const [actualOutcome, setActualOutcome] = useState<string>('');
  const [accuracyNotes, setAccuracyNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (timeframe: string, file: File | null) => {
    setImages(prev => ({ ...prev, [timeframe]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasImages = Object.values(images).some(img => img !== null);
    if (!hasImages && !actualOutcome && !accuracyNotes) {
      setError('レビュー内容を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (actualOutcome) formData.append('actual_outcome', actualOutcome);
      if (accuracyNotes) formData.append('accuracy_notes', accuracyNotes);
      
      if (images['1m']) formData.append('timeframe_1m', images['1m']);
      if (images['5m']) formData.append('timeframe_5m', images['5m']);
      if (images['15m']) formData.append('timeframe_15m', images['15m']);
      if (images['1h']) formData.append('timeframe_1h', images['1h']);
      if (images['4h']) formData.append('timeframe_4h', images['4h']);
      if (images['d1']) formData.append('timeframe_d1', images['d1']);

      const response = await fetch(`/api/review/${forecastId}/create`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('レビューの送信に失敗しました');
      }

      onReviewSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レビューの送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setImages({
      '1m': null,
      '5m': null,
      '15m': null,
      '1h': null,
      '4h': null,
      'd1': null,
    });
    setActualOutcome('');
    setAccuracyNotes('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          実際の結果
        </label>
        <select
          value={actualOutcome}
          onChange={(e) => setActualOutcome(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        >
          <option value="">選択してください</option>
          <option value="long_success">ロング成功</option>
          <option value="long_failure">ロング失敗</option>
          <option value="short_success">ショート成功</option>
          <option value="short_failure">ショート失敗</option>
          <option value="neutral">中立/判断保留</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          精度に関するメモ
        </label>
        <textarea
          value={accuracyNotes}
          onChange={(e) => setAccuracyNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          placeholder="予測の精度、実際の市場動向との比較など"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">振り返り用チャート画像（オプション）</h3>
        <ImageUploadGrid images={images} onImageChange={handleImageChange} />
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'レビューを送信中...' : 'レビューを送信'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          クリア
        </button>
      </div>
    </form>
  );
}