import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { paymentService } from '@/lib/services/user/payment.service'
import { X, CreditCard, Loader2 } from 'lucide-react'

const PRESET_AMOUNTS = [10, 25, 50, 100, 250]

interface Props {
  onClose: () => void
}

// modal de carga de creditos: selecciona monto y redirige al checkout de stripe
export default function LoadCreditsModal({ onClose }: Props) {
  const [amount, setAmount] = useState<string>('')
  const [customMode, setCustomMode] = useState(false)

  const checkout = useMutation({
    mutationFn: (amt: number) => paymentService.createCheckoutSession(amt),
    onSuccess: (res) => {
      // redirige a la pagina de pago de stripe
      window.location.href = res.data.url
    },
  })

  const numericAmount = parseFloat(amount)
  const isValid = !isNaN(numericAmount) && numericAmount >= 1

  const handleConfirm = () => {
    if (isValid) checkout.mutate(numericAmount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md border border-[#3c4b35] bg-[#0c1609] p-6 shadow-2xl">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-wider text-[#f0ffe4]">
              Cargar Creditos
            </h3>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">
              1 credito = 1 USD
            </p>
          </div>
          <button
            onClick={onClose}
            className="border border-transparent p-1 text-[#baccaf] hover:border-[#3c4b35] hover:text-[#f0ffe4]"
          >
            <X size={16} />
          </button>
        </div>

        {/* montos predefinidos */}
        {!customMode && (
          <div className="mb-4">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
              — monto a cargar
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(String(preset))}
                  className={`border py-3 font-mono text-[13px] font-bold tracking-wide transition-all ${
                    amount === String(preset)
                      ? 'border-[#42ff00] bg-[#42ff00]/10 text-[#42ff00]'
                      : 'border-[#3c4b35] bg-[#182214] text-[#dae6d0] hover:border-[#42ff00]/50'
                  }`}
                >
                  ${preset}
                </button>
              ))}
              <button
                onClick={() => { setCustomMode(true); setAmount('') }}
                className="border border-[#3c4b35] bg-[#182214] py-3 font-mono text-[11px] uppercase tracking-wide text-[#baccaf] hover:border-[#42ff00]/50"
              >
                Otro
              </button>
            </div>
          </div>
        )}

        {/* input personalizado */}
        {customMode && (
          <div className="mb-4">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
              — monto personalizado (USD)
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 border border-[#3c4b35] bg-[#182214] px-4 py-3 font-mono text-[16px] font-bold text-[#42ff00] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
              />
              <button
                onClick={() => { setCustomMode(false); setAmount('') }}
                className="border border-[#3c4b35] px-3 py-3 text-[#baccaf] hover:text-[#f0ffe4]"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* resumen */}
        {isValid && (
          <div className="mb-6 border border-[#3c4b35] bg-[#182214] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                Creditos a acreditar
              </span>
              <span className="font-mono text-[18px] font-bold text-[#42ff00]">
                {numericAmount.toFixed(2)}
                <span className="ml-1 text-[10px] text-[#3c4b35]">USD</span>
              </span>
            </div>
          </div>
        )}

        {/* error */}
        {checkout.isError && (
          <p className="mb-4 font-mono text-[10px] text-[#ffb4ab]">
            Error al crear el pago. Intenta de nuevo.
          </p>
        )}

        {/* acciones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#3c4b35] py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#baccaf] hover:border-[#f0ffe4] hover:text-[#f0ffe4]"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || checkout.isPending}
            className="flex flex-1 items-center justify-center gap-2 border border-[#42ff00] bg-[#42ff00] py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checkout.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Redirigiendo...</>
              : <><CreditCard size={14} /> Ir a pagar</>
            }
          </button>
        </div>

        <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">
          Pago procesado de forma segura por Stripe
        </p>
      </div>
    </div>
  )
}
