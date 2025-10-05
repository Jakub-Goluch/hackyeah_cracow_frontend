import React, { useEffect } from 'react';
import { X, CheckCircle, MapPin, Calendar, Clock, Users } from 'lucide-react';
import type { Initiative, Participation } from '~/types';

interface OrganizationViewProps {
  selectedUserId: number;
  orgInitiatives: Initiative[];
  orgApplications: Participation[];
  setView: (view: 'home' | 'volunteer' | 'organization' | 'coordinator') => void;
  fetchOrganizationData: (id: number) => Promise<void>;
  approveApplication: (participationId: number, status: 'approved' | 'rejected') => Promise<void>;
  getCategoryColor: (category: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const OrganizationView: React.FC<OrganizationViewProps> = ({
  selectedUserId,
  orgInitiatives,
  orgApplications,
  setView,
  fetchOrganizationData,
  approveApplication,
  getCategoryColor,
  getStatusBadge,
}) => {
  useEffect(() => {
    void fetchOrganizationData(selectedUserId);
  }, [selectedUserId, fetchOrganizationData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel Organizacji</h1>
          <button
            onClick={() => setView('home')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Powrót
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Moje inicjatywy</div>
            <div className="text-2xl font-bold text-blue-600">{orgInitiatives.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Oczekujące zgłoszenia</div>
            <div className="text-2xl font-bold text-yellow-600">{orgApplications.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Aktywni wolontariusze</div>
            <div className="text-2xl font-bold text-green-600">
              {orgInitiatives.reduce((sum, i) => sum + (i.approved_volunteers || 0), 0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Oczekujące zgłoszenia</h2>
          {orgApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Brak oczekujących zgłoszeń
            </div>
          ) : (
            <div className="space-y-3">
              {orgApplications.map(app => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{app.initiative_title}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="font-medium">{app.volunteer_name}</div>
                        <div>{app.volunteer_email}</div>
                        {app.volunteer_phone && <div>Tel: {app.volunteer_phone}</div>}
                      </div>
                      {app.message && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Wiadomość:</span> {app.message}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Zgłoszono: {new Date(app.applied_date).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => void approveApplication(app.id, 'approved')}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle size={16} /> Akceptuj
                      </button>
                      <button
                        onClick={() => void approveApplication(app.id, 'rejected')}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                      >
                        <X size={16} /> Odrzuć
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Moje inicjatywy</h2>
          {orgInitiatives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Brak utworzonych inicjatyw
            </div>
          ) : (
            <div className="space-y-3">
              {orgInitiatives.map(init => (
                <div key={init.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{init.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{init.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(init.category)}`}>
                          {init.category}
                        </span>
                        {getStatusBadge(init.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {init.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {init.start_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {init.hours_required}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {init.spots_available} miejsc
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-yellow-600 font-medium">
                          Oczekujących: {init.pending_applications || 0}
                        </span>
                        <span className="text-green-600 font-medium">
                          Zaakceptowanych: {init.approved_volunteers || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationView;