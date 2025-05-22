import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus, Role } from '@/types';
import { orderService } from '@/services/order.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Orders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user?.companyId) return;

    try {
      const data = await orderService.getCompanyOrders(user.companyId);
      setOrders(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca comenzile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    return statusFilter === 'all' || order.status === statusFilter;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case OrderStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case OrderStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'În așteptare';
      case OrderStatus.SCHEDULED:
        return 'Programat';
      case OrderStatus.IN_PROGRESS:
        return 'În lucru';
      case OrderStatus.COMPLETED:
        return 'Finalizat';
      case OrderStatus.CANCELLED:
        return 'Anulat';
      default:
        return status;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const canCreateOrder = user?.role === Role.OWNER || 
                        user?.role === Role.MANAGER || 
                        user?.role === Role.OPERATOR;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comenzi</h1>
          <p className="text-muted-foreground">
            Gestionați comenzile și urmăriți progresul
          </p>
        </div>
        {canCreateOrder && (
          <Button asChild>
            <Link to="/orders/create">
              <Plus className="mr-2 h-4 w-4" />
              Comandă nouă
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtre</CardTitle>
              <CardDescription>Filtrați comenzile după status</CardDescription>
            </div>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Nu există comenzi care să corespundă filtrelor selectate
            </CardDescription>
          </CardHeader>
          {canCreateOrder && (
            <CardContent className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/orders/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Creează o comandă nouă
                </Link>
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{order.clientName}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <CardDescription>{order.clientPhone}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-2">{order.clientAddress}</p>
                  <div className="text-xs text-muted-foreground">
                    Programat: {new Date(order.scheduledDate).toLocaleDateString('ro-RO')}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}