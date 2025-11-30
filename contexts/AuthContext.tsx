import React, { createContext, useState, useEffect } from 'react';
import { type User, type Hospital, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Session, AuthError } from '@supabase/supabase-js';

// Helper to extract a string message from an unknown error type
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        return (error as any).message;
    }
    if (typeof error === 'string') {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return 'An unknown error occurred.';
    }
};


interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  registerHospital: (details: {
      hospitalDetails: Omit<Hospital, 'id' | 'status'>;
      adminDetails: { first_name: string; last_name: string; email: string; password: string};
  }) => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async (session: Session | null) => {
        if (session) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", getErrorMessage(error));
                setUser(null);
                setHospital(null);
            } else if (profile) {
                const { data: hospitalData, error: hospitalError } = await supabase
                    .from('hospitals')
                    .select('*')
                    .eq('id', profile.hospital_id)
                    .single();
                
                setUser({ ...profile, email: session.user.email ?? '' });
                setHospital(hospitalData || null);
                if (hospitalError) console.error("Error fetching hospital:", getErrorMessage(hospitalError));
            }
        } else {
            setUser(null);
            setHospital(null);
        }
        setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      getSession(session);
    });
    
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      getSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHospital(null);
  };

  const registerHospital = async (details: {
      hospitalDetails: Omit<Hospital, 'id' | 'status'>;
      adminDetails: { first_name: string; last_name: string, email: string; password: string};
  }): Promise<string | null> => {
    try {
        // 1. Create the hospital
        const { data: newHospital, error: hospitalError } = await supabase
            .from('hospitals')
            .insert({ ...details.hospitalDetails, status: 'PENDING' })
            .select()
            .single();
        
        if (hospitalError) {
            console.error("Error creating hospital:", getErrorMessage(hospitalError));
            if (hospitalError.code === '23505' && hospitalError.message.includes('license_number')) {
                return "This medical license number is already registered. Please use a different one.";
            }
            return getErrorMessage(hospitalError);
        }
        
        if (!newHospital) {
            return "Could not create hospital record. Please try again.";
        }

        // 2. Sign up the admin user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: details.adminDetails.email,
            password: details.adminDetails.password,
            options: {
                data: {
                    first_name: details.adminDetails.first_name,
                    last_name: details.adminDetails.last_name,
                    hospital_id: newHospital.id,
                    roles: [UserRole.Admin],
                    department: 'Administration',
                    phone: details.hospitalDetails.phone,
                }
            }
        });

        if (authError) {
            console.error("Error signing up admin:", getErrorMessage(authError));
            // Attempt to delete the hospital we just created to clean up
            await supabase.from('hospitals').delete().eq('id', newHospital.id);
            return getErrorMessage(authError);
        }
        
        return null;
    } catch (err) {
        console.error("An unexpected error occurred during registration:", getErrorMessage(err));
        return `Registration failed: ${getErrorMessage(err)}`;
    }
  }

  return (
    <AuthContext.Provider value={{ user, hospital, loading, login, logout, registerHospital }}>
      {children}
    </AuthContext.Provider>
  );
};