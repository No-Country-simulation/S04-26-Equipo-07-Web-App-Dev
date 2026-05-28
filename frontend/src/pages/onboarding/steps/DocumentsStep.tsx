import { useRef, useState } from "react"
import { Upload, X, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"

export default function DocumentsStep() {
  const { data, uploadDocument, removeDocument, uploadError, invitationToken } = useOnboarding()
  const fileInputRef = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // cuando no hay token de invitacion (flujo standalone) el upload es solo local
  const hasToken = Boolean(invitationToken)

  const handleFileSelect = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading((prev) => ({ ...prev, [id]: true }))
    await uploadDocument(id, file)
    setUploading((prev) => ({ ...prev, [id]: false }))
    // reset el input para poder re-seleccionar el mismo archivo si es necesario
    if (fileInputRef.current[id]) fileInputRef.current[id]!.value = ""
  }

  return (
    <div className="space-y-8">
      <p className="font-body text-body text-on-surface-variant">
        Sube los siguientes documentos para verificar tu identidad y cumplir con los requisitos fiscales.
        Formatos aceptados: PDF, PNG, JPG (máx. 10 MB cada uno).
      </p>

      {!hasToken && (
        <div className="flex items-start gap-3 border border-color-border bg-surface-variant/30 p-4">
          <AlertCircle size={16} className="text-on-surface-variant mt-0.5 shrink-0" />
          <p className="font-caption-mono text-caption-mono text-on-surface-variant text-xs">
            Los archivos se cargarán al servidor cuando completes el registro.
          </p>
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="font-caption-mono text-caption-mono text-red-400 text-xs">{uploadError}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-color-border bg-color-surface p-6 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-caption-mono text-sm border ${
                doc.uploaded
                  ? "bg-primary-container/10 border-primary-container text-primary-container"
                  : uploading[doc.id]
                  ? "border-color-border text-on-surface-variant"
                  : "border-color-border text-on-surface-variant"
              }`}>
                {uploading[doc.id] ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : doc.uploaded ? (
                  "✓"
                ) : (
                  `${data.documents.indexOf(doc) + 1}`
                )}
              </div>
              <div className="min-w-0">
                <p className="font-heading-sm text-white text-sm">{doc.name}</p>
                {uploading[doc.id] && (
                  <p className="font-caption-mono text-caption-mono text-on-surface-variant mt-1 text-xs">
                    Subiendo...
                  </p>
                )}
                {doc.uploaded && doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-caption-mono text-caption-mono text-primary-container mt-1 hover:text-primary-fixed text-xs truncate max-w-xs"
                  >
                    <ExternalLink size={10} />
                    Ver documento
                  </a>
                )}
                {doc.uploaded && !doc.url && doc.fileName && (
                  <p className="font-caption-mono text-caption-mono text-primary-container mt-1 text-xs truncate">
                    {doc.fileName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {doc.uploaded ? (
                <button
                  onClick={() => removeDocument(doc.id)}
                  disabled={uploading[doc.id]}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:text-color-warning transition-colors border border-color-border hover:border-color-warning/50 disabled:opacity-40"
                >
                  <X size={14} />
                  <span className="font-caption-mono text-caption-mono uppercase tracking-widest">Eliminar</span>
                </button>
              ) : uploading[doc.id] ? (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container/10 text-primary-container/50 border border-primary-container/20 cursor-not-allowed"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span className="font-caption-mono text-caption-mono uppercase tracking-widest">Subiendo...</span>
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current[doc.id]?.click()}
                  disabled={uploading[doc.id]}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container/10 text-primary-container hover:bg-primary-container/20 transition-colors border border-primary-container/30 disabled:opacity-40"
                >
                  {uploading[doc.id] ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span className="font-caption-mono text-caption-mono uppercase tracking-widest">
                    {uploading[doc.id] ? "Subiendo" : "Subir"}
                  </span>
                </button>
              )}
              <input
                ref={(el) => { fileInputRef.current[doc.id] = el }}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => handleFileSelect(doc.id, e)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
