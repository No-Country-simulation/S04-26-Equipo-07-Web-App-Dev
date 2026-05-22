import { Input } from "@/components/ui/input"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"
import { paymentSchema } from "@/stores/onboardingSchemas"
import { useState, useCallback } from "react"

type FieldErrors = Record<string, string>

export default function PaymentStep() {
  const { data, updatePayment } = useOnboarding()
  const { payment } = data
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = useCallback(() => {
    const result = paymentSchema.safeParse(payment)
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
  }, [payment])

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate()
  }

  const handleChange = (field: string, value: string) => {
    updatePayment({ [field]: value })
    if (touched[field]) validate()
  }

  return (
    <div className="space-y-8">
      <p className="font-body text-body text-on-surface-variant">
        Configura tu método de cobro para recibir los pagos de tus servicios de forma rápida y segura.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Banco
          </label>
          <Input
            value={payment.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            onBlur={() => handleBlur("bankName")}
            placeholder="BBVA, Santander, etc."
          />
          {touched.bankName && errors.bankName && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.bankName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Tipo de Cuenta
          </label>
          <select
            value={payment.accountType}
            onChange={(e) => handleChange("accountType", e.target.value)}
            onBlur={() => handleBlur("accountType")}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-white dark:bg-input/30"
          >
            <option value="checking" className="bg-surface text-white">Cheques</option>
            <option value="savings" className="bg-surface text-white">Ahorros</option>
            <option value="paypal" className="bg-surface text-white">PayPal</option>
          </select>
          {touched.accountType && errors.accountType && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.accountType}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Número de Cuenta / CLABE
          </label>
          <Input
            value={payment.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            onBlur={() => handleBlur("accountNumber")}
            placeholder="0000 0000 0000 0000"
          />
          {touched.accountNumber && errors.accountNumber && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.accountNumber}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Código de Rastreo / Routing
          </label>
          <Input
            value={payment.routingNumber}
            onChange={(e) => handleChange("routingNumber", e.target.value)}
            onBlur={() => handleBlur("routingNumber")}
            placeholder="000000000"
          />
          {touched.routingNumber && errors.routingNumber && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.routingNumber}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Moneda Preferida
          </label>
          <select
            value={payment.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            onBlur={() => handleBlur("currency")}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-white dark:bg-input/30"
          >
            <option value="MXN" className="bg-surface text-white">MXN - Peso Mexicano</option>
            <option value="USD" className="bg-surface text-white">USD - Dólar Americano</option>
            <option value="EUR" className="bg-surface text-white">EUR - Euro</option>
          </select>
          {touched.currency && errors.currency && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.currency}</p>
          )}
        </div>
      </div>

      <div className="border border-color-border/50 bg-color-accent-dim p-4">
        <p className="font-caption-mono text-caption-mono text-primary-container">
          ⚡ Los pagos se procesan en un plazo de 2-5 días hábiles una vez que el cliente final
          haya liquidado la factura correspondiente.
        </p>
      </div>
    </div>
  )
}
