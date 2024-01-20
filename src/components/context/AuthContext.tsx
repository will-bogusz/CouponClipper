import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
  token: string;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = retrieveUserFromStorage();
    if (storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
  }, []);

  const login = (userData: User) => {
    storeUserInStorage(userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    clearUserFromStorage();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

function retrieveUserFromStorage(): User | null {
  const userDataString = Cookies.get('authData');
  if (userDataString) {
    return JSON.parse(userDataString);
  }
  return null;
}

function storeUserInStorage(userData: User): void {
  Cookies.set('authData', JSON.stringify(userData), { expires: 7 }); // Expires in 7 days
}

function clearUserFromStorage(): void {
  Cookies.remove('authData');
}
