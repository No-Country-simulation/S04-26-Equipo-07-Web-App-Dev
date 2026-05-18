import { Input } from "@/components/ui/input"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"

export default function PaymentStep() {
  const { data, updatePayment } = useOnboarding()
  const { payment } = data

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
            onChange={(e) => updatePayment({ bankName: e.target.value })}
            placeholder="BBVA, Santander, etc."
          />
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Tipo de Cuenta
          </label>
          <select
            value={payment.accountType}
            onChange={(e) => updatePayment({ accountType: e.target.value })}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-white dark:bg-input/30"
          >
            <option value="checking" className="bg-surface text-white">Cheques</option>
            <option value="savings" className="bg-surface text-white">Ahorros</option>
            <option value="paypal" className="bg-surface text-white">PayPal</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Número de Cuenta / CLABE
          </label>
          <Input
            value={payment.accountNumber}
            onChange={(e) => updatePayment({ accountNumber: e.target.value })}
            placeholder="0000 0000 0000 0000"
          />
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Código de Rastreo / Routing
          </label>
          <Input
            value={payment.routingNumber}
            onChange={(e) => updatePayment({ routingNumber: e.target.value })}
            placeholder="000000000"
          />
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Moneda Preferida
          </label>
          <select
            value={payment.currency}
            onChange={(e) => updatePayment({ currency: e.target.value })}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-white dark:bg-input/30"
          >
            <option value="MXN" className="bg-surface text-white">MXN - Peso Mexicano</option>
            <option value="USD" className="bg-surface text-white">USD - Dólar Americano</option>
            <option value="EUR" className="bg-surface text-white">EUR - Euro</option>
          </select>
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
