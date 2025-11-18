import { supabase } from '../supabase';
import type { Database } from '../types/database';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function signUpUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'analyst'
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No user data returned');
    }

    const { error: dbError } = await supabase.from('users').insert({
      user_id: data.user.id,
      email,
      name,
      role,
      password_hash: '', // Password is handled by Supabase Auth
    });

    if (dbError) throw dbError;

    return {
      user: {
        id: data.user.id,
        email,
        name,
        role,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Failed to sign up user',
    };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No user data returned');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (userError) throw userError;

    if (!userData) {
      throw new Error('User record not found');
    }

    // Only admins can login
    if (userData.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Only administrators can login');
    }

    return {
      user: {
        id: userData.user_id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Failed to sign in',
    };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to get current user:', error);
      return null;
    }

    return {
      id: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // Only admins can create users
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only administrators can create users');
    }

    return signUpUser(email, password, name, role);
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

export async function listUsers(): Promise<{
  users: (Database['public']['Tables']['users']['Row'])[] | null;
  error: string | null;
}> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only administrators can list users');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { users: data, error: null };
  } catch (error) {
    return {
      users: null,
      error: error instanceof Error ? error.message : 'Failed to list users',
    };
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<Database['public']['Tables']['users']['Row'], 'user_id'>>
): Promise<{ error: string | null }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only administrators can update users');
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

export async function deleteUser(userId: string): Promise<{ error: string | null }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only administrators can delete users');
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}
