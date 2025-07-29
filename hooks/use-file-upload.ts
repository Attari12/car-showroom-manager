"use client"

import { useState, useCallback } from "react"
import { uploadFile, getFileUrl } from "@/lib/supabase-client"

export interface UploadProgress {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  url?: string
  error?: string
}

export interface UploadResult {
  success: boolean
  urls: string[]
  error?: string
}

interface UseFileUploadOptions {
  bucket: string
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
  onError?: (error: string) => void
  onSuccess?: (urls: string[]) => void
}

export function useFileUpload(options: UseFileUploadOptions = { bucket: "default" }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Legacy properties for backward compatibility
  const uploading = isUploading
  const uploadProgress =
    uploads.length > 0 ? Math.round(uploads.reduce((acc, upload) => acc + upload.progress, 0) / uploads.length) : 0

  const validateFile = useCallback(
    (file: File): string | null => {
      if (options.maxSize && file.size > options.maxSize) {
        return `File ${file.name} is too large. Maximum size is ${(options.maxSize / (1024 * 1024)).toFixed(1)}MB`
      }

      if (
        options.allowedTypes &&
        !options.allowedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })
      ) {
        return `File ${file.name} has an unsupported format`
      }

      return null
    },
    [options.maxSize, options.allowedTypes],
  )

  const uploadFiles = useCallback(
    async (files: File[], pathPrefix = ""): Promise<string[]> => {
      if (!files.length) return []

      const filesToUpload = files.slice(0, options.maxFiles || 10)

      // Validate files
      for (const file of filesToUpload) {
        const error = validateFile(file)
        if (error) {
          options.onError?.(error)
          throw new Error(error)
        }
      }

      setIsUploading(true)

      // Initialize upload progress
      const initialUploads: UploadProgress[] = filesToUpload.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      }))

      setUploads(initialUploads)

      const uploadedUrls: string[] = []

      try {
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i]

          // Update status to uploading
          setUploads((prev) =>
            prev.map((upload, index) =>
              index === i ? { ...upload, status: "uploading" as const, progress: 10 } : upload,
            ),
          )

          try {
            const timestamp = Date.now()
            const fileName = `${pathPrefix}${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setUploads((prev) =>
                prev.map((upload, index) =>
                  index === i && upload.progress < 90 ? { ...upload, progress: upload.progress + 10 } : upload,
                ),
              )
            }, 100)

            const result = await uploadFile(file, options.bucket, fileName)
            clearInterval(progressInterval)

            if (result) {
              const publicUrl = getFileUrl(options.bucket, fileName)
              uploadedUrls.push(publicUrl)

              // Update to completed
              setUploads((prev) =>
                prev.map((upload, index) =>
                  index === i
                    ? {
                        ...upload,
                        status: "completed" as const,
                        progress: 100,
                        url: publicUrl,
                      }
                    : upload,
                ),
              )
            } else {
              throw new Error("Upload failed")
            }
          } catch (error: any) {
            // Update to error
            setUploads((prev) =>
              prev.map((upload, index) =>
                index === i
                  ? {
                      ...upload,
                      status: "error" as const,
                      error: error.message,
                    }
                  : upload,
              ),
            )

            console.error(`Failed to upload ${file.name}:`, error)
          }
        }

        setUploadedFiles((prev) => [...prev, ...uploadedUrls])
        options.onSuccess?.(uploadedUrls)

        return uploadedUrls
      } catch (error: any) {
        options.onError?.(error.message)
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [options, validateFile],
  )

  const uploadCarImages = useCallback(
    async (files: File[], carId: string): Promise<string[]> => {
      return uploadFiles(files, `cars/${carId}/images/`)
    },
    [uploadFiles],
  )

  const uploadCarDocuments = useCallback(
    async (files: File[], carId: string): Promise<string[]> => {
      return uploadFiles(files, `cars/${carId}/documents/`)
    },
    [uploadFiles],
  )

  const clearUploads = useCallback(() => {
    setUploads([])
    setUploadedFiles([])
  }, [])

  const removeUpload = useCallback((index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const reset = useCallback(() => {
    setUploads([])
    setUploadedFiles([])
    setIsUploading(false)
  }, [])

  return {
    uploads,
    isUploading,
    uploadedFiles,
    uploading, // Legacy property
    uploadProgress, // Legacy property
    uploadFiles,
    uploadCarImages,
    uploadCarDocuments,
    clearUploads,
    removeUpload,
    reset,
  }
}
