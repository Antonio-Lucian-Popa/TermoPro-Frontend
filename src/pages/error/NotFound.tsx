import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-extrabold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Pagină negăsită</h2>
      <p className="mb-8 text-muted-foreground max-w-md">
        Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)}>Înapoi</Button>
        <Button variant="outline" onClick={() => navigate('/')}>
          Acasă
        </Button>
      </div>
    </div>
  );
}