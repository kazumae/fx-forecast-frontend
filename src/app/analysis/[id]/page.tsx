'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewForm from '@/components/analysis/ReviewForm';
import ReviewList from '@/components/analysis/ReviewList';
import CommentForm from '@/components/comment/CommentForm';
import CommentList from '@/components/comment/CommentList';
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

interface Comment {
  id: number;
  forecast_id: number;
  content: string;
  comment_type: 'question' | 'answer' | 'note';
  parent_comment_id: number | null;
  author: string;
  is_ai_response: boolean;
  created_at: string;
  updated_at?: string | null;
  extra_metadata?: any;
  replies: Comment[];
  answer?: Comment | null;
}

interface ForecastDetail {
  id: number;
  currency_pair: string;
  prompt: string;
  response: string;
  timeframes: string[] | null;
  created_at: string;
  updated_at: string | null;
  images: ForecastImage[];
  reviews?: Review[];
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ForecastDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    fetchAnalysisDetail();
    fetchComments();
  }, [params.id]);

  const fetchAnalysisDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get forecast with reviews
      const reviewResponse = await fetch(`/api/review/${params.id}`);
      if (reviewResponse.ok) {
        const data = await reviewResponse.json();
        setAnalysis(data);
      } else {
        // Fallback to regular history endpoint
        const response = await fetch(`/api/history/${params.id}`);
        if (!response.ok) {
          throw new Error('解析結果の取得に失敗しました');
        }
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析結果の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comment/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched comments:', data);
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchAnalysisDetail(); // Reload to show new review
  };

  const handleCommentSubmitted = async (isQuestion: boolean) => {
    setShowCommentForm(false);
    await fetchComments(); // Reload to show new comment
    
    // 質問の場合は、定期的にコメントを更新してAIの回答を確認
    if (isQuestion) {
      setIsWaitingForAI(true);
      
      // 最新のコメントを取得
      const updatedComments = await fetchCommentsWithReturn();
      const lastQuestion = updatedComments.filter(c => c.comment_type === 'question').pop();
      
      if (lastQuestion) {
        const checkInterval = setInterval(async () => {
          const currentComments = await fetchCommentsWithReturn();
          
          // 最新の質問に対するAI回答があるか確認
          const questionWithAnswer = currentComments.find(c => c.id === lastQuestion.id);
          const hasAIAnswer = questionWithAnswer && questionWithAnswer.answer !== null;
          
          if (hasAIAnswer) {
            clearInterval(checkInterval);
            setIsWaitingForAI(false);
          }
        }, 3000); // 3秒ごとにチェック
        
        // 30秒後にタイムアウト
        setTimeout(() => {
          clearInterval(checkInterval);
          setIsWaitingForAI(false);
        }, 30000);
      }
    }
  };
  
  const fetchCommentsWithReturn = async (): Promise<Comment[]> => {
    try {
      const response = await fetch(`/api/comment/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
    return [];
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
      <div className="min-h-screen p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">解析結果を読み込み中...</div>
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
            {error || '解析結果が見つかりません'}
          </div>
          <Link
            href="/analysis"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 解析一覧に戻る
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
            href="/analysis"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 解析一覧に戻る
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">解析詳細</h1>
            <div className="text-sm text-gray-500">
              ID: #{analysis.id}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">通貨ペア</p>
              <p className="font-semibold">{analysis.currency_pair}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">解析日時</p>
              <p className="font-semibold">{formatDateTime(analysis.created_at)}</p>
            </div>
            {analysis.timeframes && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">時間足</p>
                <div className="flex gap-1 mt-1">
                  {analysis.timeframes.map((tf) => (
                    <span
                      key={tf}
                      className="text-xs px-2 py-1 bg-white dark:bg-gray-600 rounded"
                    >
                      {tf}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">プロンプト</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {analysis.prompt}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">分析結果</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {analysis.response}
              </pre>
            </div>
          </div>

          {analysis.images.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">チャート画像</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.images.map((image) => (
                  <div key={image.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="relative">
                      <img
                        src={`/api/history/image/${image.id}`}
                        alt={`${image.timeframe} チャート`}
                        className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setModalImage({
                          src: `/api/history/image/${image.id}`,
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">レビュー</h2>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                レビューを追加
              </button>
            )}
          </div>

          {showReviewForm ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">新規レビュー</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  キャンセル
                </button>
              </div>
              <ReviewForm
                forecastId={analysis.id}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          ) : (
            <>
              {analysis.reviews && analysis.reviews.length > 0 ? (
                <ReviewList reviews={analysis.reviews} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  まだレビューがありません
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">質問・メモ</h2>
            {!showCommentForm && (
              <button
                onClick={() => setShowCommentForm(true)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                コメントを追加
              </button>
            )}
          </div>

          {showCommentForm ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">新規コメント</h3>
                <button
                  onClick={() => setShowCommentForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  キャンセル
                </button>
              </div>
              <CommentForm
                forecastId={analysis.id}
                onCommentSubmitted={handleCommentSubmitted}
              />
            </div>
          ) : (
            <>
              <CommentList 
                comments={comments} 
                onAnalysisUpdated={() => {
                  fetchAnalysisDetail();
                  fetchComments();
                }}
              />
              {isWaitingForAI && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    AIが回答を生成中です...
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/analysis?new=true')}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            新規解析を行う
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