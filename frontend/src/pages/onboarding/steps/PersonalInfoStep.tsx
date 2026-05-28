import { Input } from "@/components/ui/input"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"
import { personalInfoSchema } from "@/stores/onboardingSchemas"
import { useState, useCallback } from "react"

type FieldErrors = Record<string, string>

export default function PersonalInfoStep() {
  const { data, updatePersonalInfo } = useOnboarding()
  const { personalInfo } = data
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = useCallback(() => {
    const result = personalInfoSchema.safeParse(personalInfo)
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
  }, [personalInfo])

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate()
  }

  const handleChange = (field: string, value: string) => {
    updatePersonalInfo({ [field]: value })
    if (touched[field]) validate()
  }

  const countryCodes = [
    { code: "+52", label: "MX +52" },
    { code: "+1", label: "US/CA +1" },
    { code: "+34", label: "ES +34" },
    { code: "+54", label: "AR +54" },
    { code: "+56", label: "CL +56" },
    { code: "+57", label: "CO +57" },
    { code: "+51", label: "PE +51" },
    { code: "+58", label: "VE +58" },
    { code: "+53", label: "CU +53" },
    { code: "+502", label: "GT +502" },
    { code: "+503", label: "SV +503" },
    { code: "+504", label: "HN +504" },
    { code: "+505", label: "NI +505" },
    { code: "+506", label: "CR +506" },
    { code: "+507", label: "PA +507" },
    { code: "+595", label: "PY +595" },
    { code: "+598", label: "UY +598" },
    { code: "+591", label: "BO +591" },
    { code: "+593", label: "EC +593" },
    { code: "+509", label: "HT +509" },
    { code: "+1-809", label: "DO +1-809" },
  ]

  const fields = [
    { key: "fullName", label: "Nombre Completo", placeholder: "Juan Pérez López", type: "text" },
    { key: "email", label: "Correo Electrónico", placeholder: "juan@company.com", type: "email" },
    { key: "dateOfBirth", label: "Fecha de Nacimiento", placeholder: "", type: "date" },
  ] as const

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key} className="space-y-2">
            <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
              {label}
            </label>
            <Input
              type={type}
              value={personalInfo[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              placeholder={placeholder}
            />
            {touched[key] && errors[key] && (
              <p className="font-caption-mono text-caption-mono text-color-warning">{errors[key]}</p>
            )}
          </div>
        ))}
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Teléfono
          </label>
          <div className="flex gap-2">
            <select
              value={personalInfo.phoneCode}
              onChange={(e) => handleChange("phoneCode", e.target.value)}
              onBlur={() => handleBlur("phoneCode")}
              className="h-8 w-32.5 shrink-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-white dark:bg-input/30"
            >
              {countryCodes.map((cc) => (
                <option key={cc.code} value={cc.code} className="bg-surface text-white">
                  {cc.label}
                </option>
              ))}
            </select>
            <div className="flex-1">
              <Input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  handleChange("phone", val)
                }}
                onBlur={() => handleBlur("phone")}
                placeholder="5512345678"
              />
            </div>
          </div>
          {touched.phone && errors.phone && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.phone}</p>
          )}
          {touched.phoneCode && errors.phoneCode && (
            <p className="font-caption-mono text-caption-mono text-color-warning">{errors.phoneCode}</p>
          )}
        </div>
      </div>

      <div className="border-t border-color-border pt-8">
        <span className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container mb-6 block">
          Dirección
        </span>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
              Calle y Número
            </label>
            <Input
              value={personalInfo.address}
              onChange={(e) => handleChange("address", e.target.value)}
              onBlur={() => handleBlur("address")}
              placeholder="Av. Reforma 222, Col. Juárez"
            />
            {touched["address"] && errors["address"] && (
              <p className="font-caption-mono text-caption-mono text-color-warning">{errors["address"]}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: "city", label: "Ciudad", placeholder: "Ciudad de México" },
              { key: "state", label: "Estado", placeholder: "CDMX" },
              { key: "zipCode", label: "Código Postal", placeholder: "06600" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                  {label}
                </label>
                <Input
                  value={personalInfo[key as keyof typeof personalInfo]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={() => handleBlur(key)}
                  placeholder={placeholder}
                />
                {touched[key] && errors[key] && (
                  <p className="font-caption-mono text-caption-mono text-color-warning">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                País
              </label>
              <select
                value={personalInfo.country}
                onChange={(e) => handleChange("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-white dark:bg-input/30"
              >
                <option value="" className="bg-surface text-white">Selecciona un país</option>
                <option value="México" className="bg-surface text-white">México</option>
                <option value="Argentina" className="bg-surface text-white">Argentina</option>
                <option value="Bolivia" className="bg-surface text-white">Bolivia</option>
                <option value="Chile" className="bg-surface text-white">Chile</option>
                <option value="Colombia" className="bg-surface text-white">Colombia</option>
                <option value="Costa Rica" className="bg-surface text-white">Costa Rica</option>
                <option value="Cuba" className="bg-surface text-white">Cuba</option>
                <option value="Ecuador" className="bg-surface text-white">Ecuador</option>
                <option value="El Salvador" className="bg-surface text-white">El Salvador</option>
                <option value="España" className="bg-surface text-white">España</option>
                <option value="Guatemala" className="bg-surface text-white">Guatemala</option>
                <option value="Honduras" className="bg-surface text-white">Honduras</option>
                <option value="Nicaragua" className="bg-surface text-white">Nicaragua</option>
                <option value="Panamá" className="bg-surface text-white">Panamá</option>
                <option value="Paraguay" className="bg-surface text-white">Paraguay</option>
                <option value="Perú" className="bg-surface text-white">Perú</option>
                <option value="Puerto Rico" className="bg-surface text-white">Puerto Rico</option>
                <option value="República Dominicana" className="bg-surface text-white">República Dominicana</option>
                <option value="Uruguay" className="bg-surface text-white">Uruguay</option>
                <option value="Venezuela" className="bg-surface text-white">Venezuela</option>
                <option value="Estados Unidos" className="bg-surface text-white">Estados Unidos</option>
              </select>
              {touched.country && errors.country && (
                <p className="font-caption-mono text-caption-mono text-color-warning">{errors.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
