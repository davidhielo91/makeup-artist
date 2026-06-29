import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'portfolio'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

// Placeholders con proporciones variadas para simular masonry
const placeholders = [
  { id: 1, ratio: 'aspect-[3/4]' },
  { id: 2, ratio: 'aspect-square' },
  { id: 3, ratio: 'aspect-[3/4]' },
  { id: 4, ratio: 'aspect-[4/5]' },
  { id: 5, ratio: 'aspect-[3/4]' },
  { id: 6, ratio: 'aspect-square' },
]

export default async function PortafolioSection() {
  const supabase = await createClient()
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 12, sortBy: { column: 'created_at', order: 'desc' } })

  const hasImages = files && files.length > 0 && files.some((f) => f.name !== '.emptyFolderPlaceholder')
  const images = hasImages ? files.filter((f) => f.name !== '.emptyFolderPlaceholder') : []

  return (
    <section id="portafolio" className="bg-[#F0EBE2] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Encabezado */}
        <div className="mb-16 text-center">
          <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-2 mb-3">
            <span>✦</span> Portafolio
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-ink">
            Looks que cuentan historias
          </h2>
          <p className="font-sans text-muted-foreground mt-4 max-w-md mx-auto">
            Cada rostro es único. Cada look, una decisión intencional.
          </p>
        </div>

        {/* Grid masonry con CSS columns */}
        {images.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {images.map((file) => (
              <div
                key={file.id}
                className="break-inside-avoid overflow-hidden rounded group"
              >
                <Image
                  src={getPublicUrl(file.name)}
                  alt={`Look de maquillaje - ${file.name}`}
                  width={600}
                  height={800}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Placeholders cuando el bucket está vacío */
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {placeholders.map((p) => (
              <div
                key={p.id}
                className={`break-inside-avoid rounded bg-line/50 ${p.ratio} flex items-center justify-center`}
              >
                <span className="font-script text-3xl text-accent/30">Renata</span>
              </div>
            ))}
          </div>
        )}

        {/* Enlace a Instagram */}
        <div className="mt-14 text-center">
          <a
            href="https://instagram.com/renata.mua"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-sm text-accent border border-accent px-6 py-2.5 rounded hover:bg-accent hover:text-cream transition-colors"
          >
            Ver más en @renata.mua
          </a>
        </div>
      </div>
    </section>
  )
}
