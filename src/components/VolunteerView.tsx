import React, { useEffect } from 'react';
import { MapPin, Calendar, Clock, Users, Award, ChevronRight, Filter } from 'lucide-react';
import type { Initiative, Participation, Certificate } from '~/types';

interface VolunteerViewProps {
  selectedUserId: number;
  participations: Participation[];
  certificates: Certificate[];
  initiatives: Initiative[];
  categoryFilter: string;
  locationFilter: string;
  showFilters: boolean;
  categories: string[];
  locations: string[];
  setView: (view: 'home' | 'volunteer' | 'organization' | 'coordinator') => void;
  fetchVolunteerData: (id: number) => Promise<void>;
  setCategoryFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
  setShowFilters: (show: boolean) => void;
  applyToInitiative: (initiativeId: number) => Promise<void>;
  getCategoryColor: (category: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const VolunteerView: React.FC<VolunteerViewProps> = ({
  selectedUserId,
  participations,
  certificates,
  initiatives,
  categoryFilter,
  locationFilter,
  showFilters,
  categories,
  locations,
  setView,
  fetchVolunteerData,
  setCategoryFilter,
  setLocationFilter,
  setShowFilters,
  applyToInitiative,
  getCategoryColor,
  getStatusBadge,
}) => {
  useEffect(() => {
    void fetchVolunteerData(selectedUserId);
  }, [selectedUserId, fetchVolunteerData]); // Dodano selectedUserId i fetchVolunteerData do zależności useEffect

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel Wolontariusza</h1>
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
            <div className="text-sm text-gray-600">Łącznie godzin</div>
            <div className="text-2xl font-bold text-blue-600">
              {participations.reduce((sum, p) => sum + (p.hours_completed || 0), 0)}h
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Uczestnictwa</div>
            <div className="text-2xl font-bold text-green-600">{participations.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Zaświadczenia</div>
            <div className="text-2xl font-bold text-purple-600">{certificates.length}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Dostępne inicjatywy</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Filter size={20} /> Filtry
              </button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Kategoria</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Wszystkie</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lokalizacja</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Wszystkie</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {initiatives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Brak inicjatyw do wyświetlenia
                </div>
              ) : (
                initiatives.map(init => (
                  <div key={init.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{init.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{init.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(init.category)}`}>
                            {init.category}
                          </span>
                          {getStatusBadge(init.status)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={16} /> {init.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={16} /> {init.start_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} /> {init.hours_required}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={16} /> {init.spots_available} miejsc
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => void applyToInitiative(init.id)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                      >
                        Zgłoś się <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Moje uczestnictwa</h2>
            <div className="space-y-3">
              {participations.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Brak uczestnictw
                </div>
              ) : (
                participations.map(part => (
                  <div key={part.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{part.initiative_title || `Inicjatywa #${part.initiative_id}`}</div>
                        <div className="text-xs text-gray-500">{part.organization_name}</div>
                      </div>
                      {getStatusBadge(part.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Data zgłoszenia: {new Date(part.applied_date).toLocaleDateString('pl-PL')}</div>
                      <div>Ukończone godziny: {part.hours_completed || 0}h</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Moje zaświadczenia</h2>
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Brak zaświadczeń
                </div>
              ) : (
                certificates.map(cert => (
                  <div key={cert.id} className="border rounded-lg p-3 bg-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="text-purple-600" size={20} />
                      <div className="font-medium">Zaświadczenie #{cert.id}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{cert.initiative_title}</div>
                      <div>{cert.organization_name}</div>
                      <div className="mt-1">Data wystawienia: {new Date(cert.issued_date).toLocaleDateString('pl-PL')}</div>
                      <div>Potwierdzone godziny: {cert.hours_completed}h</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerView;