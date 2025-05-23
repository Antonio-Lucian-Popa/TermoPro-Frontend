import { Task, TaskUpdate } from '@/types';
import { apiService } from './api';

class TaskService {
  async createTask(task: Partial<Task>, creatorUserId: string): Promise<Task> {
    const params = new URLSearchParams({
      creatorUserId
    });
    return apiService.post(`/tasks?${params.toString()}`, task);
  }
  
  async getCompanyTasks(companyId: string): Promise<Task[]> {
   
    return apiService.get(`/tasks/company/${companyId}`);
  }
  
  async getTeamTasks(teamId: string): Promise<Task[]> {
    return apiService.get(`/tasks/team/${teamId}`);
  }
  
  async getUserTasks(userId: string): Promise<Task[]> {
    return apiService.get(`/tasks/user/${userId}`);
  }
  
  async getTaskDetails(taskId: string): Promise<Task> {
    return apiService.get(`/tasks/${taskId}`);
  }
  
  async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    return apiService.put(`/tasks/${taskId}/status`, { status });
  }
  
  async deleteTask(taskId: string): Promise<void> {
    return apiService.delete(`/tasks/${taskId}`);
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