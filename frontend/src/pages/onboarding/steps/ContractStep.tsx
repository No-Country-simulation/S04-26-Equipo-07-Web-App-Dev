import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"
import { contractSchema } from "@/stores/onboardingSchemas"
import { useState, useCallback } from "react"
import { ExternalLink, FileSignature, ShieldCheck } from "lucide-react"

type FieldErrors = Record<string, string>

export default function ContractStep() {
  const { data, acceptContract } = useOnboarding()
  const { contract } = data
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [openSignRequested, setOpenSignRequested] = useState(false)

  const validate = useCallback(() => {
    const result = contractSchema.safeParse(contract)
    if (result.success) {
      setErrors({})
      return true
    }
    const fieldErrors: FieldErrors = {}
    for (const issue of result.error.issues) {
      const path = issue.path[0] as string
      if (!fieldErrors[path]) fieldErrors[path] = issue.message
    }
    setErrors(fieldErrors)
    return false
  }, [contract])

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate()
  }

  const handleAcceptChange = (checked: boolean) => {
    if (!checked) return
    acceptContract(data.personalInfo.fullName || "Firmante")
    setTouched((prev) => ({ ...prev, accepted: true }))
    setTimeout(validate, 0)
  }

  const handleSignatureChange = (value: string) => {
    if (contract.accepted) return
    acceptContract(value)
    if (touched.signature) validate()
  }

  // abre el portal OpenSign en nueva pestaña para la firma electronica avanzada
  const handleOpenSign = () => {
    // URL del portal OpenSign sandbox — en produccion apunta al documento generado
    const opensignUrl = `https://app.opensignlabs.com/`
    window.open(opensignUrl, "_blank", "noopener,noreferrer")
    setOpenSignRequested(true)
  }

  return (
    <div className="space-y-8">
      {/* contenido del contrato */}
      <div className="border border-color-border bg-color-surface max-h-80 overflow-y-auto p-6">
        <div className="space-y-4 text-sm text-on-surface-variant">
          <h3 className="font-heading-sm text-white text-base uppercase tracking-widest">
            CONTRATO DE SERVICIOS - NORTHPAY
          </h3>

          <p>
            Este contrato de servicios (el "Contrato") se celebra entre NorthPay Operations
            ("NorthPay") y el contratista identificado en el registro ("Contratista").
          </p>

          <h4 className="font-heading-sm text-white text-sm mt-6">1. SERVICIOS</h4>
          <p>
            El Contratista se compromete a prestar los servicios profesionales descritos en la
            propuesta de servicios adjunta, actuando como contratista independiente y no como
            empleado de NorthPay o de sus clientes.
          </p>

          <h4 className="font-heading-sm text-white text-sm mt-6">2. COMPENSACIÓN</h4>
          <p>
            NorthPay facilitará los pagos al Contratista conforme a la estructura de compensación
            acordada. Los pagos se realizarán en la moneda seleccionada por el Contratista dentro
            de los 15 días hábiles posteriores a la recepción del pago del cliente final.
          </p>

          <h4 className="font-heading-sm text-white text-sm mt-6">3. CUMPLIMIENTO FISCAL</h4>
          <p>
            El Contratista es responsable de declarar y pagar sus propios impuestos. NorthPay
            proporcionará la documentación fiscal necesaria (facturas, recibos) para facilitar
            el cumplimiento de las obligaciones tributarias del Contratista en su jurisdicción.
          </p>

          <h4 className="font-heading-sm text-white text-sm mt-6">4. CONFIDENCIALIDAD</h4>
          <p>
            El Contratista se compromete a mantener la confidencialidad de toda la información
            comercial, técnica y personal a la que tenga acceso durante la prestación de los
            servicios, incluso después de la terminación del presente Contrato.
          </p>

          <h4 className="font-heading-sm text-white text-sm mt-6">5. TERMINACIÓN</h4>
          <p>
            Cualquiera de las partes puede terminar este Contrato con un aviso previo de 30 días.
            NorthPay se reserva el derecho de terminar el Contrato inmediatamente en caso de
            incumplimiento de las cláusulas de confidencialidad o cumplimiento fiscal.
          </p>

          <p className="text-primary-container mt-6 font-medium">
            Al aceptar este contrato, el Contratista confirma haber leído y aceptado todos los
            términos y condiciones establecidos anteriormente.
          </p>
        </div>
      </div>

      {/* OpenSign — firma electronica avanzada */}
      <div className="border border-color-border bg-color-surface p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FileSignature size={18} className="text-primary-container" />
          <h4 className="font-caption-mono text-caption-mono uppercase tracking-widest text-white text-xs">
            Firma Digital con OpenSign
          </h4>
        </div>
        <p className="font-body text-body-sm text-on-surface-variant text-sm">
          Para una firma electrónica con validez legal avanzada, puedes usar OpenSign.
          Tu firma quedará registrada con sello de tiempo y certificado criptográfico.
        </p>
        <button
          type="button"
          onClick={handleOpenSign}
          className="flex items-center gap-2 px-4 py-2 border border-primary-container/40 text-primary-container hover:bg-primary-container/10 transition-all font-caption-mono text-caption-mono uppercase tracking-widest text-xs"
        >
          <ExternalLink size={12} />
          Abrir Portal OpenSign
        </button>
        {openSignRequested && (
          <div className="flex items-center gap-2 border border-primary-container/20 bg-primary-container/5 px-4 py-2">
            <ShieldCheck size={14} className="text-primary-container" />
            <p className="font-caption-mono text-caption-mono text-primary-container text-xs">
              Portal abierto — completa la firma y regresa para continuar.
            </p>
          </div>
        )}
      </div>

      {/* firma electronica simple (nombre) */}
      <div className="space-y-2">
        <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
          Firma Electrónica (Nombre Completo)
        </label>
        <Input
          value={contract.signature || data.personalInfo.fullName}
          onChange={(e) => handleSignatureChange(e.target.value)}
          onBlur={() => handleBlur("signature")}
          placeholder="Escribe tu nombre completo como firma"
          className="font-display text-lg tracking-wide"
        />
        {touched.signature && errors.signature && (
          <p className="font-caption-mono text-caption-mono text-color-warning">{errors.signature}</p>
        )}
        <p className="font-caption-mono text-caption-mono text-on-surface-variant mt-1">
          Tu nombre escrito constituye tu firma electrónica vinculante conforme a la legislación aplicable.
        </p>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={contract.accepted}
            onCheckedChange={(checked) => handleAcceptChange(checked as boolean)}
            className="mt-0.5"
          />
          <span className="font-body text-body text-on-surface-variant group-hover:text-white transition-colors">
            He leído y acepto los términos y condiciones del Contrato de Servicios de NorthPay,
            incluyendo las cláusulas de confidencialidad y cumplimiento fiscal.
          </span>
        </label>
        {touched.accepted && errors.accepted && (
          <p className="font-caption-mono text-caption-mono text-color-warning">{errors.accepted}</p>
        )}
      </div>
    </div>
  )
}
