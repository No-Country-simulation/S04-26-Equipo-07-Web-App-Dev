import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <>
      <header className="fixed top-0 w-full z-50 rounded-none h-18 bg-surface/80 backdrop-blur-md border-b border-color-border">
        <div className="max-w-300 mx-auto px-8 md:px-32 flex justify-between items-center h-full">
          <div className="font-display text-heading-sm tracking-tighter text-white">North<span className="gradient-text">Pay</span></div>
          <nav className="hidden md:flex gap-8 items-center">
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container font-bold -translate-y-px transition-transform" href="#">Plataforma</a>
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors duration-200" href="#">Red</a>
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors duration-200" href="#">Cumplimiento</a>
            <a className="bg-primary-container text-black font-body text-body py-2 px-6 rounded-none hover:bg-primary-fixed transition-transform hover:-translate-y-px" href="login">Comenzar</a>
          </nav>
        </div>
      </header>
      <main className="pt-18">
        <section className="max-w-300 mx-auto px-8 md:px-32 py-30 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-start gap-6">

            <h1 className="font-display text-display text-white">
              Incorporando contratistas en <span className="gradient-text">[días, no semanas]</span>
            </h1>
            <p className="font-body text-body text-on-surface-variant max-w-120">
              Automatice el cumplimiento normativo internacional, los pagos instantáneos y la documentación fiscal para su plantilla global a través de un único onboarding de alta precisión.
            </p>
            <div className="flex gap-4 pt-8">
              <button onClick={() => navigate("/login")} className="bg-primary-container text-black font-body text-body px-8 py-4 rounded-none font-bold hover:bg-primary-fixed transition-transform hover:-translate-y-px">INICIAR ONBOARDING</button>

            </div>
          </div>
          <div className="relative bg-color-surface border border-color-border p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-color-border/30">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-color-border"></div>
                <div className="w-3 h-3 rounded-full bg-color-border"></div>
                <div className="w-3 h-3 rounded-full bg-color-border"></div>
              </div>
              <div className="font-caption-mono text-caption-mono text-primary-container uppercase tracking-widest">Onboarding Live</div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-background p-4 border border-color-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container flex items-center justify-center font-caption-mono text-primary-container border border-color-border">JS</div>
                  <div>
                    <div className="font-heading-sm text-white text-sm">Julian Schwarz</div>
                    <div className="font-caption-mono text-caption-mono text-on-surface-variant">Berlín, DE • Desarrollador</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-color-accent-dim border border-primary-container/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  <span className="font-label-mono-bold text-label-mono-bold text-primary-container">ACTIVO</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-background p-4 border border-color-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container flex items-center justify-center font-caption-mono text-primary-container border border-color-border">AM</div>
                  <div>
                    <div className="font-heading-sm text-white text-sm">Aria Mitchell</div>
                    <div className="font-caption-mono text-caption-mono text-on-surface-variant">Londres, UK • Diseñadora UI</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-surface-variant border border-color-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-color-warning"></span>
                  <span className="font-label-mono-bold text-label-mono-bold text-color-warning">PENDIENTE</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-background p-4 border border-color-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container flex items-center justify-center font-caption-mono text-primary-container border border-color-border">TR</div>
                  <div>
                    <div className="font-heading-sm text-white text-sm">Tariq Ramzi</div>
                    <div className="font-caption-mono text-caption-mono text-on-surface-variant">Dubái, EAU • Consultor</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-color-accent-dim border border-primary-container/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  <span className="font-label-mono-bold text-label-mono-bold text-primary-container">ACTIVO</span>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 -right-20 -bottom-20 w-64 h-64 bg-primary-container/5 blur-[100px]"></div>
          </div>
        </section>
        <section className="max-w-300 mx-auto px-8 md:px-32 py-30">
          <div className="flex items-center gap-5 mb-8">
            <span className="font-caption-mono text-caption-mono text-primary-container">MOTOR DE PROCESOS</span>
            <div className="h-px w-20 bg-primary-container/30"></div>
          </div>
          <h2 className="font-display text-heading-lg text-white mb-15">Arquitectura del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 relative">
            <div className="flex flex-col gap-6 relative pr-8 pb-12 md:pb-0">
              <div className="w-12 h-12 border border-color-border flex items-center justify-center font-caption-mono text-primary-container bg-color-surface z-10">01</div>
              <div className="space-y-2">
                <h3 className="font-heading-sm text-white text-base">Onboarding</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Crea tu cuenta como empresa.</p>
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-px step-line z-0"></div>
            </div>
            <div className="flex flex-col gap-6 relative pr-8 pb-12 md:pb-0">
              <div className="w-12 h-12 border border-color-border flex items-center justify-center font-caption-mono text-primary-container bg-color-surface z-10">02</div>
              <div className="space-y-2">
                <h3 className="font-heading-sm text-white text-base">Genera tu link orboanding</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Comparte tu link de onboarding con tus empleados.</p>
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-px step-line z-0"></div>
            </div>
            <div className="flex flex-col gap-6 relative pr-8 pb-12 md:pb-0">
              <div className="w-12 h-12 border border-color-border flex items-center justify-center font-caption-mono text-primary-container bg-color-surface z-10">03</div>
              <div className="space-y-2">
                <h3 className="font-heading-sm text-white text-base">Guardia de Cumplimiento</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Verificación automatizada de identidad.</p>
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-px step-line z-0"></div>
            </div>
            <div className="flex flex-col gap-6 relative pr-8 pb-12 md:pb-0">
              <div className="w-12 h-12 border border-color-border flex items-center justify-center font-caption-mono text-primary-container bg-color-surface z-10">04</div>
              <div className="space-y-2">
                <h3 className="font-heading-sm text-white text-base">Pagos Automatizados</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Liquidación instantánea en más de 140 monedas.</p>
              </div>
              <div className="hidden md:block absolute top-6 left-12 w-full h-px step-line z-0"></div>
            </div>
            <div className="flex flex-col gap-6 relative">
              <div className="w-12 h-12 border border-color-border flex items-center justify-center font-caption-mono text-primary-container bg-color-surface z-10">05</div>
              <div className="space-y-2">
                <h3 className="font-heading-sm text-white text-base">Revisión del Sistema</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Reportes en tiempo real y pistas de auditoría.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-300 mx-auto px-8 md:px-32 py-30">
          <div className="flex items-center gap-5 mb-8">
            <span className="font-caption-mono text-caption-mono text-primary-container">CAPACIDADES PRINCIPALES</span>
            <div className="h-px w-20 bg-primary-container/30"></div>
          </div>
          <h2 className="font-display text-heading-lg text-white mb-15">Superioridad Operacional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-color-border">
            <div className="bg-color-surface p-8 hover-reveal-border transition-all group">
              <div className="font-caption-mono text-[48px] leading-none text-primary-container font-bold mb-8">01</div>
              <h3 className="font-heading-lg text-white mb-4">Cumplimiento Automatizado</h3>
              <p className="font-body text-body text-on-surface-variant">
                Nuestras barreras se adaptan a las regulaciones locales en tiempo real, asegurando que cada contratista sea verificado y cumpla con las normas antes de realizar cualquier pago.
              </p>
            </div>
            <div className="bg-color-surface p-8 hover-reveal-border transition-all group">
              <div className="font-caption-mono text-[48px] leading-none text-primary-container font-bold mb-8">02</div>
              <h3 className="font-heading-lg text-white mb-4">Pagos Globales</h3>
              <p className="font-body text-body text-on-surface-variant">
                Ejecuta pagos masivos a nivel global con seguridad institucional. Soporte para transferencias bancarias, ACH y cripto con tasas de cambio fijas.
              </p>
            </div>
            <div className="bg-color-surface p-8 hover-reveal-border transition-all group">
              <div className="font-caption-mono text-[48px] leading-none text-primary-container font-bold mb-8">03</div>
              <h3 className="font-heading-lg text-white mb-4">Integración Directa</h3>
              <p className="font-body text-body text-on-surface-variant">
                Conéctate directamente a tu ERP o stack contable. La sincronización automatizada del libro mayor elimina la entrada manual de datos y reduce errores de conciliación.
              </p>
            </div>
          </div>
        </section>
        <section className="relative max-w-300 mx-auto px-8 md:px-32 py-30 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-cta-bg opacity-40 -z-10"></div>
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary-container/5 blur-[120px] rounded-full -z-10"></div>
          <div className="flex flex-col items-center gap-8">
            <h2 className="font-display text-display text-white max-w-200">¿Listo para escalar?</h2>
            <div className="flex flex-col items-center gap-4">
              <button onClick={() => navigate("/login")} className="bg-primary-container text-black font-body text-body px-12 py-5 rounded-none font-extrabold hover:bg-primary-fixed transition-transform hover:-translate-y-px uppercase tracking-wider">INICIAR ONBOARDING</button>

            </div>
          </div>
        </section>
      </main>
      <footer className="w-full rounded-none bg-surface border-t border-color-border">
        <div className="max-w-300 mx-auto px-8 md:px-32 py-20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-display text-heading-sm text-on-surface">NorthPay</div>
          <div className="flex gap-12">
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-color-muted hover:text-white transition-colors" href="#">Red</a>
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-color-muted hover:text-white transition-colors" href="#">Seguridad</a>
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-color-muted hover:text-white transition-colors" href="#">Privacidad</a>
            <a className="font-caption-mono text-caption-mono uppercase tracking-widest text-color-muted hover:text-white transition-colors" href="#">Términos</a>
          </div>
          <div className="font-caption-mono text-caption-mono uppercase tracking-widest text-color-muted">
            &copy; 2024 NORTHPAY OPERATIONS. TODOS LOS DERECHOS RESERVADOS.
          </div>
        </div>
      </footer>
    </>
  )
}
