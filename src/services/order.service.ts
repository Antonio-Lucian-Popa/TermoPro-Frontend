import { Order } from '@/types';
import { apiService } from './api';

class OrderService {
  async createOrder(order: Partial<Order>): Promise<Order> {
    return apiService.post('/orders/create', order);
  }
  
  async getCompanyOrders(companyId: string): Promise<Order[]> {
    return apiService.get(`/orders/company/${companyId}`);
  }
  
  async getOrderDetails(orderId: string): Promise<Order> {
    return apiService.get(`/orders/${orderId}`);
  }
  
  async filterOrders(params: { companyId: string; date?: string; status?: string }): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    return apiService.get(`/orders/filter?${queryParams.toString()}`);
  }
  
  async deleteOrder(orderId: string): Promise<void> {
    return apiService.delete(`/orders/${orderId}`);
  }
  
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const params = new URLSearchParams({
      status,
    });
    return apiService.put(`/orders/${orderId}/status?${params.toString()}`, { status });
  }
  
  async exportOrdersToPdf(companyId: string): Promise<Blob> {
    const response = await fetch(`${apiService.getBaseUrl()}/orders/company/${companyId}/export/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    return response.blob();
  }
  
  async exportOrdersToExcel(companyId: string): Promise<Blob> {
    const response = await fetch(`${apiService.getBaseUrl()}/orders/company/${companyId}/export/excel`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    return response.blob();
  }
}

export const orderService = new OrderService();