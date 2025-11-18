import { useState } from 'react';
import { signOut } from '../../lib/services/auth';
import AdminSidebar from '../../components/AdminSidebar';
import Dashboard from '../../components/Dashboard';
import CasesList from '../../components/CasesList';
import EvidenceUpload from '../../components/EvidenceUpload';
import UserManagement from './UserManagement';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cases':
        return <CasesList />;
      case 'upload':
        return <EvidenceUpload />;
      case 'evidence':
        return <div className="p-8"><h1 className="text-2xl font-bold">Evidence List - Coming Soon</h1></div>;
      case 'users':
        return <UserManagement />;
      case 'logs':
        return <div className="p-8"><h1 className="text-2xl font-bold">Audit Logs - Coming Soon</h1></div>;
      case 'settings':
        return <div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Administration Panel</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
        <div className="flex-1 p-8 overflow-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
