"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { Button, Input, VStack, Avatar, Text } from "@chakra-ui/react";
import { supabase } from "@/utils/supabaseClient";
import { User } from "../page";

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const router = useRouter();
   useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                console.error("Ошибка получения пользователя:", error?.message);
                router.push("/");
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user.id)
                .single();

            if (userError) {
                console.error("Ошибка загрузки данных профиля:", userError.message);
            } else {
                setUser(userData);
                setDisplayName(userData.display_name || "");
                setNegativePrompt(userData.default_negative_prompt || "");
                setAvatarUrl(userData.avatar_url || data.user.user_metadata.avatar_url || "");
            }
        };

        fetchUser();
    }, [router]);

    const updateProfile = async () => {
        if (!user) return;
        const { error } = await supabase
            .from("users")
            .update({
                display_name: displayName,
                default_negative_prompt: negativePrompt,
                avatar_url: avatarUrl,
            })
            .eq("id", user.id);

        if (error) {
            console.error("Ошибка обновления профиля:", error.message);
        } else {
            alert("Данные обновлены!");
        }
    };

    if (!user) return <Text>Загрузка...</Text>;

    return (
        <VStack gap={4} p={6}>
            <Avatar.Root size="xl">
                <Avatar.Fallback name={displayName} />
                <Avatar.Image src={avatarUrl}  />
            </Avatar.Root>
            <Text fontSize="xl">Редактировать профиль</Text>
            <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Имя"
            />
            <Input
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Негативный промт"
            />
            <Button onClick={updateProfile} colorScheme="blue">
                Сохранить
            </Button>
            <Button onClick={() => router.push("/")} colorScheme="gray">
                Назад
            </Button>
        </VStack>
    );
}
