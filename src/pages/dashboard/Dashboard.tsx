import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  PackageOpen,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats, Role, Task } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Mock data for demonstration
const mockStats: DashboardStats = {
  totalTasks: 24,
  pendingTasks: 8,
  completedTasks: 16,
  totalOrders: 18,
  pendingOrders: 5,
  completedOrders: 13,
  upcomingTimeOff: [
    {
      id: '1',
      userId: '1',
      startDate: '2025-07-15',
      endDate: '2025-07-20',
      type: 'CONCEDIU',
      status: 'APPROVED',
      createdAt: '2025-06-01',
      updatedAt: '2025-06-02',
      user: {
        id: '1',
        keycloakId: 'kc1',
        firstName: 'Ion',
        lastName: 'Popescu',
        email: 'ion@firma.ro',
        role: Role.TECHNICIAN,
        companyId: '1',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    }
  ],
  recentTasks: [
    {
      id: '1',
      title: 'Montaj ferestre',
      description: 'Montaj ferestre la Str. Victoriei 10, Etaj 2',
      taskType: 'MONTARE',
      status: 'PENDING',
      scheduledDate: '2025-06-15',
      assignedBy: '2',
      companyId: '1',
      createdAt: '2025-06-01',
      updatedAt: '2025-06-01'
    },
    {
      id: '2',
      title: 'Reparație ușă',
      description: 'Reparație ușă la Str. Libertății 5',
      taskType: 'REPARATIE',
      status: 'IN_PROGRESS',
      scheduledDate: '2025-06-12',
      assignedBy: '2',
      companyId: '1',
      createdAt: '2025-06-02',
      updatedAt: '2025-06-02'
    }
  ],
  todayTasks: [
    {
      id: '3',
      title: 'Măsurare ferestre',
      description: 'Măsurare ferestre la Str. Primăverii 8',
      taskType: 'MASURARE',
      status: 'PENDING',
      scheduledDate: '2025-06-10',
      assignedBy: '2',
      companyId: '1',
      createdAt: '2025-06-03',
      updatedAt: '2025-06-03'
    }
  ]
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bine ai venit, {user?.firstName} {user?.lastName}!
          </p>
        </div>
        {(user?.role === Role.OWNER || user?.role === Role.MANAGER) && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button onClick={() => navigate('/tasks/create')}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Sarcină nouă
            </Button>
            <Button variant="outline" onClick={() => navigate('/orders/create')}>
              <PackageOpen className="mr-2 h-4 w-4" />
              Comandă nouă
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sarcini totale</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTasks} în așteptare
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comenzi active</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} nerezolvate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Echipe active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              15 membri în total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concedii curente</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTimeOff.length}</div>
            <p className="text-xs text-muted-foreground">
              Luna aceasta
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Sarcini de azi</TabsTrigger>
          <TabsTrigger value="upcoming">Sarcini recente</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          {stats.todayTasks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardDescription>Nu aveți sarcini programate pentru astăzi.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          {stats.recentTasks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardDescription>Nu aveți sarcini recente.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'MONTARE':
        return 'Montare';
      case 'REPARATIE':
        return 'Reparație';
      case 'MASURARE':
        return 'Măsurare';
      case 'CONSULTANTA':
        return 'Consultanță';
      case 'ALTELE':
        return 'Altele';
      default:
        return type;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'În așteptare';
      case 'IN_PROGRESS':
        return 'În lucru';
      case 'COMPLETED':
        return 'Finalizat';
      case 'CANCELLED':
        return 'Anulat';
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>
        <CardDescription>{getTaskTypeLabel(task.taskType)}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm mb-4 line-clamp-2">{task.description}</p>
        <div className="text-xs text-muted-foreground">
          Programat: {formatDate(task.scheduledDate)}
        </div>
      </CardContent>
    </Card>
  );
}