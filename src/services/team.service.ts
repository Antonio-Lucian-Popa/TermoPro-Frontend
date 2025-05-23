import { Team, TeamMember, User } from '@/types';
import { apiService } from './api';

class TeamService {
  async createTeam(team: { name: string; companyId: string }): Promise<Team> {
    return apiService.post('/teams', team);
  }
  
  async getCompanyTeams(companyId: string): Promise<Team[]> {
    return apiService.get(`/teams?companyId=${companyId}`);
  }
  
  async getTeamDetails(teamId: string): Promise<Team> {
    return apiService.get(`/teams/${teamId}`);
  }
  
  async addUserToTeam(teamId: string, userId: string): Promise<void> {
    return apiService.post(`/teams/${teamId}/add/${userId}`);
  }
  
  async removeUserFromTeam(teamId: string, userId: string): Promise<void> {
    return apiService.delete(`/teams/${teamId}/remove/${userId}`);
  }
  
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return apiService.get(`/teams/${teamId}/members`);
  }
}

export const teamService = new TeamService();