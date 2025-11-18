import {
  LayoutDashboard,
  Briefcase,
  Upload,
  FileText,
  Users,
  Activity,
  Settings,
} from 'lucide-react';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function AdminSidebar({ currentPage, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'upload', label: 'Upload Evidence', icon: Upload },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">PIFAT</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="px-4 py-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">Administrator</p>
        </div>
      </div>
    </div>
  );
}
