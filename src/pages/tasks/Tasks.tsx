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
import { Task, TaskStatus, TaskType, Role } from '@/types';
import { taskService } from '@/services/task.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!user?.companyId) return;

    try {
      const data = await taskService.getCompanyTasks(user.companyId);
      setTasks(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca sarcinile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.taskType === typeFilter;
    return matchesStatus && matchesType;
  });

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

  if (loading) {
    return <LoadingSpinner />;
  }

  const canCreateTask = user?.role === Role.OWNER || user?.role === Role.MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sarcini</h1>
          <p className="text-muted-foreground">
            Gestionați sarcinile și urmăriți progresul
          </p>
        </div>
        {canCreateTask && (
          <Button asChild>
            <Link to="/tasks/create">
              <Plus className="mr-2 h-4 w-4" />
              Sarcină nouă
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtre</CardTitle>
              <CardDescription>Filtrați sarcinile după status și tip</CardDescription>
            </div>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  {Object.values(TaskStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  {Object.values(TaskType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Nu există sarcini care să corespundă filtrelor selectate
            </CardDescription>
          </CardHeader>
          {canCreateTask && (
            <CardContent className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/tasks/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Creează o sarcină nouă
                </Link>
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  <CardDescription>{getTypeLabel(task.taskType)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-2">{task.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Programat: {new Date(task.scheduledDate).toLocaleDateString('ro-RO')}
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