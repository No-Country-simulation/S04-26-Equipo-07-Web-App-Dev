import { useState, useCallback } from "react"
import { uploadToCloudinary } from "@/lib/api/cloudinary"
import { USE_MOCK } from "@/lib/api/config"

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600))
      setIsUploading(false)
      return { url: URL.createObjectURL(file), public_id: file.name }
    }

    try {
      const result = await uploadToCloudinary(file)
      return result
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al subir el archivo"
      setError(message)
      throw e
    } finally {
      setIsUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { upload, isUploading, error, reset }
}
