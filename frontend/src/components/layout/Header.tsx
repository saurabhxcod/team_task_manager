import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header-standard px-4 sm:gap-x-6 sm:px-6 lg:px-8 flex h-16 items-center gap-x-4 shadow-sm">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-3">
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                {user?.name}
              </span>
            </span>
            {user?.avatar_url ? (
              <img className="h-8 w-8 rounded-full bg-gray-50" src={user.avatar_url} alt="" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="ml-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
