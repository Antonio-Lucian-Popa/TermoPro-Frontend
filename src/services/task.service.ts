import { DashboardStats, Task, TaskUpdate } from '@/types';
import { apiService } from './api';

class TaskService {
  async createTask(task: Partial<Task>, creatorUserId: string): Promise<Task> {
    const params = new URLSearchParams({
      creatorUserId
    });
    return apiService.post(`/tasks?${params.toString()}`, task);
  }
  
  // async getCompanyTasks(companyId: string): Promise<Task[]> {
   
  //   return apiService.get(`/tasks/company/${companyId}`);
  // }

  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    return apiService.get(`/tasks/company/${companyId}/dashboard`);
  }

  async getCompanyTasksPaginated(companyId: string, page = 0, size = 10, status?: string, type?: string): Promise<{ content: Task[], totalPages: number, totalElements: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
  
    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (type && type !== 'all') {
      params.append('type', type);
    }
  
    return apiService.get(`/tasks/company/${companyId}?${params.toString()}`);
  }
  
  
  async getTeamTasks(teamId: string): Promise<Task[]> {
    return apiService.get(`/tasks/team/${teamId}`);
  }
  
  async getUserTasks(userId: string): Promise<Task[]> {
    return apiService.get(`/tasks/user/${userId}`);
  }
  
  async getTaskDetails(taskId: string, companyId: string): Promise<Task> {
    return apiService.get(`/tasks/${companyId}/${taskId}`);
  }
  
  async updateTaskStatus(taskId: string, status: string, companyId: string): Promise<Task> {
    const params = new URLSearchParams({
      status,
      companyId
    });
    return apiService.put(`/tasks/${taskId}/status?${params.toString()}`);
  }
  
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const params = new URLSearchParams({
      userId,
    });
    return apiService.delete(`/tasks/${taskId}?${params.toString()}`);
  }
  
  async addTaskUpdate(formData: FormData): Promise<TaskUpdate> {
    return apiService.post('/task-updates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
  async getTaskUpdates(taskId: string): Promise<TaskUpdate[]> {
    return apiService.get(`/task-updates/task/${taskId}`);
  }
}

export const taskService = new TaskService();