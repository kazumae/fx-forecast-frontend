'use client';

import { useState } from 'react';
import ImageModal from '@/components/common/ImageModal';
import { formatDateTime } from '@/lib/utils/date';

interface ReviewImage {
  id: number;
  timeframe: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface Review {
  id: number;
  forecast_id: number;
  review_timeframes: string[];
  review_prompt: string;
  review_response: string;
  actual_outcome: string | null;
  accuracy_notes: string | null;
  review_metadata: any;
  created_at: string;
  review_images: ReviewImage[];
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const getOutcomeLabel = (outcome: string | null) => {
    switch (outcome) {
      case 'long_success':
        return { label: 'ロング成功', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' };
      case 'long_failure':
        return { label: 'ロング失敗', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' };
      case 'short_success':
        return { label: 'ショート成功', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' };
      case 'short_failure':
        return { label: 'ショート失敗', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' };
      case 'neutral':
        return { label: '中立/判断保留', color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30' };
      default:
        return { label: '未設定', color: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30' };
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        まだレビューがありません
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
      {reviews.map((review) => {
        const outcome = getOutcomeLabel(review.actual_outcome);
        
        return (
          <div
            key={review.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${outcome.color}`}>
                  {outcome.label}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDateTime(review.created_at)}
                </span>
              </div>
            </div>

            {review.accuracy_notes && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">精度に関するメモ</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {review.accuracy_notes}
                </p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">AI分析結果</h4>
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded">
                {review.review_response}
              </pre>
            </div>

            {review.review_images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">振り返り画像</h4>
                <div className="grid grid-cols-3 gap-2">
                  {review.review_images.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={`/api/review/image/${image.id}`}
                        alt={`${image.timeframe} レビュー`}
                        className="w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setModalImage({
                          src: `/api/review/image/${image.id}`,
                          alt: `${image.timeframe} レビュー`
                        })}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                        {image.timeframe}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>

      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
    </>
  );
}