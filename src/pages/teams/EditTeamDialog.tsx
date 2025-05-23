/* eslint-disable @typescript-eslint/no-unused-vars */
// components/team/EditTeamDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Team } from '@/types';
import { teamService } from '@/services/team.service';

interface EditTeamDialogProps {
  team: Team;
  requesterId: string;
  onUpdated?: (updatedTeam: Team) => void;
}

export default function EditTeamDialog({ team, requesterId, onUpdated }: EditTeamDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const updated = await teamService.updateTeam(team.id, {
        name,
        requesterId,
      });
      toast({ title: 'Echipă actualizată cu succes' });
      setOpen(false);
      onUpdated?.(updated);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Nu s-a putut actualiza echipa.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Modifică</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modificare echipă</DialogTitle>
        </DialogHeader>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nume echipă"
        />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anulează
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
