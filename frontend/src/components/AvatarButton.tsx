"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface AvatarButtonProps {
  currentAvatarUrl: string | null;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

const getFullAvatarUrl = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null;
  
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  return `${backendBase}${avatarUrl}`;
};

export default function AvatarButton({ currentAvatarUrl, onAvatarUpdate, size = "md" }: AvatarButtonProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-20 h-20"
  };

  const uploadFile = useCallback(async (file: File) => {
    const token = getToken();
    if (!token) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api<{ avatar_url: string }>("/auth/avatar", {
        method: "POST",
        body: formData,
      }, token);

      onAvatarUpdate(response.avatar_url);
      setShowUploadModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarUpdate]);

  const removeAvatar = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setIsUploading(true);
    setError(null);

    try {
      await api("/auth/avatar", { method: "DELETE" }, token);
      onAvatarUpdate("");
      setShowUploadModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarUpdate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {/* Avatar Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-colors cursor-pointer`}
      >
        {currentAvatarUrl ? (
          <img
            src={getFullAvatarUrl(currentAvatarUrl) || ''}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </button>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Загрузить аватар</h3>
            
            {/* Current Avatar Preview */}
            {currentAvatarUrl && (
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 border-2 border-slate-300 dark:border-slate-600">
                  <img
                    src={getFullAvatarUrl(currentAvatarUrl) || ''}
                    alt="Current avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={removeAvatar}
                  disabled={isUploading}
                  className="text-sm text-red-500 hover:text-red-600 underline"
                >
                  Удалить аватар
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
            >
              <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Перетащите изображение сюда или нажмите для выбора
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                PNG, JPG, WebP до 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Выбрать файл
              </label>
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-500 text-center">{error}</div>
            )}

            {isUploading && (
              <div className="mt-3 text-sm text-blue-500 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-1"></div>
                Загрузка...
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
