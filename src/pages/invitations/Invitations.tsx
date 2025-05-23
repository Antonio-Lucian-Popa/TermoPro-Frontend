/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/company.service';
import { Invitation, Role } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const formSchema = z.object({
  employeeEmail: z.string().email('Adresa de email invalidă'),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Selectați un rol valid' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Invitations() {
  const { companyId } = useParams<{ companyId: string }>();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeEmail: '',
      role: Role.TECHNICIAN,
    },
  });

  useEffect(() => {
    if (companyId) {
      loadInvitations();
    }
  }, [companyId]);

  const loadInvitations = async () => {
    if (!companyId) return;

    try {
      const data = await companyService.getCompanyInvitations(companyId);
      setInvitations(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca invitațiile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!companyId) return;

    try {
      const newInvitation = await companyService.createInvitation({
        employeeEmail: values.employeeEmail,
        role: values.role,
        companyId,
      });

      setInvitations([newInvitation, ...invitations]);
      setDialogOpen(false);
      form.reset();

      toast({
        title: 'Succes',
        description: 'Invitația a fost trimisă cu succes.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut trimite invitația.',
      });
    }
  };

  const handleDelete = async (invitationId: string) => {
    try {
      await companyService.deleteInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      toast({
        title: 'Succes',
        description: 'Invitația a fost ștearsă.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut șterge invitația.',
      });
    }
  };

  const handleResend = async (invitation: Invitation) => {
    try {
      const newInvitation = await companyService.createInvitation({
        employeeEmail: invitation.employeeEmail,
        role: invitation.role,
        companyId: invitation.companyId,
      });

      setInvitations(invs => [
        newInvitation,
        ...invs.filter(inv => inv.id !== invitation.id)
      ]);

      toast({
        title: 'Succes',
        description: 'Invitația a fost retrimisă.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut retrimite invitația.',
      });
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.OWNER:
        return 'Administrator';
      case Role.MANAGER:
        return 'Manager';
      case Role.TECHNICIAN:
        return 'Tehnician';
      case Role.OPERATOR:
        return 'Operator';
      default:
        return role;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invitații</h1>
          <p className="text-muted-foreground">
            Gestionați invitațiile pentru angajați noi
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invitație nouă
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trimite invitație nouă</DialogTitle>
              <DialogDescription>
                Completați detaliile pentru a trimite o invitație nouă
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employeeEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email angajat</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="nume@firma.ro" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectați rolul" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Role).filter(role => role !== Role.OWNER).map((role) => (
                            <SelectItem key={role} value={role}>
                              {getRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Trimite invitație</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitații active</CardTitle>
          <CardDescription>
            Gestionați invitațiile în așteptare
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nu există invitații active
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Data trimiterii</TableHead>
                  <TableHead>Expiră la</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {invitation.employeeEmail}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleLabel(invitation.role)}</TableCell>
                    <TableCell>
                      {new Date(invitation.createdAt).toLocaleDateString('ro-RO')}
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.expiresAt).toLocaleDateString('ro-RO')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        invitation.used 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {invitation.used ? 'Folosită' : 'În așteptare'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!invitation.used && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResend(invitation)}
                          >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Retrimite</span>
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Șterge</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmați ștergerea
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Sunteți sigur că doriți să ștergeți această invitație?
                                {!invitation.used && ' Invitația nu va mai putea fi folosită.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(invitation.id)}
                              >
                                Șterge
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
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