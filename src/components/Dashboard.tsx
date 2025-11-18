import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Briefcase,
  FileText,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  totalEvidence: number;
  pendingAnalysis: number;
  highRiskItems: number;
  completedToday: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    totalEvidence: 0,
    pendingAnalysis: 0,
    highRiskItems: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [casesResult, activeCasesResult, evidenceResult, pendingResult, highRiskResult, completedResult] = await Promise.all([
        supabase.from('cases').select('case_id', { count: 'exact', head: true }),
        supabase.from('cases').select('case_id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase.from('evidence').select('evidence_id', { count: 'exact', head: true }),
        supabase.from('evidence').select('evidence_id', { count: 'exact', head: true }).eq('ai_status', 'pending'),
        supabase.from('ai_results').select('ai_id', { count: 'exact', head: true }).gte('risk_score', 70),
        supabase.from('tasks').select('task_id', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('updated_at', today.toISOString()),
      ]);

      setStats({
        totalCases: casesResult.count || 0,
        activeCases: activeCasesResult.count || 0,
        totalEvidence: evidenceResult.count || 0,
        pendingAnalysis: pendingResult.count || 0,
        highRiskItems: highRiskResult.count || 0,
        completedToday: completedResult.count || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Total Cases',
      value: stats.totalCases,
      icon: Briefcase,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Cases',
      value: stats.activeCases,
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      label: 'Evidence Items',
      value: stats.totalEvidence,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      label: 'Pending Analysis',
      value: stats.pendingAnalysis,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'High Risk Items',
      value: stats.highRiskItems,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      label: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'bg-teal-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your forensics operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="font-medium text-blue-900">Create New Case</div>
              <div className="text-sm text-blue-700">Start a new investigation</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="font-medium text-green-900">Upload Evidence</div>
              <div className="text-sm text-green-700">Add evidence to existing case</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="font-medium text-purple-900">View Audit Logs</div>
              <div className="text-sm text-purple-700">Review system activity</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">AI Analysis Engine</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Evidence Storage</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Chain of Custody</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
