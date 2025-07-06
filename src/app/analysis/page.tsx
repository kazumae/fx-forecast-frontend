'use client';

import { useState } from 'react';
import ImageUploadGrid from '@/components/analysis/ImageUploadGrid';
import AnalysisResult from '@/components/analysis/AnalysisResult';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';

export default function AnalysisPage() {
  const [images, setImages] = useState<{ [key: string]: File | null }>({
    '1m': null,
    '5m': null,
    '15m': null,
    '1h': null,
    '4h': null,
    'd1': null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);

  const handleImageChange = (timeframe: string, file: File | null) => {
    setImages(prev => ({ ...prev, [timeframe]: file }));
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
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    const hasImages = Object.values(images).some(img => img !== null);
    if (!hasImages) {
      setError('少なくとも1つの画像を選択してください');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      
      if (images['1m']) formData.append('timeframe_1m', images['1m']);
      if (images['5m']) formData.append('timeframe_5m', images['5m']);
      if (images['15m']) formData.append('timeframe_15m', images['15m']);
      if (images['1h']) formData.append('timeframe_1h', images['1h']);
      if (images['4h']) formData.append('timeframe_4h', images['4h']);
      if (images['d1']) formData.append('timeframe_d1', images['d1']);

      const response = await fetch('/api/analysis/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`分析に失敗しました: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistory = (item: any) => {
    // 履歴から選択された場合、分析結果を表示
    setAnalysisResult({
      analysis: item.response,
      timestamp: item.created_at,
      images_count: item.images.length,
      slack_notified: false,
      request_id: item.id,
    });
    setShowNewAnalysis(false);
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">相場解析</h1>
          <button
            onClick={() => setShowNewAnalysis(!showNewAnalysis)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showNewAnalysis ? '履歴を見る' : '新規解析'}
          </button>
        </div>

        {!showNewAnalysis ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <AnalysisHistory onSelectHistory={handleSelectHistory} />
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">チャート画像を選択</h2>
              <ImageUploadGrid images={images} onImageChange={handleImageChange} />
              
              {error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? '分析中...' : '解析する'}
                </button>
                <button
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          </>
        )}

        {analysisResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">分析結果</h2>
            <AnalysisResult result={analysisResult} />
          </div>
        )}
      </div>
    </div>
  );
}