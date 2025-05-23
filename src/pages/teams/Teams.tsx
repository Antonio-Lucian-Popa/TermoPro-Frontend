/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Role, Team } from '@/types';
import { teamService } from '@/services/team.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EditTeamDialog from './EditTeamDialog';

export default function Teams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const canManageTeam = user?.role === Role.OWNER || user?.role === Role.MANAGER;

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const data = await teamService.getCompanyTeams(user.companyId);
      setTeams(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca echipele.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Echipe</h1>
          <p className="text-muted-foreground">
            Gestionați echipele și membrii acestora
          </p>
        </div>
        <Button asChild>
          <Link to="/teams/create">
            <Plus className="mr-2 h-4 w-4" />
            Echipă nouă
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Nu există echipe create încă
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/teams/create">
                <Plus className="mr-2 h-4 w-4" />
                Creează prima echipă
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="relative group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {team.name}
                </CardTitle>
                <CardDescription>
                  Creată la {new Date(team.createdAt).toLocaleDateString('ro-RO')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <Link to={`/teams/${team.id}`} className="underline hover:text-primary">
                    Vezi detalii și membri
                  </Link>
                </p>
              </CardContent>

              {canManageTeam && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                  <EditTeamDialog
                    team={team}
                    requesterId={user?.id ?? ''}
                    onUpdated={(updated) => setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))} // sau reîncarcă datele
                  />


                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">Șterge</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmă ștergerea</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sigur vrei să ștergi echipa <strong>{team.name}</strong>? Această acțiune este ireversibilă.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              if (!user) return;
                              await teamService.deleteTeam(team.id, user.id);
                              toast({
                                title: 'Echipă ștearsă',
                                description: `Echipa ${team.name} a fost ștearsă.`,
                              });
                              setTeams((prev) => prev.filter((t) => t.id !== team.id));
                            } catch (error) {
                              toast({
                                variant: 'destructive',
                                title: 'Eroare la ștergere',
                                description: 'Nu s-a putut șterge echipa.',
                              });
                            }
                          }}
                        >
                          Șterge
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </Card>
          ))}

        </div>
      )}
    </div>
  );
}