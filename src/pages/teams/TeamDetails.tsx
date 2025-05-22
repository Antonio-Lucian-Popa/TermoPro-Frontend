import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Team, TeamMember, Role } from '@/types';
import { teamService } from '@/services/team.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadTeamDetails();
    }
  }, [teamId]);

  const loadTeamDetails = async () => {
    if (!teamId) return;

    try {
      const [teamData, membersData] = await Promise.all([
        teamService.getTeamDetails(teamId),
        teamService.getTeamMembers(teamId),
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca detaliile echipei.',
      });
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!teamId) return;

    try {
      await teamService.removeUserFromTeam(teamId, userId);
      setMembers(members.filter(member => member.userId !== userId));
      toast({
        title: 'Succes',
        description: 'Membrul a fost eliminat din echipă.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut elimina membrul din echipă.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!team) {
    return null;
  }

  const canManageTeam = user?.role === Role.OWNER || user?.role === Role.MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">
            Gestionați membrii echipei
          </p>
        </div>
        {canManageTeam && (
          <Button asChild>
            <UserPlus className="mr-2 h-4 w-4" />
            Adaugă membru
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membri echipă</CardTitle>
          <CardDescription>
            Lista completă a membrilor din echipă
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nu există membri în această echipă
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  {canManageTeam && <TableHead className="text-right">Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell>
                      {member.user.firstName} {member.user.lastName}
                    </TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>{member.user.role}</TableCell>
                    {canManageTeam && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmați eliminarea
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Sunteți sigur că doriți să eliminați acest membru din echipă?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.userId)}
                              >
                                Elimină
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}