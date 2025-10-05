// src/components/HomeView.tsx
import React from 'react';
import { Users, Building2, FileText, MapPin, Clock } from 'lucide-react';
import type { Initiative, Statistics } from '~/types';

interface HomeViewProps {
  statistics: Statistics | null;
  initiatives: Initiative[] | null; // <--- Zmieniono tutaj
  setView: (view: 'home' | 'volunteer' | 'organization' | 'coordinator') => void;
  setSelectedUserId: (id: number) => void;
  fetchVolunteerData: (id: number) => Promise<void>;
  fetchOrganizationData: (id: number) => Promise<void>;
  fetchCoordinatorData: (id: number) => Promise<void>;
  getCategoryColor: (category: string) => string;
}

const HomeView: React.FC<HomeViewProps> = ({
  statistics,
  initiatives, // Teraz initiatives może być null
  setView,
  setSelectedUserId,
  fetchVolunteerData,
  fetchOrganizationData,
  fetchCoordinatorData,
  getCategoryColor,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Krakowskie Cyfrowe Centrum Wolontariatu
        </h1>
        <p className="text-xl text-gray-600">
          Łączymy młodych wolontariuszy z organizacjami w Krakowie
        </p>
      </div>

      {statistics && (
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Wolontariusze</div>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.overview.volunteers}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Organizacje</div>
            <div className="text-2xl font-bold text-green-600">
              {statistics.overview.organizations}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Aktywne inicjatywy</div>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.overview.active_initiatives}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Łącznie godzin</div>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.overview.total_hours ?? 0}h
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          onClick={() => {
            setView('volunteer');
            setSelectedUserId(1);
            void fetchVolunteerData(1);
          }}
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Wolontariusz</h3>
          <p className="text-gray-600">Przeglądaj inicjatywy i zgłaszaj się do akcji wolontariackich</p>
        </div>

        <div
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          onClick={() => {
            setView('organization');
            setSelectedUserId(11);
            void fetchOrganizationData(11);
          }}
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="text-green-600" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Organizacja</h3>
          <p className="text-gray-600">Twórz inicjatywy i zarządzaj zgłoszeniami wolontariuszy</p>
        </div>

        <div
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          onClick={() => {
            setView('coordinator');
            setSelectedUserId(18);
            void fetchCoordinatorData(18);
          }}
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="text-purple-600" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Koordynator</h3>
          <p className="text-gray-600">Monitoruj uczniów i generuj raporty szkolne</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Dostępne inicjatywy</h2>
        {(initiatives ?? []).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Brak dostępnych inicjatyw lub trwa ładowanie danych...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(initiatives ?? []).slice(0, 4).map(init => (
              <div key={init.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{init.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(init.category)}`}>
                    {init.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{init.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> {init.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> {init.hours_required}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default HomeView;