import axios from 'axios';
import { config } from './config';
import { frontendLogger } from './logger';

const API_BASE_URL = config.apiUrl || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use((request) => {
  frontendLogger.logApi(request.method?.toUpperCase() || 'GET', request.url || '');
  return request;
});

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    frontendLogger.logApi(
      response.config.method?.toUpperCase() || 'GET', 
      response.config.url || '', 
      response.status
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const method = error.config?.method?.toUpperCase() || 'GET';
    
    frontendLogger.error(`API Error: ${method} ${url}`, {
      status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  createdAt: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  joinedAt: string;
  user: User;
  room?: Room;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  gender: 'MALE' | 'FEMALE';
  isFull: boolean;
  createdAt: string;
  sheetId: string;
  members: RoomMember[];
  sheet?: Sheet;
}

export interface Sheet {
  id: string;
  name: string;
  createdAt: string;
  rooms: Room[];
  code?: string; // Only included in admin endpoints
}

export interface JoinRoomData {
  firstname: string;
  lastname: string;
}

// API functions
export const sheetsApi = {
  getAll: () => api.get<Sheet[]>('/sheets'),
  getAllWithCodes: () => api.get<Sheet[]>('/sheets/admin/with-codes'), // Admin endpoint with codes
  getOne: (id: string) => api.get<Sheet>(`/sheets/${id}`),
  create: (data: { name: string }) => api.post<Sheet>('/sheets', data),
  update: (id: string, data: { name: string }) => api.put<Sheet>(`/sheets/${id}`, data),
  delete: (id: string) => api.delete(`/sheets/${id}`),
  validateCode: (code: string) => api.post<{ sheetId: string }>('/sheets/validate-code', { code }),
};

export const roomsApi = {
  getAll: (gender?: string) => api.get<Room[]>(`/rooms${gender ? `?gender=${gender}` : ''}`),
  getOne: (id: string) => api.get<Room>(`/rooms/${id}`),
  create: (data: {
    name: string;
    capacity: number;
    gender: 'MALE' | 'FEMALE';
    sheetId: string;
  }) => api.post<Room>('/rooms', data),
  update: (id: string, data: Partial<Room>) => api.patch<Room>(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
  join: (id: string, data: JoinRoomData) => api.post<Room>(`/rooms/${id}/join`, data),
  getMembers: (id: string) => api.get<RoomMember[]>(`/rooms/${id}/members`),
  removeMember: (roomId: string, memberId: string) => 
    api.delete(`/rooms/${roomId}/members/${memberId}`),
  markFull: (id: string) => api.patch<Room>(`/rooms/${id}/mark-full`),
  moveMember: (memberId: string, data: { destinationRoomId: string }) =>
    api.post(`/rooms/members/${memberId}/move`, data),
  getAvailableRoomsForMember: (memberId: string) =>
    api.get<Room[]>(`/rooms/members/${memberId}/available-rooms`),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const membersApi = {
  getAll: () => api.get<RoomMember[]>('/members'),
  getAnalytics: () => api.get<{
    totalMembers: number;
    totalRooms: number;
    totalCapacity: number;
    occupancyRate: number;
    roomsByGender: Array<{ gender: string; _count: { _all: number } }>;
  }>('/members/analytics'),
};