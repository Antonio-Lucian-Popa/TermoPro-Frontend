import { Company, Invitation, User } from '@/types';
import { apiService } from './api';

class CompanyService {
  async createCompany({ name, ownerId }: { name: string; ownerId: string }): Promise<Company> {
    return apiService.post('/company', { name, ownerId });
  }
  
  async getCompanyDetails(companyId: string): Promise<Company> {
    return apiService.get(`/company/${companyId}`);
  }
  
  async getCompanyUsers(companyId: string): Promise<User[]> {
    return apiService.get(`/company/${companyId}/users`);
  }
  
  async removeUserFromCompany(companyId: string, userId: string): Promise<void> {
    return apiService.delete(`/company/${companyId}/user/${userId}`);
  }
  
  async createInvitation(invitation: { employeeEmail: string; role: string; companyId: string }): Promise<Invitation> {
    return apiService.post('/invitations', invitation);
  }
  
  async getCompanyInvitations(companyId: string): Promise<Invitation[]> {
    return apiService.get(`/invitations/company/${companyId}`);
  }
  
  async deleteInvitation(invitationId: string): Promise<void> {
    return apiService.delete(`/invitations/${invitationId}`);
  }
}

export const companyService = new CompanyService();