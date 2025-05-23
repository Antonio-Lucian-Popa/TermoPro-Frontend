/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, User } from '@/types';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<User>;
  registerWithInvite: (userData: Partial<User> & { password: string }, token: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface TokenPayload {
  sub: string; // UUID-ul userului (keycloakId)
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('user');
    
    if (accessToken && refreshToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          ...parsedUser,
          accessToken,
          refreshToken
        });
      } catch (err) {
        // Invalid user data in localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { access_token, refresh_token } = await authService.login(email, password);
      
      // Get user details using the keycloakId
      // decode jwt token to get keycloakId
      const tokenData: TokenPayload = jwtDecode(access_token);
      console.log("Decoded token data:", tokenData);
      const keycloakId = tokenData.sub;
      const userDetails = await authService.getUserByKeycloakId(keycloakId);
      
      const authUser: AuthUser = {
        ...userDetails,
        accessToken: access_token,
        refreshToken: refresh_token,
      };
      
      setUser(authUser);
      
      // Save to localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userDetails));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userDetails.firstName}!`,
      });
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const createdUser = await authService.register(userData);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });

      return createdUser;
    } catch (err) {
      setError("Registration failed. Please try again.");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Could not create your account. Please try again.",
      });
      throw err; // Re-throw the error to ensure the caller is aware of the failure
    } finally {
      setLoading(false);
    }
  };

  const registerWithInvite = async (userData: Partial<User> & { password: string }, token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.registerWithInvite(userData, token);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
    } catch (err) {
      setError("Registration failed. Please try again.");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Could not create your account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        registerWithInvite,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};