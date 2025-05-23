/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Team, Role, User } from '@/types';
import { teamService } from '@/services/team.service';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { companyService } from '@/services/company.service';


export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');


  useEffect(() => {
    if (teamId) {
      loadTeamDetails();
    }
  }, [teamId]);

  const loadAvailableUsers = async () => {
    try {
      const companyUsers = await companyService.getCompanyUsers(team!.companyId); // Creează acest endpoint dacă nu-l ai
      const nonMembers = companyUsers.filter(
        (u) => !members.some((m) => m.id === u.id)
      );
      setAvailableUsers(nonMembers);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca utilizatorii disponibili.',
      });
    }
  };


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
      await teamService.removeUserFromTeam(teamId, userId, user!.id);
      setMembers(members.filter(member => member.id !== userId));
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
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={loadAvailableUsers}>
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Adaugă membru
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă membru în echipă</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="user">Selectează un utilizator</Label>
                <Select onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alege un utilizator" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  disabled={!selectedUserId}
                  onClick={async () => {
                    try {
                      await teamService.addUserToTeam(team!.id, selectedUserId, user!.id);
                      toast({ title: 'Succes', description: 'Membrul a fost adăugat.' });
                      setShowDialog(false);
                      loadTeamDetails(); // reîncarcă membrii
                    } catch {
                      toast({ variant: 'destructive', title: 'Eroare', description: 'Adăugarea a eșuat.' });
                    }
                  }}
                >
                  Adaugă
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
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
                                onClick={() => handleRemoveMember(member.id)}
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