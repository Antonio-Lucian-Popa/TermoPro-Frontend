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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { TaskType } from '@/types';
import { taskService } from '@/services/task.service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(3, 'Titlul trebuie să aibă cel puțin 3 caractere'),
  description: z.string().min(10, 'Descrierea trebuie să aibă cel puțin 10 caractere'),
  taskType: z.nativeEnum(TaskType),
  scheduledDate: z.string().min(1, 'Data programată este obligatorie'),
  userId: z.string().optional(),
  teamId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      taskType: TaskType.MONTARE,
      scheduledDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.companyId) return;

    setLoading(true);
    try {
      await taskService.createTask({
        ...values,
        companyId: user.companyId,
        assignedBy: user.id,
      });

      toast({
        title: 'Succes',
        description: 'Sarcina a fost creată cu succes.',
      });
      navigate('/tasks');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu am putut crea sarcina.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creare sarcină nouă</h1>
        <p className="text-muted-foreground">
          Completați detaliile pentru a crea o sarcină nouă
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii sarcină</CardTitle>
          <CardDescription>
            Introduceți informațiile necesare pentru sarcină
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titlu</FormLabel>
                    <FormControl>
                      <Input placeholder="Montaj ferestre" {...field} />
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
                      <Textarea 
                        placeholder="Descrieți detaliile sarcinii..."
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
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tip sarcină</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați tipul sarcinii" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskType).map((type) => (
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
                  {loading ? 'Se creează...' : 'Creează sarcină'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tasks')}
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