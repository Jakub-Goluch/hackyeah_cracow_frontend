'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Calendar, Clock, Users, Award, ChevronRight,
  Filter, X, Building2, TrendingUp, FileText, CheckCircle
} from 'lucide-react';
import type {
  Initiative, User, Participation, Certificate,
  Statistics, CoordinatorReport,
  InitiativesResponse, ParticipationsResponse, CertificatesResponse,
  StudentsResponse, ApplicationsResponse
} from '~/types';

const API_URL = 'http://localhost:8000';

const VolunteerApp: React.FC = () => {
  const [view, setView] = useState<'home' | 'volunteer' | 'organization' | 'coordinator'>('home');
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [orgInitiatives, setOrgInitiatives] = useState<Initiative[]>([]);
  const [orgApplications, setOrgApplications] = useState<Participation[]>([]);
  const [coordinatorStudents, setCoordinatorStudents] = useState<User[]>([]);
  const [coordinatorReport, setCoordinatorReport] = useState<CoordinatorReport | null>(null);

  const categories = [
    'Pomoc społeczna', 'Ekologia', 'Kultura', 'Edukacja',
    'Sport', 'Opieka nad zwierzętami', 'Pomoc seniorom'
  ];

  const locations = [
    'Stare Miasto', 'Kazimierz', 'Podgórze', 'Krowodrza',
    'Nowa Huta', 'Dębniki', 'Prądnik Biały'
  ];

  useEffect(() => {
    void fetchInitiatives();
    void fetchStatistics();
  }, [categoryFilter, locationFilter]);

  const fetchInitiatives = async () => {
    try {
      let url = `${API_URL}/initiatives?`;
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (locationFilter) url += `location=${encodeURIComponent(locationFilter)}`;

      const res = await fetch(url);
      const data = await res.json() as InitiativesResponse;
      setInitiatives(Array.isArray(data.initiatives) ? data.initiatives : []);
    } catch (err) {
      console.error('Błąd pobierania inicjatyw:', err);
      setInitiatives([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch(`${API_URL}/statistics`);
      const data = await res.json() as Statistics;
      setStatistics(data);
    } catch (err) {
      console.error('Błąd pobierania statystyk:', err);
    }
  };

  const fetchVolunteerData = async (volunteerId: number) => {
    try {
      const [parRes, certRes] = await Promise.all([
        fetch(`${API_URL}/volunteers/${volunteerId}/participations`),
        fetch(`${API_URL}/volunteers/${volunteerId}/certificates`)
      ]);

      const parData = await parRes.json() as ParticipationsResponse;
      const certData = await certRes.json() as CertificatesResponse;

      setParticipations(Array.isArray(parData.participations) ? parData.participations : []);
      setCertificates(Array.isArray(certData.certificates) ? certData.certificates : []);
    } catch (err) {
      console.error('Błąd pobierania danych wolontariusza:', err);
      setParticipations([]);
      setCertificates([]);
    }
  };

  const fetchOrganizationData = async (orgId: number) => {
    try {
      const [initRes, appRes] = await Promise.all([
        fetch(`${API_URL}/organizations/${orgId}/initiatives`),
        fetch(`${API_URL}/organizations/${orgId}/applications?status=pending`)
      ]);

      const initData = await initRes.json() as InitiativesResponse;
      const appData = await appRes.json() as ApplicationsResponse;

      setOrgInitiatives(Array.isArray(initData.initiatives) ? initData.initiatives : []);
      setOrgApplications(Array.isArray(appData.applications) ? appData.applications : []);
    } catch (err) {
      console.error('Błąd pobierania danych organizacji:', err);
      setOrgInitiatives([]);
      setOrgApplications([]);
    }
  };

  const fetchCoordinatorData = async (coordId: number) => {
    try {
      const [studRes, repRes] = await Promise.all([
        fetch(`${API_URL}/coordinators/${coordId}/students`),
        fetch(`${API_URL}/coordinators/${coordId}/reports`)
      ]);

      const studData = await studRes.json() as StudentsResponse;
      const repData = await repRes.json() as CoordinatorReport;

      setCoordinatorStudents(Array.isArray(studData.students) ? studData.students : []);
      setCoordinatorReport(repData);
    } catch (err) {
      console.error('Błąd pobierania danych koordynatora:', err);
      setCoordinatorStudents([]);
      setCoordinatorReport(null);
    }
  };

  const applyToInitiative = async (initiativeId: number) => {
    try {
      const res = await fetch(`${API_URL}/initiatives/${initiativeId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_id: selectedUserId,
          initiative_id: initiativeId,
          message: 'Chętnie pomogę w tej inicjatywie!'
        })
      });

      if (res.ok) {
        alert('Zgłoszenie wysłane pomyślnie!');
        await fetchVolunteerData(selectedUserId);
      } else {
        const error = await res.json() as { detail?: string };
        alert(error.detail || 'Błąd podczas zgłaszania');
      }
    } catch (err) {
      alert('Błąd podczas zgłaszania się do inicjatywy');
    }
  };

  const approveApplication = async (participationId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`${API_URL}/participations/${participationId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        alert(`Zgłoszenie ${status === 'approved' ? 'zaakceptowane' : 'odrzucone'}!`);
        await fetchOrganizationData(selectedUserId);
      }
    } catch (err) {
      alert('Błąd podczas aktualizacji statusu');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Pomoc społeczna': 'bg-blue-100 text-blue-800',
      'Ekologia': 'bg-green-100 text-green-800',
      'Kultura': 'bg-purple-100 text-purple-800',
      'Edukacja': 'bg-yellow-100 text-yellow-800',
      'Sport': 'bg-red-100 text-red-800',
      'Opieka nad zwierzętami': 'bg-orange-100 text-orange-800',
      'Pomoc seniorom': 'bg-pink-100 text-pink-800'
    };
    return colors[category] ?? 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800',
      'rejected': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    const labels: Record<string, string> = {
      'active': 'Aktywna',
      'pending': 'Oczekuje',
      'approved': 'Zaakceptowane',
      'completed': 'Ukończone',
      'rejected': 'Odrzucone',
      'cancelled': 'Anulowane'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  const HomeView: React.FC = () => (
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
          {initiatives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Brak dostępnych inicjatyw lub trwa ładowanie danych...</p>
              <p className="text-sm mt-2">Upewnij się, że backend działa na http://localhost:8000</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {initiatives.slice(0, 4).map(init => (
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

  const VolunteerView: React.FC = () => {
    useEffect(() => {
      void fetchVolunteerData(selectedUserId);
    }, []);

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

  const OrganizationView: React.FC = () => {
    useEffect(() => {
      void fetchOrganizationData(selectedUserId);
    }, []);

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

  const CoordinatorView: React.FC = () => {
    useEffect(() => {
      void fetchCoordinatorData(selectedUserId);
    }, []);

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
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Imię i nazwisko</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Telefon</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Godziny</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Uczestnictwa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinatorStudents.map((student) => (
                      <tr key={student.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{student.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-blue-600">
                            {student.total_hours || 0}h
                          </span>
                        </td>
                        <td className="px-4 py-3">
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

  return (
    <div className="font-sans">
      {view === 'home' && <HomeView />}
      {view === 'volunteer' && <VolunteerView />}
      {view === 'organization' && <OrganizationView />}
      {view === 'coordinator' && <CoordinatorView />}
    </div>
  );
};

export default VolunteerApp;