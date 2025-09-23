"use client";

import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";

type Props = { 
  src?: string | null; 
  alt: string; 
  size?: number;
  clickable?: boolean; // Новый проп для включения/выключения кликабельности
};

// Helper function to convert relative URLs to absolute backend URLs
const getFullAvatarUrl = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null;
  
  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // If it's a relative path, prepend backend base URL
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:8000";
  return `${backendBase}${avatarUrl}`;
};

export default function Avatar({ src, alt, size = 64, clickable = true }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAvatarModal = () => {
    if (src && clickable) {
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

  const cls = "rounded-full bg-slate-200 dark:bg-slate-800 object-cover";
  
  if (!src) {
    return (
      <div
        className={`${cls} flex items-center justify-center bg-slate-700`}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        <User className="text-slate-400" size={size * 0.6} />
      </div>
    );
  }

  const fullAvatarUrl = getFullAvatarUrl(src);

  return (
    <>
      <img 
        src={fullAvatarUrl || ''} 
        alt={alt} 
        width={size} 
        height={size} 
        className={`${cls} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={clickable ? openAvatarModal : undefined}
        title={clickable ? "Click to view full size" : undefined}
      />

      {/* Avatar Modal */}
      {isModalOpen && src && (
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
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Avatar image */}
            <div className="p-8">
              <img
                src={fullAvatarUrl || ''}
                alt={alt}
                className="w-full h-full max-w-2xl max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            
            {/* Modal footer */}
            <div className="px-8 pb-6 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Click outside or press ESC to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

