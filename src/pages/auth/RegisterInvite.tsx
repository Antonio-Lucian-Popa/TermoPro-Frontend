import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { Role } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'Prenumele trebuie să aibă cel puțin 2 caractere' }),
  lastName: z.string().min(2, { message: 'Numele trebuie să aibă cel puțin 2 caractere' }),
  email: z.string().email({ message: 'Adresa de email invalidă' }).optional(),
  password: z.string().min(6, { message: 'Parola trebuie să aibă cel puțin 6 caractere' }),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Please select your role' }),
  }),
  companyId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterInvite() {
  const { registerWithInvite, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('token');
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  const [isInvited, setIsInvited] = useState(!!invitationToken);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [isRolePredefined, setIsRolePredefined] = useState(false);

  useEffect(() => {
    // In a real app, we would validate the token with an API call
    // and pre-fill the email from the invitation
    if (invitationToken) {
      const checkInvitation = async () => {
        try {
          const { used, employeeEmail, role, companyId } = await authService.validateInvitation(invitationToken);
          console.log("ClinicId: ", companyId)
          if (!used) {
            setIsInvited(true);
            setInvitedEmail(employeeEmail);
            form.setValue("email", employeeEmail);
            form.setValue("role", role);
            setIsRolePredefined(true); // 👈 indicăm că rolul e deja setat
            form.setValue("companyId", companyId);
          }
        } catch (error) {
          console.error('Invalid invitation token', error);
        }
      };
      checkInvitation();
    }
  }, [invitationToken]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyId: undefined,
    },
  });

  useEffect(() => {
    if (email) {
      form.setValue('email', email);
    }
  }, [email, form]);

  const onSubmit = async (values: FormValues) => {
    if (!invitationToken) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Token-ul de invitație lipsește.',
      });
      return;
    }

    clearError();

    try {
      await registerWithInvite({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || email,
        password: values.password,
      }, invitationToken);

      navigate('/login');
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (!tokenValid) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Link invalid</CardTitle>
          <CardDescription>
            Linkul de invitație nu este valid sau a expirat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/login">Înapoi la autentificare</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Finalizare invitație</CardTitle>
        <CardDescription>
          Completați datele pentru a vă alătura echipei
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prenume</FormLabel>
                    <FormControl>
                      <Input placeholder="Ion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume</FormLabel>
                    <FormControl>
                      <Input placeholder="Popescu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      value={invitedEmail}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parolă</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ?
                          <EyeOff className="h-4 w-4" /> :
                          <Eye className="h-4 w-4" />
                        }
                        <span className="sr-only">
                          {showPassword ? 'Ascunde parola' : 'Arată parola'}
                        </span>
                      </Button>
                    </div>
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
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserCog className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <Select onValueChange={field.onChange} value={field.value} disabled={isRolePredefined}>
                        <SelectTrigger className="w-full pl-10">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.OWNER}>Owner</SelectItem>
                          <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                          <SelectItem value={Role.OPERATOR}>Operator</SelectItem>
                          <SelectItem value={Role.TECHNICIAN}>Technician</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Se procesează...' : 'Finalizare înregistrare'}
            </Button>

            <div className="text-center text-sm">
              Ai deja cont?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Conectează-te
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}