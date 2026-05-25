import { useRef } from "react"
import { Upload, X } from "lucide-react"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"

export default function DocumentsStep() {
  const { data, uploadDocument, removeDocument } = useOnboarding()
  const fileInputRef = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadDocument(id, file)
  }

  return (
    <div className="space-y-8">
      <p className="font-body text-body text-on-surface-variant">
        Sube los siguientes documentos para verificar tu identidad y cumplir con los requisitos fiscales.
        Formatos aceptados: PDF, PNG, JPG (máx. 10 MB cada uno).
      </p>

      <div className="space-y-4">
        {data.documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-color-border bg-color-surface p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center font-caption-mono text-sm border ${
                doc.uploaded
                  ? "bg-primary-container/10 border-primary-container text-primary-container"
                  : "border-color-border text-on-surface-variant"
              }`}>
                {doc.uploaded ? "✓" : `${data.documents.indexOf(doc) + 1}`}
              </div>
              <div>
                <p className="font-heading-sm text-white text-sm">{doc.name}</p>
                {doc.fileName && (
                  <p className="font-caption-mono text-caption-mono text-primary-container mt-1">
                    {doc.fileName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {doc.uploaded ? (
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:text-color-warning transition-colors border border-color-border hover:border-color-warning/50"
                >
                  <X size={14} />
                  <span className="font-caption-mono text-caption-mono uppercase tracking-widest">Eliminar</span>
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current[doc.id]?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-container/10 text-primary-container hover:bg-primary-container/20 transition-colors border border-primary-container/30"
                >
                  <Upload size={14} />
                  <span className="font-caption-mono text-caption-mono uppercase tracking-widest">Subir</span>
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
