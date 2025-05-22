import { TimeOffRequest } from '@/types';
import { apiService } from './api';

class TimeOffService {
  async createTimeOffRequest(request: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    return apiService.post('/time-off', request);
  }
  
  async getUserTimeOffRequests(userId: string): Promise<TimeOffRequest[]> {
    return apiService.get(`/time-off/user/${userId}`);
  }
  
  async getTimeOffByDate(date: string): Promise<TimeOffRequest[]> {
    return apiService.get(`/time-off/by-date?date=${date}`);
  }
  
  async getPendingTimeOffRequests(companyId: string): Promise<TimeOffRequest[]> {
    return apiService.get(`/time-off/pending/company/${companyId}`);
  }
  
  async approveTimeOffRequest(requestId: string, keycloakId: string): Promise<TimeOffRequest> {
    return apiService.put(`/time-off/${requestId}/approve?keycloakId=${keycloakId}`);
  }
  
  async rejectTimeOffRequest(requestId: string, keycloakId: string): Promise<void> {
    return apiService.delete(`/time-off/${requestId}/reject?keycloakId=${keycloakId}`);
  }
  
  async exportTimeOffToPdf(userId: string): Promise<Blob> {
    const response = await fetch(`${apiService.getBaseUrl()}/time-off/user/${userId}/export/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    return response.blob();
  }
  
  async exportTimeOffToExcel(userId: string): Promise<Blob> {
    const response = await fetch(`${apiService.getBaseUrl()}/time-off/user/${userId}/export/excel`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    return response.blob();
  }
}

export const timeOffService = new TimeOffService();