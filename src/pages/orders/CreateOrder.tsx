import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/order.service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  clientName: z.string().min(3, 'Numele clientului trebuie să aibă cel puțin 3 caractere'),
  clientPhone: z.string().min(10, 'Numărul de telefon trebuie să aibă cel puțin 10 caractere'),
  clientAddress: z.string().min(10, 'Adresa trebuie să aibă cel puțin 10 caractere'),
  scheduledDate: z.string().min(1, 'Data programată este obligatorie'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  teamId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      scheduledDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.companyId) return;

    setLoading(true);
    try {
      await orderService.createOrder({
        ...values,
        companyId: user.companyId,
      });

      toast({
        title: 'Succes',
        description: 'Comanda a fost creată cu succes.',
      });
      navigate('/orders');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut crea comanda.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creare comandă nouă</h1>
        <p className="text-muted-foreground">
          Completați detaliile pentru a crea o comandă nouă
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii comandă</CardTitle>
          <CardDescription>
            Introduceți informațiile necesare pentru comandă
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nume client</FormLabel>
                    <FormControl>
                      <Input placeholder="Ion Popescu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon client</FormLabel>
                    <FormControl>
                      <Input placeholder="0712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresă client</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Str. Exemplu nr. 1, Bloc A1, Scara 1, Ap. 1, Oraș"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data programată</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Se creează...' : 'Creează comandă'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/orders')}
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