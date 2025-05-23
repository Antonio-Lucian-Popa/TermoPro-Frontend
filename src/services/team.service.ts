import { Team, UpdateTeam, User } from '@/types';
import { apiService } from './api';

class TeamService {
  async createTeam(team: { name: string; companyId: string; requesterId: string }): Promise<Team> {
    const params = new URLSearchParams({
      name: team.name,
      companyId: team.companyId,
      requesterId: team.requesterId,
    });
    return apiService.post(`/teams?${params.toString()}`);
  }
  
  async getCompanyTeams(companyId: string): Promise<Team[]> {
    return apiService.get(`/teams?companyId=${companyId}`);
  }
  
  async getTeamDetails(teamId: string): Promise<Team> {
    return apiService.get(`/teams/${teamId}`);
  }
  
  async addUserToTeam(teamId: string, userId: string, requesterId: string): Promise<void> {
    const params = new URLSearchParams({
      userId: userId,
      requesterId: requesterId,
    });
    return apiService.post(`/teams/${teamId}/members?${params.toString()}`);
  }

  async updateTeam(teamId: string, updateTeam: UpdateTeam): Promise<Team> {
    return apiService.put(`/teams/${teamId}`, updateTeam);
  }

  async deleteTeam(teamId: string, requesterId: string): Promise<void> {
    const params = new URLSearchParams({
      requesterId: requesterId,
    });
    return apiService.delete(`/teams/${teamId}?${params.toString()}`);
  }
  
  async removeUserFromTeam(teamId: string, userId: string, requesterId: string): Promise<void> {
    const params = new URLSearchParams({
      requesterId: requesterId,
    });
    return apiService.delete(`/teams/${teamId}/members/${userId}?${params.toString()}`);
  }
  
  async getTeamMembers(teamId: string): Promise<User[]> {
    return apiService.get(`/teams/${teamId}/members`);
  }
}

export const teamService = new TeamService();