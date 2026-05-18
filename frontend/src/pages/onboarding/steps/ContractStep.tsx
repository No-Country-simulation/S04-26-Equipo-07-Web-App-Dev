import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"

export default function ContractStep() {
  const { data, acceptContract } = useOnboarding()
  const { contract } = data

  const handleAcceptChange = (checked: boolean) => {
    if (!checked) return
    acceptContract(data.personalInfo.fullName || "Firmante")
  }

  return (
    <div className="space-y-8">
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

      <div className="space-y-2">
        <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
          Firma Electrónica (Nombre Completo)
        </label>
        <Input
          value={contract.signature || data.personalInfo.fullName}
          onChange={(e) => {
            if (contract.accepted) return
            acceptContract(e.target.value)
          }}
          placeholder="Escribe tu nombre completo como firma"
          className="font-display text-lg tracking-wide"
        />
        <p className="font-caption-mono text-caption-mono text-on-surface-variant mt-1">
          Tu nombre escrito constituye tu firma electrónica vinculante.
        </p>
      </div>

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
    </div>
  )
}
