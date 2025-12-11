'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import ClutchStatusTracker from './ClutchStatusTracker';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
  preview: string | null;
  clutchId: string | null;
}

interface ImageUploadProps {
  onComplete?: (clutchId: string) => void;
}

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUpload({ onComplete }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
    preview: null,
    clutchId: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!VALID_TYPES.includes(file.type)) {
      return 'Please select an image file (JPEG, PNG, GIF, or WebP)';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setState(prev => ({ ...prev, error, uploadedUrl: null, preview: null }));
      return;
    }

    // Generate preview
    const previewUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      error: null,
      uploading: true,
      progress: 0,
      preview: previewUrl
    }));

    try {
      // Request presigned URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/clutches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { presignedUrl, objectKey, clutchId } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        uploadedUrl: objectKey,
        clutchId,
        error: null
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setState(prev => ({
        ...prev,
        uploading: false,
        error: err instanceof Error ? err.message : 'Upload failed. Please try again.',
        uploadedUrl: null,
        clutchId: null
      }));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    // Clean up preview URL to prevent memory leaks
    if (state.preview) {
      URL.revokeObjectURL(state.preview);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Reset state
    setState({
      uploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
      preview: null,
      clutchId: null
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${state.uploading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {state.uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : state.clutchId ? (
          <div className="space-y-4">
            <ClutchStatusTracker
              clutchId={state.clutchId}
              onComplete={() => {
                // Redirect to main results view when analysis completes
                if (onComplete && state.clutchId) {
                  onComplete(state.clutchId);
                }
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRetry();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Count More Chickens
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your eggs here for counting
              </p>
              <p className="text-sm text-gray-500 mt-1">
                We'll predict which ones become chickens
              </p>
            </div>
            <p className="text-xs text-gray-400">
              JPEG, PNG, GIF, WebP welcome • Grandma's advice not required
            </p>
          </div>
        )}
      </div>

      {state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800">{state.error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
