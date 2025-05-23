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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { TimeOffType } from '@/types';
import { timeOffService } from '@/services/timeoff.service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  type: z.nativeEnum(TimeOffType),
  startDate: z.string().min(1, 'Data de început este obligatorie'),
  endDate: z.string().min(1, 'Data de sfârșit este obligatorie'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'Data de sfârșit trebuie să fie după data de început',
  path: ['endDate'],
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateTimeOff() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: TimeOffType.CONCEDIU,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      await timeOffService.createTimeOffRequest({
        ...values,
        userId: user.id,
        companyId: user.companyId,
      });

      toast({
        title: 'Succes',
        description: 'Cererea a fost creată cu succes.',
      });
      navigate('/timeoff');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut crea cererea.',
      });
    } finally {
      setLoading(false);
    }
  };

  const watchType = form.watch('type');
  const showTimeFields = watchType === TimeOffType.INVOIERE;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cerere timp liber</h1>
        <p className="text-muted-foreground">
          Completați detaliile pentru a crea o nouă cerere
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii cerere</CardTitle>
          <CardDescription>
            Introduceți informațiile necesare pentru cerere
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tip cerere</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați tipul cererii" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TimeOffType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data început</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data sfârșit</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showTimeFields && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ora început</FormLabel>
                        <FormControl>
                          <Input type="time" {...field}  className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ora sfârșit</FormLabel>
                        <FormControl>
                          <Input type="time" {...field}  className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Se creează...' : 'Creează cerere'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/timeoff')}
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