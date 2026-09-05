import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts)
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'rounded-md px-4 py-2 text-sm text-white shadow-lg',
            t.type === 'error' ? 'bg-red-600' : 'bg-slate-900',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
