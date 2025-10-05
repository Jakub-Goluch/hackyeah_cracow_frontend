import React, { useEffect } from 'react';
import { Award, FileText } from 'lucide-react';
import type { User, CoordinatorReport } from '~/types';

interface CoordinatorViewProps {
  selectedUserId: number;
  coordinatorStudents: User[];
  coordinatorReport: CoordinatorReport | null;
  setView: (view: 'home' | 'volunteer' | 'organization' | 'coordinator') => void;
  fetchCoordinatorData: (id: number) => Promise<void>;
  getCategoryColor: (category: string) => string;
}

const CoordinatorView: React.FC<CoordinatorViewProps> = ({
  selectedUserId,
  coordinatorStudents,
  coordinatorReport,
  setView,
  fetchCoordinatorData,
  getCategoryColor,
}) => {
  useEffect(() => {
    void fetchCoordinatorData(selectedUserId);
  }, [selectedUserId, fetchCoordinatorData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel Koordynatora</h1>
          <button
            onClick={() => setView('home')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Powrót
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {coordinatorReport && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Uczniowie</div>
                <div className="text-2xl font-bold text-blue-600">
                  {coordinatorReport.statistics.total_students}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Uczestnictwa</div>
                <div className="text-2xl font-bold text-green-600">
                  {coordinatorReport.statistics.total_participations}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Łącznie godzin</div>
                <div className="text-2xl font-bold text-purple-600">
                  {coordinatorReport.statistics.total_hours || 0}h
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Zaświadczenia</div>
                <div className="text-2xl font-bold text-orange-600">
                  {coordinatorReport.statistics.total_certificates}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Najpopularniejsze kategorie</h2>
                <div className="space-y-3">
                  {coordinatorReport.popular_categories.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Brak danych
                    </div>
                  ) : (
                    coordinatorReport.popular_categories.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(cat.category)}`}>
                          {cat.category}
                        </span>
                        <span className="font-bold">{cat.count} uczestnictw</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Informacje o raporcie</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID szkoły:</span>
                    <span className="font-medium">{coordinatorReport.school_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wygenerowano:</span>
                    <span className="font-medium">
                      {new Date(coordinatorReport.generated_at).toLocaleString('pl-PL')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Średnia godzin/uczeń:</span>
                    <span className="font-medium">
                      {coordinatorReport.statistics.total_students > 0
                        ? Math.round((coordinatorReport.statistics.total_hours || 0) / coordinatorReport.statistics.total_students)
                        : 0}h
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FileText size={20} /> Drukuj raport
                </button>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Lista uczniów</h2>
            <div className="text-sm text-gray-600">
              Łącznie uczniów: {coordinatorStudents.length}
            </div>
          </div>
          {coordinatorStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Brak uczniów w systemie
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imię i nazwisko</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Godziny</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uczestnictwa</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coordinatorStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{student.phone || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="font-bold text-blue-600">
                          {student.total_hours || 0}h
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {student.total_participations || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorView;