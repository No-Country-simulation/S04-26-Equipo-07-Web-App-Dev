import { Input } from "@/components/ui/input"
import { useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"

export default function PersonalInfoStep() {
  const { data, updatePersonalInfo } = useOnboarding()
  const { personalInfo } = data

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Nombre Completo
          </label>
          <Input
            value={personalInfo.fullName}
            onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
            placeholder="Juan Pérez López"
          />
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Correo Electrónico
          </label>
          <Input
            type="email"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            placeholder="juan@company.com"
          />
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Teléfono
          </label>
          <Input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            placeholder="+52 55 1234 5678"
          />
        </div>
        <div className="space-y-2">
          <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Fecha de Nacimiento
          </label>
          <Input
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(e) => updatePersonalInfo({ dateOfBirth: e.target.value })}
          />
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
              onChange={(e) => updatePersonalInfo({ address: e.target.value })}
              placeholder="Av. Reforma 222, Col. Juárez"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                Ciudad
              </label>
              <Input
                value={personalInfo.city}
                onChange={(e) => updatePersonalInfo({ city: e.target.value })}
                placeholder="Ciudad de México"
              />
            </div>
            <div className="space-y-2">
              <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                Estado
              </label>
              <Input
                value={personalInfo.state}
                onChange={(e) => updatePersonalInfo({ state: e.target.value })}
                placeholder="CDMX"
              />
            </div>
            <div className="space-y-2">
              <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                Código Postal
              </label>
              <Input
                value={personalInfo.zipCode}
                onChange={(e) => updatePersonalInfo({ zipCode: e.target.value })}
                placeholder="06600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                País
              </label>
              <Input
                value={personalInfo.country}
                onChange={(e) => updatePersonalInfo({ country: e.target.value })}
                placeholder="México"
              />
            </div>
            <div className="space-y-2">
              <label className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
                RFC / Tax ID
              </label>
              <Input
                value={personalInfo.taxId}
                onChange={(e) => updatePersonalInfo({ taxId: e.target.value })}
                placeholder="XXXX000101XXX"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
