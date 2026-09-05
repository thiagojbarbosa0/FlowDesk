import { AlertTriangle, Inbox } from 'lucide-react'
import { Button, Spinner } from './ui'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
