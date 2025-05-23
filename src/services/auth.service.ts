import { Role, User } from '@/types';
import { apiService } from './api';

class AuthService {
  async login(email: string, password: string): Promise<any> {
    return apiService.post('/users/login', { email, password });
  }
  
  async register(userData: Partial<User> & { password: string }): Promise<User> {
    return apiService.post('/users/register', userData);
  }
  
  async registerWithInvite(userData: Partial<User> & { password: string }, token: string): Promise<User> {
    return apiService.post(`/users/register-invite?token=${token}`, userData);
  }
  
  async getUserByKeycloakId(keycloakId: string): Promise<User> {
    return apiService.get(`/users/by-keycloak/${keycloakId}`);
  }

  async getUserById(userId: string): Promise<User> {
    return apiService.get(`/users/${userId}`);
  }
  
  async deleteUser(keycloakId: string): Promise<void> {
    return apiService.delete(`/users/by-keycloak/${keycloakId}`);
  }

  async validateInvitation(token: string): Promise<{ used: boolean, employeeEmail: string, role: Role, companyId: string }> {
    return apiService.get<{ used: boolean, employeeEmail: string, role: Role, companyId: string }>(`/invitations/validate?token=${token}`);
  }
}

export const authService = new AuthService();