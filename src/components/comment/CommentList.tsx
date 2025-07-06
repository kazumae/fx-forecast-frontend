'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/utils/date';

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

interface CommentListProps {
  comments: Comment[];
  onAnalysisUpdated?: () => void;
}

export default function CommentList({ comments, onAnalysisUpdated }: CommentListProps) {
  const [updatingCommentId, setUpdatingCommentId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  
  const handleUpdateAnalysis = async (comment: Comment) => {
    setSelectedComment(comment);
    setShowConfirmModal(true);
  };

  const confirmUpdateAnalysis = async () => {
    if (!selectedComment) return;
    
    setShowConfirmModal(false);
    setUpdatingCommentId(selectedComment.id);

    try {
      const response = await fetch('/api/comment/update-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: selectedComment.id,
          update_reason: '質問への回答を反映',
          revised_sections: {}
        }),
      });

      if (!response.ok) {
        throw new Error('解析の更新に失敗しました');
      }

      if (onAnalysisUpdated) {
        onAnalysisUpdated();
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
      alert('解析の更新に失敗しました');
    } finally {
      setUpdatingCommentId(null);
      setSelectedComment(null);
    }
  };

  const getCommentTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return { label: '質問', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' };
      case 'answer':
        return { label: '回答', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' };
      case 'note':
        return { label: 'メモ', color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30' };
      default:
        return { label: type, color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30' };
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        まだコメントがありません
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {comments.map((comment) => {
          const typeInfo = getCommentTypeLabel(comment.comment_type);
          
          return (
            <div key={comment.id} className="space-y-2">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    {comment.is_ai_response && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        AI
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDateTime(comment.created_at)}
                    </span>
                  </div>
                  {comment.updated_at && comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-gray-400">
                      (編集済み)
                    </span>
                  )}
                </div>
                
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
              
              {/* AI回答の表示 */}
              {comment.answer && (
                <div className="ml-8">
                  <div className="border-l-2 border-green-300 dark:border-green-600 pl-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getCommentTypeLabel(comment.answer.comment_type).color}`}>
                            {getCommentTypeLabel(comment.answer.comment_type).label}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            AI
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(comment.answer.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.answer.content}
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleUpdateAnalysis(comment.answer!)}
                          disabled={updatingCommentId === comment.answer.id}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                   disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors
                                   flex items-center gap-2"
                        >
                          {updatingCommentId === comment.answer.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              反映中...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              解析に反映
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* その他の返信の表示 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-2">
                  {comment.replies.map((reply) => {
                    const replyTypeInfo = getCommentTypeLabel(reply.comment_type);
                    const borderColor = reply.is_ai_response 
                      ? 'border-green-300 dark:border-green-600' 
                      : 'border-gray-300 dark:border-gray-600';
                    const bgColor = reply.is_ai_response 
                      ? 'bg-green-50 dark:bg-green-900/10' 
                      : '';
                    
                    return (
                      <div
                        key={reply.id}
                        className={`border-l-2 ${borderColor} pl-4`}
                      >
                        <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${bgColor}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${replyTypeInfo.color}`}>
                                {replyTypeInfo.label}
                              </span>
                              {reply.is_ai_response && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                  AI
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {formatDateTime(reply.created_at)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {reply.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">解析への反映確認</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              このAIの回答を解析に反映しますか？
              解析内容が更新され、新しいリビジョンが作成されます。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmUpdateAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors"
              >
                反映する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}