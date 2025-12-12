import { LoginResponse, User, LoginCredentials } from '../types/auth.types';

const MOCK_USERS = {
  admin: {
    username: 'admin',
    password: 'Admin2024!',
    data: {
      id_usuario: 1,
      nombre_usuario: 'admin',
      rol: 'Admin' as const,
      email: 'admin@podoskin.mx',
      activo: true,
      clinica_id: 1,
      clinica_nombre: 'Podoskin Solutions/Libertad',
      last_login: new Date().toISOString(),
    }
  },
  podologo: {
    username: 'dr.ornelas',
    password: 'Podo2024!',
    data: {
      id_usuario: 2,
      nombre_usuario: 'dr.ornelas',
      rol: 'Podologo' as const,
      email: 'ornelas@podoskin.mx',
      activo: true,
      clinica_id: 1,
      clinica_nombre: 'Podoskin Solutions/Libertad',
      last_login: new Date().toISOString(),
    }
  },
  recepcionista: {
    username: 'recepcion',
    password: 'Recep2024!',
    data: {
      id_usuario: 3,
      nombre_usuario: 'recepcion',
      rol: 'Recepcion' as const,
      email: 'recepcion@podoskin.mx',
      activo: true,
      clinica_id: 1,
      clinica_nombre: 'Podoskin Solutions/Libertad',
      last_login: new Date().toISOString(),
    }
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authServiceMock = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    await delay(800);
    
    const userEntry = Object.values(MOCK_USERS).find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (!userEntry) {
      throw new Error('Credenciales inválidas');
    }
    
    const mockToken = `mock_jwt_${userEntry.data.id_usuario}_${Date.now()}`;
    
    return {
      access_token: mockToken,
      token_type: 'bearer',
      user: userEntry.data
    };
  },
  
  getUserContext: async (userId: number) => {
    await delay(300);
    
    return {
      is_first_time: false,
      user_name: MOCK_USERS.admin.username,
      summary: 'La última vez actualizaste un tratamiento',
      last_active: new Date().toISOString()
    };
  },
  
  logout: async (): Promise<void> => {
    await delay(300);
  }
};
