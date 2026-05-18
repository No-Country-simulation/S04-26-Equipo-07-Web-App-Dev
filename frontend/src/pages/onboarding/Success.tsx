import { Check } from "lucide-react"

export default function Success() {

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <main className="max-w-lg mx-auto px-8 text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary-container/20 border-2 border-primary-container flex items-center justify-center animate-pulse">
          <Check size={36} className="text-primary-container" />
        </div>

        <h1 className="font-display text-display text-white mb-6 text-4xl md:text-5xl">
          ¡Registro <span className="gradient-text">Completado</span>!
        </h1>

        <p className="font-body text-body text-on-surface-variant mb-12 max-w-md mx-auto">
          Hemos recibido toda tu documentación e información. Nuestro equipo de cumplimiento
          revisará tus datos y te notificaremos por whatsapp una vez que tu perfil
          esté revisado.
        </p>

        <div className="border border-color-border bg-surface p-6 mb-12 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-color-warning" />
            <span className="font-caption-mono text-caption-mono text-on-surface-variant uppercase tracking-widest">
              Revisión de documentos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-color-warning" />
            <span className="font-caption-mono text-caption-mono text-on-surface-variant uppercase tracking-widest">
              Verificación de identidad
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-caption-mono text-caption-mono text-primary-container uppercase tracking-widest">
              Notificación por correo electrónico
            </span>
          </div>
        </div>

        {/*<button
          onClick={() => navigate("/")}
          className="bg-primary-container text-black font-body text-body px-10 py-4 hover:bg-primary-fixed transition-all font-bold uppercase tracking-wider"
        >
          Volver al Inicio
        </button>*/}
      </main>
    </div>
  )
}
