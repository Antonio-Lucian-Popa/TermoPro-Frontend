import { Outlet } from 'react-router-dom';
import { AppWindowIcon as WindowIcon } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - branding */}
      <div className="bg-primary text-primary-foreground md:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto text-center">
          <WindowIcon className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Termopan Manager</h1>
          <p className="text-lg opacity-90">
            Soluția completă pentru managementul afacerii tale de termopane
          </p>
        </div>
      </div>
      
      {/* Right side - auth forms */}
      <div className="md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}