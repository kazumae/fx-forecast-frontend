'use client';

import { useState, FormEvent } from 'react';

interface ForecastResponse {
  id: number;
  analysis: string;
  trade_plan: string;
  entry_points: any[];
  exit_points: any[];
  created_at: string;
  image_ids: Record<string, number>;
}

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

export default function ForecastForm() {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [response, setResponse] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      const file = inputFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    let fileAttached = false;
    for (const timeframe of timeframes) {
      const key = `image_${timeframe}`;
      if (files[timeframe]) {
        formData.append(key, files[timeframe] as File);
        fileAttached = true;
      }
    }

    if (!fileAttached) {
      setError('画像を1枚以上選択してください。');
      setIsLoading(false);
      return;
    }
    
    if (comment) {
      formData.append('comment', comment);
    }

    try {
      const res = await fetch('http://localhost:8767/api/v1/analysis/analyze/v2', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || '分析の取得中にエラーが発生しました。');
      }

      const data: ForecastResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {timeframes.map((timeframe) => (
          <div key={timeframe}>
            <label htmlFor={`image_${timeframe}`} className="block text-sm font-medium text-gray-700">
              {timeframe.toUpperCase()} チャート
            </label>
            <input
              type="file"
              id={`image_${timeframe}`}
              name={timeframe}
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {previews[timeframe] && (
              <div className="mt-2">
                <img src={previews[timeframe]} alt={`${timeframe} preview`} className="max-w-full h-auto rounded-lg" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          コメント (任意)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? '生成中...' : '予想を生成'}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {response && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-bold mb-2">予想結果</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">分析</h3>
              <p className="whitespace-pre-wrap">{response.analysis}</p>
            </div>
            <div>
              <h3 className="font-semibold">トレード計画</h3>
              <p className="whitespace-pre-wrap">{response.trade_plan}</p>
            </div>
            <div>
                <h3 className="font-semibold">画像ID</h3>
                <ul>
                    {Object.entries(response.image_ids).map(([timeframe, id]) => (
                        <li key={id}>{timeframe}: {id}</li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
