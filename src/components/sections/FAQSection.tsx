'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    value: 'reserva',
    question: '¿Cómo confirmo mi cita?',
    answer:
      'Toda cita se confirma por correo y WhatsApp una vez aprobada. Para maquillaje de novia, es obligatoria la prueba previa antes de apartar la fecha del evento.',
  },
  {
    value: 'anticipo',
    question: '¿Se requiere anticipo?',
    answer:
      'Para bodas y eventos grandes se solicita un anticipo del 30% por transferencia para apartar la fecha. El resto se liquida el día del evento en efectivo o transferencia. No hay pago en línea.',
  },
  {
    value: 'cancelacion-anticipada',
    question: '¿Qué pasa si cancelo con más de 72 horas?',
    answer:
      'Sin costo. El anticipo es reembolsable o puedes usarlo para reagendar tu cita en otra fecha disponible.',
  },
  {
    value: 'cancelacion-tardia',
    question: '¿Qué pasa si cancelo entre 72 y 24 horas antes?',
    answer:
      'El anticipo no es reembolsable, pero puedes usarlo para reagendar una vez. Si cancelas con menos de 24 horas o no te presentas, se pierde el anticipo completo.',
  },
  {
    value: 'reagendar',
    question: '¿Puedo reagendar mi cita?',
    answer:
      'Sí, sin costo una vez, avisando con al menos 48 horas de anticipación. Cambios posteriores están sujetos a disponibilidad.',
  },
  {
    value: 'puntualidad',
    question: '¿Qué tan puntual debo ser?',
    answer:
      'Hay una tolerancia de 15 minutos. Después de ese tiempo el servicio puede acortarse o reagendarse conservando el costo, para no afectar a la siguiente clienta.',
  },
  {
    value: 'alergias',
    question: '¿Qué debo informar antes de mi cita?',
    answer:
      'Avisa con anticipación si tienes alergias, condiciones de piel o una infección ocular activa. Todo el material se desinfecta entre clientas.',
  },
]

export default function FAQSection() {
  return (
    <section id="faq" className="bg-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Encabezado lateral */}
          <div className="lg:sticky lg:top-24">
            <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase flex items-center gap-2 mb-3">
              <span>✦</span> Preguntas frecuentes
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl text-ink leading-tight mb-6">
              Todo lo que necesitas saber
            </h2>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              ¿Tienes otra pregunta? Escríbeme por WhatsApp y te respondo con gusto.
            </p>
            <a
              href="https://wa.me/526562184490"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans text-sm text-accent border border-accent px-5 py-2 rounded hover:bg-accent hover:text-cream transition-colors mt-6"
            >
              Preguntar por WhatsApp
            </a>
          </div>

          {/* Acordeón — ítem activo: fondo terracota + texto crema */}
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border border-line rounded overflow-hidden data-[state=open]:border-accent"
              >
                <AccordionTrigger
                  className="
                    px-5 py-4 text-left font-sans text-sm font-medium text-ink
                    hover:no-underline hover:bg-line/40 transition-colors
                    data-[state=open]:bg-accent data-[state=open]:text-cream
                    data-[state=open]:hover:bg-accent-hover
                    [&[data-state=open]>svg]:text-cream
                  "
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pt-3 pb-4 font-sans text-sm text-muted-foreground leading-relaxed bg-white/40">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
