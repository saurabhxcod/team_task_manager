import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FolderGit2, Users, Settings, Database } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const ALL_NAV = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks Board', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
];

export default function Sidebar() {
  const navigation = ALL_NAV;

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 sidebar-standard">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-primary-600">
            TaskSync
          </h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-colors'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
