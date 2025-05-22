import { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';
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
import { TimeOffRequest, TimeOffStatus, TimeOffType } from '@/types';
import { timeOffService } from '@/services/timeoff.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function TimeOffRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.companyId) {
      loadPendingRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    if (!user?.companyId) return;

    try {
      const data = await timeOffService.getPendingTimeOffRequests(user.companyId);
      setRequests(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca cererile în așteptare.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!user?.keycloakId) return;

    try {
      await timeOffService.approveTimeOffRequest(requestId, user.keycloakId);
      setRequests(requests.filter(req => req.id !== requestId));
      toast({
        title: 'Succes',
        description: 'Cererea a fost aprobată.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut aproba cererea.',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user?.keycloakId) return;

    try {
      await timeOffService.rejectTimeOffRequest(requestId, user.keycloakId);
      setRequests(requests.filter(req => req.id !== requestId));
      toast({
        title: 'Succes',
        description: 'Cererea a fost respinsă.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut respinge cererea.',
      });
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cereri în așteptare</h1>
        <p className="text-muted-foreground">
          Gestionați cererile de timp liber ale angajaților
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Nu există cereri în așteptare
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {request.user.firstName} {request.user.lastName}
                </CardTitle>
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
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{getTypeLabel(request.type)}</p>
                    {request.startTime && request.endTime && (
                      <p className="text-sm text-muted-foreground">
                        Interval orar: {request.startTime} - {request.endTime}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Aprobă
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <X className="mr-2 h-4 w-4" />
                          Respinge
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmați respingerea</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sunteți sigur că doriți să respingeți această cerere?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleReject(request.id)}
                          >
                            Respinge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}