'use client';

import { ChangeEvent, useState, useEffect } from 'react';
import ImageModal from '@/components/common/ImageModal';

interface ImageUploadGridProps {
  images: { [key: string]: File | null };
  onImageChange: (timeframe: string, file: File | null) => void;
}

const timeframes = [
  { key: '1m', label: '1分足' },
  { key: '5m', label: '5分足' },
  { key: '15m', label: '15分足' },
  { key: '1h', label: '1時間足' },
  { key: '4h', label: '4時間足' },
  { key: 'd1', label: '日足' },
];

export default function ImageUploadGrid({ images, onImageChange }: ImageUploadGridProps) {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const newPreviews: { [key: string]: string } = {};
    
    Object.entries(images).forEach(([key, file]) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    });

    return () => {
      Object.values(previews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const handleFileChange = (timeframe: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(timeframe, file);
  };

  const handleRemoveImage = (timeframe: string) => {
    onImageChange(timeframe, null);
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[timeframe];
      return newPreviews;
    });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
      {timeframes.map(({ key, label }) => (
        <div
          key={key}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </p>
            
            {images[key] ? (
              <div className="space-y-2">
                {previews[key] && (
                  <div className="relative w-full h-32 mb-2">
                    <img
                      src={previews[key]}
                      alt={`${label} プレビュー`}
                      className="w-full h-full object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setModalImage({
                        src: previews[key],
                        alt: `${label} プレビュー`
                      })}
                    />
                  </div>
                )}
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {images[key]!.name}
                </div>
                <div className="text-xs text-gray-500">
                  {(images[key]!.size / 1024).toFixed(1)} KB
                </div>
                <button
                  onClick={() => handleRemoveImage(key)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  削除
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-xs text-gray-500">
                    クリックして選択
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange(key)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      ))}
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