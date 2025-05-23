import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme/theme-provider';
import AppRoutes from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="termopan-theme">
      <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;