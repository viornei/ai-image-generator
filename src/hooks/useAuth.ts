"use client";
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { redirectURI, supabase } from "@/shared/lib/supabaseClient";

export type User = {
    id: string;
    email: string;
    display_name?: string;
    default_negative_prompt?: string;
    avatar_url?: string;
};

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data?.user || !data.user.email) {
                setUser(null);
                setLoading(false);
                return;
            }

            const userData = await fetchOrCreateUser({
                id: data.user.id,
                email: data.user.email,
            });

            setUser(userData);
            setLoading(false);
        };

        fetchUser();
    }, []);

    const fetchOrCreateUser = async (user: { id: string; email: string }) => {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error && error.code !== "PGRST116") { 
            
            console.error("Ошибка загрузки данных пользователя:", error.message);
            return null; 
            
        }

        if (!data) {
            console.warn("Пользователь не найден в таблице, создаём нового...");
            console.log("Создаём пользователя:", {
    id: user.id,
    email: user.email,
    display_name: user.email.split("@")[0],
    avatar_url: "",
    default_negative_prompt: "worst quality, low quality",
});
            const { error: insertError } = await supabase.from("users").insert({
                id: user.id,
                email: user.email,
                display_name: user.email.split("@")[0],
                avatar_url: "",
                default_negative_prompt: "worst quality, low quality",
            });

            if (insertError) {
                console.error("Ошибка при создании пользователя:", insertError.message);
                return null;
            }

            return {
                ...user,
                email: user.email,
                display_name: user.email.split("@")[0],
                avatar_url: "",
                default_negative_prompt: "worst quality, low quality",
            };
        }

        return data;
    };

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