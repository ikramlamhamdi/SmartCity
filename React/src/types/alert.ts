export type AlertDomain = 'traffic' | 'school' | 'home';
export type AlertCategory = 'ACCIDENT' | 'RED_LIGHT' | 'CO2_HIGH' | 'INTRUSION';

export interface Alert {
  id: number;
  domain: AlertDomain;
  category: AlertCategory;
  severity: number; // 1-5
  location: string;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
}

export interface StatusResponse {
  status: 'RAS' | 'ALERTE';
  domain?: AlertDomain;
  category?: AlertCategory;
  severity?: number;
  location?: string;
  message?: string;
  timestamp?: string;
}

export interface HealthResponse {
  status: string;
  alerts_count: number;
  domains: Record<AlertDomain, 'active' | 'idle'>;
}