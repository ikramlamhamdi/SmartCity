export type AlertDomain = 'traffic' | 'school' | 'home';

export type AlertCategory =
  | 'ACCIDENT'
  | 'RED_LIGHT'
  | 'CO2_HIGH'
  | 'INTRUSION'
  | 'FIRE'
  | 'GAS_HIGH'
  | 'GAS_LOW'
  | 'MOTION'
  | 'SENSOR_OFFLINE'
  | 'ENVIRONMENT_HIGH'
  | 'ENVIRONMENT_LOW';

export interface Alert {
  id: number;
  domain: AlertDomain;
  category: AlertCategory;
  severity: number; // 1-5
  location: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
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
  sensors_count: number;
  lock_status: 'locked' | 'unlocked';
  domains: Record<AlertDomain, 'active' | 'idle'>;
}

export type SensorType = 'gas' | 'environment' | 'light' | 'motion' | 'distance';

export interface Sensor {
  id: string;
  type: SensorType;
  name: string;
  value: number;
  unit: string;
  location: string;
  domain: AlertDomain;
  status: 'online' | 'offline';
  last_updated: string;
}

export interface LockStatus {
  locked: boolean;
  method: string | null;
  last_action: string | null;
  last_updated: string;
}

export interface TrafficLight {
  id: string;
  location: string;
  state: 'red' | 'yellow' | 'green';
  last_updated: string;
}