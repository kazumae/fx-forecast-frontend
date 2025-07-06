'use client';

import { useState } from 'react';

interface CommentFormProps {
  forecastId: number;
  onCommentSubmitted: (isQuestion: boolean) => void;
}

export default function CommentForm({ forecastId, onCommentSubmitted }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [commentType, setCommentType] = useState<'question' | 'note'>('question');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('コメントを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/comment/${forecastId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          comment_type: commentType,
        }),
      });

      if (!response.ok) {
        throw new Error('コメントの送信に失敗しました');
      }

      setContent('');
      onCommentSubmitted(commentType === 'question');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          タイプ
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="commentType"
              value="question"
              checked={commentType === 'question'}
              onChange={(e) => setCommentType(e.target.value as 'question' | 'note')}
              className="mr-2 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <span className="text-sm">質問</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="commentType"
              value="note"
              checked={commentType === 'note'}
              onChange={(e) => setCommentType(e.target.value as 'question' | 'note')}
              className="mr-2 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <span className="text-sm">メモ</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          内容
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="この解析について質問やメモを記入してください..."
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg
                   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-colors"
        >
          {isSubmitting ? '送信中...' : 'コメントを送信'}
        </button>
      </div>
    </form>
  );
}