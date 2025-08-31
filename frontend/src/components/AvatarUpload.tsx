"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Upload, X, User } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useI18n } from "@/components/I18nProvider";

// Helper function to convert relative URLs to absolute backend URLs
const getFullAvatarUrl = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null;
  
  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // If it's a relative path, prepend backend base URL
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  return `${backendBase}${avatarUrl}`;
};

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarUpdate, 
  size = "md" 
}: AvatarUploadProps) {
  const { t } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('avatar_upload_error_file_type'));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('avatar_upload_error_file_size'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Uploading file:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      console.log('FormData created, sending request...');
      console.log('FormData entries:', Array.from(formData.entries()));

      const response = await api<{ avatar_url: string }>(
        "/auth/avatar",
        { 
          method: "POST", 
          body: formData 
        },
        token
      );

      console.log('Upload response:', response);
      console.log('Avatar URL from response:', response.avatar_url);
      onAvatarUpdate(response.avatar_url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : t('avatar_upload_error_upload_failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const token = getToken();
      if (!token) return;

      console.log('Removing avatar...');

      console.log('Sending remove request...');

      const response = await api<{ avatar_url: string }>("/auth/avatar", { 
        method: "DELETE"
      }, token);

      console.log('Avatar removed successfully:', response);
      onAvatarUpdate(response.avatar_url);
    } catch (err) {
      console.error('Remove avatar error:', err);
      setError(err instanceof Error ? err.message : t('avatar_upload_error_remove_failed'));
    }
  };

  const openAvatarModal = () => {
    if (currentAvatarUrl) {
      setIsModalOpen(true);
    }
  };

  const closeAvatarModal = () => {
    setIsModalOpen(false);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeAvatarModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
  }, [uploadFile]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
  }, [uploadFile]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Display */}
      <div className={`relative ${sizeClasses[size]} group`}>
        {currentAvatarUrl ? (
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={openAvatarModal}
            title={t('avatar_upload_click_to_view')}
          >
            <img
              src={getFullAvatarUrl(currentAvatarUrl) || ''}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-slate-200 dark:border-slate-700 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
            <User className="w-1/2 h-1/2 text-slate-400" />
          </div>
        )}
        
        {/* Remove button overlay */}
        {currentAvatarUrl && (
          <button
            onClick={removeAvatar}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
            title={t('avatar_upload_remove_tooltip')}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`w-full max-w-xs border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="avatar-upload"
          disabled={isUploading}
        />
        
        <label 
          htmlFor="avatar-upload" 
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className={`w-6 h-6 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
          <div className="text-sm">
            {isUploading ? (
              <span className="text-blue-500">{t('avatar_upload_uploading')}</span>
            ) : (
              <>
                <span className="text-slate-600 dark:text-slate-400">
                  {t('avatar_upload_drop_text').split('click to browse').map((part, i) => 
                    i === 0 ? part : (
                      <span key={i}>
                        <span className="text-blue-500 underline">click to browse</span>
                        {part}
                      </span>
                    )
                  )}
                </span>
                <div className="text-xs text-slate-500 mt-1">
                  {t('avatar_upload_supported_formats')}
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Avatar Modal */}
      {isModalOpen && currentAvatarUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeAvatarModal}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeAvatarModal}
              className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors z-10"
              title={t('avatar_upload_close_modal')}
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Avatar image */}
            <div className="p-8">
              <img
                src={getFullAvatarUrl(currentAvatarUrl) || ''}
                alt="Avatar"
                className="w-full h-full max-w-2xl max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            
            {/* Modal footer */}
            <div className="px-8 pb-6 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t('avatar_upload_modal_description')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
