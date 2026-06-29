const stats = [
  { value: '+8',   label: 'años de experiencia' },
  { value: '+500', label: 'novias maquilladas' },
  { value: '2',    label: 'certificaciones: HD y aerografía' },
  { value: '100%', label: 'productos cruelty-free' },
]

const badges = [
  'Estudio y servicio a domicilio',
  'Certificada en HD y aerografía',
  'Productos cruelty-free',
  'Larga duración',
  'Ciudad Juárez y área metropolitana',
]

export default function SobreMiSection() {
  return (
    <section id="sobre-mi" className="bg-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Encabezado de sección */}
        <div className="mb-16">
          <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase flex items-center gap-2 mb-3">
            <span>✦</span> Sobre mí
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-ink">
            La maquillista detrás del look
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Bio */}
          <div className="space-y-5">
            <p className="font-sans text-ink/80 text-lg leading-relaxed">
              Soy Renata, maquillista profesional certificada con más de 8 años
              transformando rostros para los días más importantes. Mi especialidad
              es el maquillaje de novia y de evento: ese acabado natural y luminoso
              que aguanta de la mañana a la madrugada sin retoques constantes.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              Me formé en el Colegio de Imagen y Estética de Guadalajara y me he
              certificado en técnicas de aerografía y maquillaje para alta definición
              (HD), porque hoy todo queda registrado en foto y video. Trabajo con
              productos profesionales de larga duración y libres de crueldad animal,
              y cuido cada piel como si fuera la mía.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              Creo que maquillarse no es taparse, es sentirse uno mismo en su mejor
              versión. Por eso cada cita empieza con una breve plática para entender
              qué buscas, tu estilo y la ocasión. No me gusta el maquillaje genérico:
              me gusta el tuyo.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              {badges.map((b) => (
                <span
                  key={b}
                  className="font-sans text-xs text-accent border border-accent/40 px-3 py-1 rounded bg-accent/5"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Contadores estadísticos — números grandes en serif */}
          <div className="grid grid-cols-2 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="border-t-2 border-accent pt-5">
                <p className="font-serif text-5xl lg:text-6xl text-accent leading-none mb-2">
                  {s.value}
                </p>
                <p className="font-sans text-sm text-muted-foreground leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
