
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    username: 'patient1',
    email: 'patient@example.com',
    role: UserRole.PATIENT,
    name: 'John Patient',
    avatar: '',
  },
  {
    id: '2',
    username: 'doctor1',
    email: 'doctor@example.com',
    role: UserRole.DOCTOR,
    name: 'Dr. Sarah Smith',
    avatar: '',
  },
  {
    id: '3',
    username: 'engineer1',
    email: 'engineer@example.com',
    role: UserRole.ENGINEER,
    name: 'Mike Engineer',
    avatar: '',
  },
  {
    id: '4',
    username: 'researcher1',
    email: 'researcher@example.com',
    role: UserRole.RESEARCHER,
    name: 'Dr. Alan Researcher',
    avatar: '',
  },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user data in local storage
    const savedUser = localStorage.getItem('aidoHealthUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user data');
        localStorage.removeItem('aidoHealthUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by email
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('User not found');
      }
      
      // If role is specified, check if it matches
      if (role && foundUser.role !== role) {
        throw new Error(`This email is registered with a different role. Please log in as ${foundUser.role}`);
      }
      
      // Password validation would happen here in a real app
      
      // Set user in state and local storage
      setUser(foundUser);
      localStorage.setItem('aidoHealthUser', JSON.stringify(foundUser));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aidoHealthUser');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email is already in use
      if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        username: userData.email.split('@')[0],
        email: userData.email,
        role: userData.role,
        name: userData.name,
        avatar: '',
      };
      
      // In a real app, we would add the user to the database here
      mockUsers.push(newUser);
      
      // Log in the new user
      setUser(newUser);
      localStorage.setItem('aidoHealthUser', JSON.stringify(newUser));
      
      toast({
        title: "Registration Successful",
        description: `Welcome to AidoHealth, ${newUser.name}!`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
