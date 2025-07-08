'use client';

import { useState, useEffect } from 'react';
import { formatDateTime } from '@/lib/utils/date';

interface ReviewComment {
  id: number;
  review_id: number;
  parent_comment_id: number | null;
  comment_type: 'question' | 'answer' | 'note';
  content: string;
  author: string;
  is_ai_response: boolean;
  extra_metadata: any;
  created_at: string;
  updated_at: string | null;
  replies: ReviewComment[];
}

interface ReviewCommentsProps {
  reviewId: number;
}

export default function ReviewComments({ reviewId }: ReviewCommentsProps) {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'question' | 'note'>('question');

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/review-comments/${reviewId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/review-comments/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_type: commentType,
          content: newComment,
          parent_comment_id: null
        })
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      setNewComment('');
      await fetchComments(); // Refresh comments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: ReviewComment, level: number = 0) => (
    <div key={comment.id} className={`${level > 0 ? 'ml-8' : ''} mb-4`}>
      <div className={`p-4 rounded-lg ${
        comment.is_ai_response 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              comment.is_ai_response ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {comment.author}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              comment.comment_type === 'question' 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : comment.comment_type === 'answer'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {comment.comment_type === 'question' ? '質問' : 
               comment.comment_type === 'answer' ? '回答' : 'メモ'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDateTime(comment.created_at)}
          </span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {comment.content}
        </div>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, level + 1))}
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-4">コメント・質問</h4>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">
            コメントタイプ
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="question"
                checked={commentType === 'question'}
                onChange={(e) => setCommentType(e.target.value as 'question')}
                className="mr-2"
              />
              <span className="text-sm">質問（AIが回答します）</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="note"
                checked={commentType === 'note'}
                onChange={(e) => setCommentType(e.target.value as 'note')}
                className="mr-2"
              />
              <span className="text-sm">メモ</span>
            </label>
          </div>
        </div>
        
        <div className="mb-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={commentType === 'question' 
              ? 'このレビューについて質問してください...' 
              : 'メモを記入してください...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '送信中...' : 'コメントを投稿'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">まだコメントはありません</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}