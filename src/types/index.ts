// API Response wrappers
export interface InitiativesResponse {
  initiatives: Initiative[];
  count: number;
}

export interface ParticipationsResponse {
  participations: Participation[];
  count: number;
}

export interface CertificatesResponse {
  certificates: Certificate[];
  count: number;
}

export interface UsersResponse {
  users: User[];
  count: number;
}

export interface StudentsResponse {
  students: User[];
  count: number;
}

export interface ApplicationsResponse {
  applications: Participation[];
  count: number;
}

// Main entities
export interface Initiative {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  hours_required: number;
  spots_available: number;
  requirements: string | null;
  status: 'active' | 'completed' | 'cancelled';
  organization_id: number;
  organization_name?: string;
  organization_email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  applications_count?: number;
  pending_applications?: number;
  approved_volunteers?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'volunteer' | 'organization' | 'coordinator';
  phone?: string;
  age_category?: string;
  school_id?: number;
  school_name?: string;
  created_at?: string;
  total_participations?: number;
  total_hours?: number;
}

export interface Participation {
  id: number;
  volunteer_id: number;
  initiative_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  applied_date: string;
  approved_date?: string;
  hours_completed: number;
  message?: string;
  initiative_title?: string;
  category?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  organization_name?: string;
  volunteer_name?: string;
  volunteer_email?: string;
  volunteer_phone?: string;
}

export interface Certificate {
  id: number;
  participation_id: number;
  volunteer_id: number;
  organization_id: number;
  issued_date: string;
  hours_completed: number;
  certificate_data?: string;
  initiative_title?: string;
  organization_name?: string;
}

export interface Statistics {
  overview: {
    volunteers: number;
    organizations: number;
    coordinators: number;
    active_initiatives: number;
    completed_participations: number;
    total_hours: number;
  };
  categories: Array<{
    category: string;
    count: number;
  }>;
  recent_initiatives: Array<{
    title: string;
    category: string;
    start_date: string;
    organization: string;
  }>;
}

export interface CoordinatorReport {
  school_id: number;
  statistics: {
    total_students: number;
    total_participations: number;
    total_hours: number;
    total_certificates: number;
  };
  popular_categories: Array<{
    category: string;
    count: number;
  }>;
  generated_at: string;
}