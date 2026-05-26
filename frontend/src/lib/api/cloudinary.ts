export const uploadToCloudinary = async (file: File) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !preset) {
    throw new Error("Cloudinary config missing. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", preset)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Cloudinary upload failed (${res.status})`)
  }

  const data = await res.json()

  return {
    url: data.secure_url as string,
    public_id: data.public_id as string,
  }
}