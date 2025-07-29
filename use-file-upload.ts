"use client"

import { useState } from "react"
import { storageOperations, dbOperations } from "@/lib/supabase-client"

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadCarImages = async (files: File[], carId: string) => {
    setUploading(true)
    const uploadedImages = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 100)

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await storageOperations.uploadCarImage(file, carId)

        if (storageError) {
          console.error("Storage upload error:", storageError)
          continue
        }

        // Save to database
        const imageData = {
          car_id: carId,
          image_url: storageData.publicUrl,
          image_name: file.name,
          is_primary: i === 0, // First image is primary
        }

        const { data: dbData, error: dbError } = await dbOperations.addCarImage(imageData)

        if (dbError) {
          console.error("Database save error:", dbError)
          continue
        }

        uploadedImages.push(dbData[0])
      }

      setUploadProgress(100)
      return { success: true, images: uploadedImages }
    } catch (error) {
      console.error("Upload error:", error)
      return { success: false, error }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const uploadCarDocuments = async (files: File[], carId: string) => {
    setUploading(true)
    const uploadedDocuments = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 100)

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await storageOperations.uploadCarDocument(file, carId)

        if (storageError) {
          console.error("Storage upload error:", storageError)
          continue
        }

        // Save to database
        const documentData = {
          car_id: carId,
          document_url: storageData.publicUrl,
          document_name: file.name,
          document_type: file.type || "application/octet-stream",
        }

        const { data: dbData, error: dbError } = await dbOperations.addCarDocument(documentData)

        if (dbError) {
          console.error("Database save error:", dbError)
          continue
        }

        uploadedDocuments.push(dbData[0])
      }

      setUploadProgress(100)
      return { success: true, documents: uploadedDocuments }
    } catch (error) {
      console.error("Upload error:", error)
      return { success: false, error }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const uploadDebtDocuments = async (files: File[], debtId: string) => {
    setUploading(true)
    const uploadedDocuments = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 100)

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await storageOperations.uploadDebtDocument(file, debtId)

        if (storageError) {
          console.error("Storage upload error:", storageError)
          continue
        }

        uploadedDocuments.push({
          url: storageData.publicUrl,
          name: file.name,
          type: file.type,
        })
      }

      setUploadProgress(100)
      return { success: true, documents: uploadedDocuments }
    } catch (error) {
      console.error("Upload error:", error)
      return { success: false, error }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploading,
    uploadProgress,
    uploadCarImages,
    uploadCarDocuments,
    uploadDebtDocuments,
  }
}
