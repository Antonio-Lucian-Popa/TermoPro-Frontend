import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, User, FileText } from 'lucide-react';
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
import { Task, TaskStatus, TaskType, Role } from '@/types';
import { taskService } from '@/services/task.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { authService } from '@/services/auth.service';

export default function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      loadTaskDetails();
    }
  }, [taskId]);

  const loadTaskDetails = async () => {
    if (!taskId) return;

    try {
      if (!user?.companyId) {
        throw new Error('Company ID is required to load task details.');
      }
      const data = await taskService.getTaskDetails(taskId, user.companyId);
      const assignedUser = await authService.getUserById(data.assignedBy);
      setTask({
        ...data,
        assignedByUser: assignedUser, // adaugăm manual userul complet aici
      });
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca detaliile sarcinii.',
      });
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || !taskId) return;

    try {
      if (!user?.companyId) {
        throw new Error('Company ID is required to update task status.');
      }
      const updatedTask = await taskService.updateTaskStatus(taskId, newStatus, user.companyId);
      setTask(updatedTask);
      toast({
        title: 'Succes',
        description: 'Statusul sarcinii a fost actualizat.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut actualiza statusul sarcinii.',
      });
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;

    try {
      await taskService.deleteTask(taskId, user?.id || '');
      toast({
        title: 'Succes',
        description: 'Sarcina a fost ștearsă.',
      });
      navigate('/tasks');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut șterge sarcina.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!task) {
    return null;
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'În așteptare';
      case TaskStatus.IN_PROGRESS:
        return 'În lucru';
      case TaskStatus.COMPLETED:
        return 'Finalizat';
      case TaskStatus.CANCELLED:
        return 'Anulat';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: TaskType) => {
    switch (type) {
      case TaskType.MONTARE:
        return 'Montare';
      case TaskType.REPARATIE:
        return 'Reparație';
      case TaskType.MASURARE:
        return 'Măsurare';
      case TaskType.CONSULTANTA:
        return 'Consultanță';
      case TaskType.ALTELE:
        return 'Altele';
      default:
        return type;
    }
  };

  const canManageTask = user?.role === Role.OWNER || user?.role === Role.MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <p className="text-muted-foreground">
            {getTypeLabel(task.taskType)}
          </p>
        </div>
        {canManageTask && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Șterge</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmați ștergerea</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sunteți sigur că doriți să ștergeți această sarcină?
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
            <CardTitle>Detalii sarcină</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Programat: {new Date(task.scheduledDate).toLocaleDateString('ro-RO')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                Asignat de: {task.assignedByUser?.firstName} {task.assignedByUser?.lastName}
              </span>
            </div>
            {task.user && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  Asignat lui: {task.user.firstName} {task.user.lastName}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{task.description}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Statusul curent al sarcinii
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`inline-block px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </div>
            {canManageTask && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED && (
              <div className="flex gap-2">
                {task.status === TaskStatus.PENDING && (
                  <Button onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}>
                    Marchează în lucru
                  </Button>
                )}
                {task.status === TaskStatus.IN_PROGRESS && (
                  <Button onClick={() => handleStatusChange(TaskStatus.COMPLETED)}>
                    Marchează finalizat
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange(TaskStatus.CANCELLED)}
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