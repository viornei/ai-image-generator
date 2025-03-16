"use client";
import { useEffect, useState } from "react";
import { supabase, redirectURI } from "@/utils/supabaseClient";
import { toaster } from "@/components/ui/toaster";

export type User = {
    id: string;
    email: string;
    display_name?: string;
    default_negative_prompt?: string;
    avatar_url?: string;
};

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data?.user) {
                setUser(null);
                setLoading(false);
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user.id)
                .single();

            if (userError || !userData) {
                setUser(null);
            } else {
                setUser(userData);
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const signIn = async (provider: "google" | "discord") => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: redirectURI },
        });

        if (error) {
            toaster.create({
                title: "Ошибка входа",
                description: `Не удалось войти через ${provider}.`,
            });
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            window.location.reload();
        } catch {
            toaster.create({
                title: "Ошибка выхода",
                description: "Произошла ошибка при выходе. Попробуйте снова.",
            });
        }
    };

    return { user, loading, signIn, signOut };
}
