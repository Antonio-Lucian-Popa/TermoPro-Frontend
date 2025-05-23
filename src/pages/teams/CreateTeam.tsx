import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { teamService } from '@/services/team.service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string()
    .min(3, 'Numele echipei trebuie să aibă cel puțin 3 caractere')
    .max(50, 'Numele echipei nu poate depăși 50 de caractere'),
  description: z.string()
    .min(10, 'Descrierea trebuie să aibă cel puțin 10 caractere')
    .max(500, 'Descrierea nu poate depăși 500 de caractere'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateTeam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.companyId) return;

    setLoading(true);
    try {
      await teamService.createTeam({
        name: values.name,
        companyId: user.companyId,
      });

      toast({
        title: 'Succes',
        description: 'Echipa a fost creată cu succes.',
      });
      navigate('/teams');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut crea echipa. Vă rugăm să încercați din nou.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creare echipă nouă</h1>
        <p className="text-muted-foreground">
          Completați detaliile pentru a crea o echipă nouă
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <div>
              <CardTitle>Detalii echipă</CardTitle>
              <CardDescription>
                Introduceți informațiile necesare pentru echipă
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume echipă</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Echipa Montaj Nord" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descriere</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Descrieți rolul și responsabilitățile echipei" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Se creează...' : 'Creează echipă'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/teams')}
                >
                  Anulează
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}