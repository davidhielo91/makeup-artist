'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/actions/admin'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signIn, null)

  // signIn retorna { ok: true } cuando las credenciales son correctas.
  // redirect() dentro de useActionState no navega el browser en Next.js 16,
  // por eso manejamos la navegación aquí en el cliente.
  useEffect(() => {
    if (state?.ok) {
      router.push('/admin')
    }
  }, [state, router])

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Marca */}
        <div className="text-center mb-10">
          <p className="font-sans text-accent text-[10px] tracking-[0.35em] uppercase mb-3">
            ✦ Panel de Administración
          </p>
          <h1 className="font-serif text-3xl text-ink">Renata Belmonte</h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">Makeup Artist · Ciudad Juárez</p>
        </div>

        {/* Formulario */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-sans text-xs text-ink/60">Correo electrónico</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="hola@renatabelmonte.mx"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xs text-ink/60">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          {/* Error de credenciales */}
          {state && !state.ok && (
            <div className="flex items-center gap-2 text-destructive border border-destructive/30 bg-destructive/5 rounded p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="font-sans text-sm">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || state?.ok === true}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-cream font-sans text-sm rounded py-3 transition-colors mt-2"
          >
            {isPending || state?.ok ? 'Iniciando sesión…' : 'Entrar'}
          </button>
        </form>

        <p className="font-sans text-xs text-muted-foreground text-center mt-8 leading-relaxed">
          Solo personal autorizado.<br />Los registros públicos están deshabilitados.
        </p>
      </div>
    </main>
  )
}

const inputCls =
  'w-full border border-line rounded px-3 py-2.5 text-sm font-sans bg-white/60 ' +
  'placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors'
