declare module '#auth-utils' {
  interface User {
    id: number;
    email: string;
    name: string;
    // Add your own fields
  }

  interface UserSession {
    id: number;
    email: string;
    name: string;
    // Add your own fields
  }

  interface SecureSessionData {
    id: number;
    email: string;
    name: string;
  }
}

export {}