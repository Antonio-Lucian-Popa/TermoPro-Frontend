/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { User, Team } from '@/types';

import { teamService } from '@/services/team.service';
import { useAuth } from '@/context/AuthContext';
import { companyService } from '@/services/company.service';

interface AssignToProps {
  control: any;
  setValue: any;
  watch: any;
}

export default function AssignToFields({ control, setValue }: AssignToProps) {
  const { user } = useAuth();
  const [assignmentType, setAssignmentType] = useState<'user' | 'team'>('user');
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!user?.companyId) return;

    if (assignmentType === 'user') {
      companyService.getCompanyUsers(user.companyId).then(setUsers);
    } else {
      teamService.getCompanyTeams(user.companyId).then(setTeams);
    }
  }, [assignmentType, user?.companyId]);

  useEffect(() => {
    // Clear previously selected field when changing assignment type
    setValue('userId', undefined);
    setValue('teamId', undefined);
  }, [assignmentType, setValue]);

  return (
    <>
      <FormField
        control={control}
        name="assignmentType"
        render={() => (
          <FormItem>
            <FormLabel>Asignează către</FormLabel>
            <Select value={assignmentType} onValueChange={(value) => setAssignmentType(value as 'user' | 'team')}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Alege tipul de asignare" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="user">Angajat</SelectItem>
                <SelectItem value="team">Echipă</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {assignmentType === 'user' && (
        <FormField
          control={control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selectează angajat</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează un angajat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {assignmentType === 'team' && (
        <FormField
          control={control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selectează echipa</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează o echipă" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
