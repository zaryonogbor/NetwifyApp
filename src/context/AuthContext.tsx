import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<User>;
    signOut: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            } else {
                setUserProfile(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserProfile(null);
        }
    };

    const refreshUserProfile = async () => {
        if (user) {
            await fetchUserProfile(user.uid);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchUserProfile(currentUser.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string): Promise<User> => {
        console.log('Firebase createUserWithEmailAndPassword called for:', email);
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Firebase signup success for UID:', credential.user.uid);
        return credential.user;
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
