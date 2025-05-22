import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus, Role } from '@/types';
import { orderService } from '@/services/order.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    try {
      const data = await orderService.getOrderDetails(orderId);
      setOrder(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca detaliile comenzii.',
      });
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || !orderId) return;

    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder);
      toast({
        title: 'Succes',
        description: 'Statusul comenzii a fost actualizat.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut actualiza statusul comenzii.',
      });
    }
  };

  const handleDelete = async () => {
    if (!orderId) return;

    try {
      await orderService.deleteOrder(orderId);
      toast({
        title: 'Succes',
        description: 'Comanda a fost ștearsă.',
      });
      navigate('/orders');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut șterge comanda.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return null;
  }

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

  const canManageOrder = user?.role === Role.OWNER || 
                        user?.role === Role.MANAGER || 
                        user?.role === Role.OPERATOR;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Comandă - {order.clientName}
          </h1>
          <p className="text-muted-foreground">
            Detaliile comenzii și statusul curent
          </p>
        </div>
        {canManageOrder && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Șterge</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmați ștergerea</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sunteți sigur că doriți să ștergeți această comandă?
                    Această acțiune nu poate fi anulată.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Șterge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalii client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.clientPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{order.clientAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Programat: {new Date(order.scheduledDate).toLocaleDateString('ro-RO')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Statusul curent al comenzii
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`inline-block px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </div>
            {canManageOrder && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
              <div className="flex gap-2">
                {order.status === OrderStatus.PENDING && (
                  <Button onClick={() => handleStatusChange(OrderStatus.SCHEDULED)}>
                    Marchează programat
                  </Button>
                )}
                {order.status === OrderStatus.SCHEDULED && (
                  <Button onClick={() => handleStatusChange(OrderStatus.IN_PROGRESS)}>
                    Marchează în lucru
                  </Button>
                )}
                {order.status === OrderStatus.IN_PROGRESS && (
                  <Button onClick={() => handleStatusChange(OrderStatus.COMPLETED)}>
                    Marchează finalizat
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
                >
                  Anulează
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}