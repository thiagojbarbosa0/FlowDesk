import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function WorkspaceTabs({ workspaceId, name }: { workspaceId: number; name?: string }) {
  const tabs = [
    { to: `/w/${workspaceId}`, label: 'Projetos', end: true },
    { to: `/w/${workspaceId}/dashboard`, label: 'Dashboard', end: false },
    { to: `/w/${workspaceId}/members`, label: 'Membros', end: false },
  ]

  return (
    <div className="border-b border-slate-200 bg-white px-6 pt-4">
      {name && <h1 className="mb-3 text-xl font-bold text-slate-800">{name}</h1>}
      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-b-2 border-indigo-600 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
