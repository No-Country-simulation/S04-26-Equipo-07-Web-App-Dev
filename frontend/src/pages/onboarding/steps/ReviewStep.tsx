import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"

export default function ReviewStep() {
  const { data } = useOnboarding()
  const { personalInfo, documents, contract, payment } = data

  const allDocsUploaded = documents.every((d) => d.uploaded)

  return (
    <div className="space-y-8">
      <p className="font-body text-body text-on-surface-variant">
        Revisa toda la información antes de finalizar tu registro. Puedes regresar a cualquier paso
        para hacer cambios.
      </p>

      <Section title="Información Personal">
        <Row label="Nombre" value={personalInfo.fullName} />
        <Row label="Email" value={personalInfo.email} />
        <Row label="Teléfono" value={`${personalInfo.phoneCode} ${personalInfo.phone}`} />
        <Row label="Fecha de Nacimiento" value={personalInfo.dateOfBirth} />
        <Row label="Dirección" value={`${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state}, ${personalInfo.zipCode}`} />
        <Row label="País" value={personalInfo.country} />
      </Section>

      <Section title="Documentos">
        {documents.map((doc) => (
          <Row
            key={doc.id}
            label={doc.name}
            value={doc.uploaded ? "✓ Subido" : "✗ Pendiente"}
            valueClass={doc.uploaded ? "text-primary-container" : "text-color-warning"}
          />
        ))}
      </Section>

      <Section title="Contrato">
        <Row label="Estado" value={contract.accepted ? "✓ Aceptado" : "✗ Pendiente"} valueClass={contract.accepted ? "text-primary-container" : "text-color-warning"} />
        <Row label="Firma" value={contract.signature || "—"} />
        <Row label="Fecha de Firma" value={contract.signedAt ? new Date(contract.signedAt).toLocaleString("es-MX") : "—"} />
      </Section>

      <Section title="Método de Pago">
        <Row label="Banco" value={payment.bankName} />
        <Row label="Tipo de Cuenta" value={payment.accountType === "checking" ? "Cheques" : payment.accountType === "savings" ? "Ahorros" : "PayPal"} />
        <Row label="Cuenta / CLABE" value={payment.accountNumber} />
        <Row label="Routing" value={payment.routingNumber} />
        <Row label="Moneda" value={payment.currency} />
      </Section>

      {(!personalInfo.fullName || !allDocsUploaded || !contract.accepted || !payment.bankName) && (
        <div className="border border-color-warning/30 bg-color-warning/5 p-4">
          <p className="font-caption-mono text-caption-mono text-color-warning uppercase tracking-widest">
            ⚡ Faltan campos por completar. Revisa los pasos anteriores.
          </p>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container mb-4 pb-2 border-b border-color-border">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
      <span className={`font-body-sm text-body-sm text-white ${valueClass || ""}`}>{value || "—"}</span>
    </div>
  )
}
