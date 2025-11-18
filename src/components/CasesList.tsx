import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CASE_STATUSES } from '../lib/constants';
import { Briefcase, User, Calendar, FileText } from 'lucide-react';

interface Case {
  case_id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  evidence_count?: number;
}

export default function CasesList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadCases();
  }, [filter]);

  async function loadCases() {
    try {
      setLoading(true);
      let query = supabase
        .from('cases')
        .select(`
          *,
          evidence (count)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const casesWithCount = data?.map(c => ({
        ...c,
        evidence_count: c.evidence?.[0]?.count || 0,
      })) || [];

      setCases(casesWithCount);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = CASE_STATUSES.find(s => s.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="mt-2 text-gray-600">Manage and track investigation cases</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create New Case
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Cases
        </button>
        {CASE_STATUSES.map(status => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new case.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map(caseItem => (
            <div
              key={caseItem.case_id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                    {getStatusBadge(caseItem.status)}
                  </div>
                  {caseItem.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{caseItem.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(caseItem.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{caseItem.evidence_count} evidence items</span>
                    </div>
                    {caseItem.assigned_to && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
