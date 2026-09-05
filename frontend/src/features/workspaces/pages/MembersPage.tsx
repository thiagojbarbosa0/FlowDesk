import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useMe } from '@/features/auth/hooks'
import { useAddMember, useMembers, useRemoveMember, useUpdateMemberRole, useWorkspace } from '../hooks'
import { WorkspaceTabs } from '../components/WorkspaceTabs'
import { inviteSchema, type InviteForm } from '@/lib/schemas'
import { apiErrorToMessage } from '@/lib/api'
import { Avatar, Button, FieldError, Input, Label, Select } from '@/components/ui'
import { Dialog } from '@/components/Dialog'
import { ErrorState, PageSpinner } from '@/components/States'
import { useUIStore } from '@/stores/uiStore'
import { roleLabel } from '@/lib/utils'
import type { Role } from '@/types/api'

const ROLE_OPTIONS: Role[] = ['viewer', 'member', 'admin']

export function MembersPage() {
  const workspaceId = Number(useParams().workspaceId)
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: me } = useMe()
  const { data: members, isLoading, isError, refetch } = useMembers(workspaceId)
  const [open, setOpen] = useState(false)
  const addMember = useAddMember(workspaceId)
  const updateRole = useUpdateMemberRole(workspaceId)
  const removeMember = useRemoveMember(workspaceId)
  const toast = useUIStore((s) => s.toast)

  const canManage = workspace?.role === 'owner' || workspace?.role === 'admin'

  const form = useForm<InviteForm>({ resolver: zodResolver(inviteSchema), defaultValues: { email: '', role: 'member' } })

  function onSubmit(values: InviteForm) {
    addMember.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
        toast('Membro adicionado com sucesso.')
      },
    })
  }

  function handleRemove(userId: number, name: string) {
    if (!confirm(`Remover ${name} deste workspace?`)) return
    removeMember.mutate(userId, { onSuccess: () => toast('Membro removido.') })
  }

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceTabs workspaceId={workspaceId} name={workspace?.name} />

      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Membros</h2>
          {canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Convidar
            </Button>
          )}
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar os membros." onRetry={refetch} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Membro</th>
                  <th className="px-4 py-3">Papel</th>
                  {canManage && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members?.map((m) => (
                  <tr key={m.id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <Avatar user={m.user} className="h-8 w-8" />
                      <div>
                        <p className="font-medium text-slate-800">{m.user.name}</p>
                        <p className="text-xs text-slate-500">{m.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {canManage && m.role !== 'owner' ? (
                        <Select
                          value={m.role}
                          onChange={(e) =>
                            updateRole.mutate({ userId: m.user.id, role: e.target.value as Role })
                          }
                          className="w-auto"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {roleLabel[r]}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{roleLabel[m.role]}</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        {m.role !== 'owner' && m.user.id !== me?.id && (
                          <button
                            onClick={() => handleRemove(m.user.id, m.user.name)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Convidar membro">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {addMember.isError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorToMessage(addMember.error)}</p>
          )}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="pessoa@empresa.com" {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="role">Papel</Label>
            <Select id="role" {...form.register('role')}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r]}
                </option>
              ))}
            </Select>
            <FieldError message={form.formState.errors.role?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={addMember.isPending}>
              Convidar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
