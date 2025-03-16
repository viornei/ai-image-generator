"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabaseClient";

export type HistoryItem = {
    id: number;
    prompt: string;
    negative_prompt: string;
    imageUrl: string;
    created_at: string;
    user_id: string;
};

export default function useHistory(userId: string | null) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (userId) {
            loadHistory(userId);
        }
    }, [userId]);

    const loadHistory = async (userId: string) => {
        const { data, error } = await supabase
            .from("history")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (!error) {
            setHistory(data as HistoryItem[]);
        }
    };

    const saveToHistory = async (
        userId: string,
        prompt: string,
        negative_prompt: string,
        imageUrl: string,
    ) => {
        if (!userId || !prompt || !imageUrl) return;

        const { error } = await supabase.from("history").insert([
            {
                user_id: userId,
                prompt,
                negative_prompt,
                imageUrl,
                created_at: new Date().toISOString(),
            },
        ]);

        if (!error) {
            loadHistory(userId);
        }
    };

    return { history, loadHistory, saveToHistory };
}
