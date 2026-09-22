import { useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user] = useState<User>({
    id: 'admin-1',
    name: 'CLYX Admin',
    email: 'admin@clyxmedia.com',
    role: 'admin',
  });

  return {
    user,
    loading: false,
    isAuthenticated: true,
    logout: () => {},
  };
}
