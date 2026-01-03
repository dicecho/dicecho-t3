'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFileUpload, type FileMetadata } from '@/hooks/use-file-upload';
import { useUploadOSS } from '@/hooks/use-uploader-assume';
import { Button } from '@/components/ui/button';
import { CloudUpload, ImageIcon, XIcon, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/react';
import { toast } from 'sonner';

interface GalleryUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
}

export default function GalleryUpload({
  value = [],
  onChange,
  maxFiles = 20,
  maxSize = 5 * 1024 * 1024,
  accept = 'image/*',
  className,
}: GalleryUploadProps) {
  const { t } = useTranslation();
  const { upload, isUploading, progress } = useUploadOSS();

  const [images, setImages] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    setImages(value);
  }, [value]);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const result = await upload(file);
        return result.url;
      } catch (error) {
        toast.error(t('upload_failed'), {
          description: error instanceof Error ? error.message : t('upload_failed'),
        });
        return null;
      }
    },
    [upload, t],
  );

  const [
    { isDragging },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple: true,
    onFilesAdded: async (files) => {
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        if (!fileItem) continue;
        const file = fileItem.file;
        if (!(file instanceof File)) continue;

        setUploadingIndex(images.length + i);

        const url = await handleUpload(file);
        if (url) {
          setImages((prev) => {
            const newImages = [...prev, url];
            onChange?.(newImages);
            return newImages;
          });
          toast.success(t('upload_success'));
        }
      }
      setUploadingIndex(null);
    },
  });

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      onChange?.(newImages);
      return newImages;
    });
  };

  const canAddMore = images.length < maxFiles;

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
          >
            <img src={url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeImage(index)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {isUploading && uploadingIndex !== null && (
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary bg-primary/5">
            <div className="relative">
              <svg className="size-12 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        )}

        {canAddMore && !isUploading && (
          <div
            className={cn(
              'relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border transition-all duration-200',
              isDragging
                ? 'border-dashed border-primary bg-primary/5'
                : 'border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5',
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input {...getInputProps()} className="sr-only" />
            <CloudUpload className="size-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('upload')}</span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} / {maxFiles} {t('images')}
        </p>
      )}
    </div>
  );
}
