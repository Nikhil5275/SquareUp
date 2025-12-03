import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, error };
        }
    };

    return {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };
};
