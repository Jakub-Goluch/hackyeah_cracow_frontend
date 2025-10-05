'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type {
  Initiative, User, Participation, Certificate,
  Statistics, CoordinatorReport,
  InitiativesResponse, ParticipationsResponse, CertificatesResponse,
  StudentsResponse, ApplicationsResponse
} from '~/types';
import CoordinatorView from './CoordinatorView';
import HomeView from './HomeView';
import OrganizationView from './OrganizationView';
import VolunteerView from './VolunteerView';

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

  // Memoizowane funkcje pomocnicze
  const getCategoryColor = useCallback((category: string) => {
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
  }, []);

  const getStatusBadge = useCallback((status: string) => {
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
  }, []);

  const fetchInitiatives = useCallback(async () => {
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
  }, [categoryFilter, locationFilter]); // Zależności: categoryFilter, locationFilter

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/statistics`);
      const data = await res.json() as Statistics;
      setStatistics(data);
    } catch (err) {
      console.error('Błąd pobierania statystyk:', err);
    }
  }, []);

  const fetchVolunteerData = useCallback(async (volunteerId: number) => {
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
  }, []);

  const fetchOrganizationData = useCallback(async (orgId: number) => {
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
  }, []);

  const fetchCoordinatorData = useCallback(async (coordId: number) => {
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
  }, []);

  // Funkcje do interakcji z API
  const applyToInitiative = useCallback(async (initiativeId: number) => {
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
  }, [selectedUserId, fetchVolunteerData]);

  const approveApplication = useCallback(async (participationId: number, status: 'approved' | 'rejected') => {
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
  }, [selectedUserId, fetchOrganizationData]);

  useEffect(() => {
    void fetchInitiatives();
  }, [fetchInitiatives]);

  useEffect(() => {
    void fetchStatistics();
  }, [fetchStatistics]);

  return (
    <div className="font-sans">
      {view === 'home' && (
        <HomeView
          statistics={statistics}
          initiatives={initiatives}
          setView={setView}
          setSelectedUserId={setSelectedUserId}
          fetchVolunteerData={fetchVolunteerData}
          fetchOrganizationData={fetchOrganizationData}
          fetchCoordinatorData={fetchCoordinatorData}
          getCategoryColor={getCategoryColor}
        />
      )}
      {view === 'volunteer' && (
        <VolunteerView
          selectedUserId={selectedUserId}
          participations={participations}
          certificates={certificates}
          initiatives={initiatives}
          categoryFilter={categoryFilter}
          locationFilter={locationFilter}
          showFilters={showFilters}
          categories={categories}
          locations={locations}
          setView={setView}
          fetchVolunteerData={fetchVolunteerData}
          setCategoryFilter={setCategoryFilter}
          setLocationFilter={setLocationFilter}
          setShowFilters={setShowFilters}
          applyToInitiative={applyToInitiative}
          getCategoryColor={getCategoryColor}
          getStatusBadge={getStatusBadge}
        />
      )}
      {view === 'organization' && (
        <OrganizationView
          selectedUserId={selectedUserId}
          orgInitiatives={orgInitiatives}
          orgApplications={orgApplications}
          setView={setView}
          fetchOrganizationData={fetchOrganizationData}
          approveApplication={approveApplication}
          getCategoryColor={getCategoryColor}
          getStatusBadge={getStatusBadge}
        />
      )}
      {view === 'coordinator' && (
        <CoordinatorView
          selectedUserId={selectedUserId}
          coordinatorStudents={coordinatorStudents}
          coordinatorReport={coordinatorReport}
          setView={setView}
          fetchCoordinatorData={fetchCoordinatorData}
          getCategoryColor={getCategoryColor}
        />
      )}
    </div>
  );
};

export default VolunteerApp;