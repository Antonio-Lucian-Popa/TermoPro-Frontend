import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { TimeOffRequest, TimeOffStatus, TimeOffType } from '@/types';
import { timeOffService } from '@/services/timeoff.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function TimeOff() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTimeOffRequests();
    }
  }, [user]);

  const loadTimeOffRequests = async () => {
    if (!user) return;

    try {
      const data = await timeOffService.getUserTimeOffRequests(user.id);
      setRequests(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca cererile de concediu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TimeOffStatus) => {
    switch (status) {
      case TimeOffStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TimeOffStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case TimeOffStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: TimeOffStatus) => {
    switch (status) {
      case TimeOffStatus.PENDING:
        return 'În așteptare';
      case TimeOffStatus.APPROVED:
        return 'Aprobat';
      case TimeOffStatus.REJECTED:
        return 'Respins';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: TimeOffType) => {
    switch (type) {
      case TimeOffType.CONCEDIU:
        return 'Concediu';
      case TimeOffType.INVOIERE:
        return 'Învoire';
      case TimeOffType.MEDICAL:
        return 'Medical';
      case TimeOffType.ALTELE:
        return 'Altele';
      default:
        return type;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timp liber</h1>
          <p className="text-muted-foreground">
            Gestionați cererile de concediu și învoiri
          </p>
        </div>
        <Button asChild>
          <Link to="/timeoff/create">
            <Plus className="mr-2 h-4 w-4" />
            Cerere nouă
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Nu aveți cereri de timp liber
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/timeoff/create">
                <Plus className="mr-2 h-4 w-4" />
                Creează o cerere nouă
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{getTypeLabel(request.type)}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(request.startDate).toLocaleDateString('ro-RO')} - 
                      {new Date(request.endDate).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {request.startTime && request.endTime && (
                  <p className="text-sm text-muted-foreground">
                    Interval orar: {request.startTime} - {request.endTime}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Creat la: {new Date(request.createdAt).toLocaleDateString('ro-RO')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}