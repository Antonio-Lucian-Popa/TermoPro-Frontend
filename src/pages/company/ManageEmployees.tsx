import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Role } from '@/types';
import { companyService } from '@/services/company.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ManageEmployees() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, [companyId]);

  const loadEmployees = async () => {
    if (!companyId) return;
    
    try {
      const users = await companyService.getCompanyUsers(companyId);
      setEmployees(users);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut încărca lista de angajați.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (userId: string) => {
    if (!companyId) return;
    
    try {
      await companyService.removeUserFromCompany(companyId, userId);
      setEmployees(employees.filter(emp => emp.id !== userId));
      toast({
        title: 'Succes',
        description: 'Angajatul a fost eliminat din firmă.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut elimina angajatul.',
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionare angajați</h1>
        <p className="text-muted-foreground">
          Vizualizați și gestionați angajații firmei
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Angajați</CardTitle>
          <CardDescription>
            Lista completă a angajaților din firmă
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nu există angajați în firmă
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{getRoleLabel(employee.role)}</TableCell>
                    <TableCell className="text-right">
                      {currentUser?.role === Role.OWNER && employee.role !== Role.OWNER && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Elimină
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmați eliminarea
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Sunteți sigur că doriți să eliminați acest angajat din firmă?
                                Această acțiune nu poate fi anulată.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveEmployee(employee.id)}
                              >
                                Elimină
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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