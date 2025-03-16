"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { Button, Input, VStack, Avatar, Text, Flex } from "@chakra-ui/react";
import { supabase } from "@/utils/supabaseClient";
import { User } from "@/hooks/useAuth"; 
import { toaster } from "@/components/ui/toaster";

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
     const [loading, setLoading] = useState(false); 
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
                localStorage.setItem("negativePrompt", userData.default_negative_prompt || "");

            }
        };

        fetchUser();
    }, [router]);
useEffect(() => {
    if (user) {
        localStorage.setItem("negativePrompt", negativePrompt);
    }
}, [negativePrompt]);

    const updateProfile = async () => {
    if (!user) return;

    if (!displayName.trim()) {
        toaster.create({
            title: "Ошибка!",
            description: "Имя не может быть пустым.",
            type: "error",
        });
        return;
    }

    setLoading(true);

    try {
        const { error } = await supabase
            .from("users")
            .update({
                display_name: displayName.trim(),
                default_negative_prompt: negativePrompt.trim(),
                avatar_url: avatarUrl,
            })
            .eq("id", user.id);

        if (error) {
            console.error("Ошибка обновления профиля:", error.message);
            toaster.create({
                title: "Ошибка!",
                description: "Не удалось обновить профиль.",
                type: "error",
            });
            return;
        }

        toaster.create({
            title: "Успех!",
            description: "Данные профиля обновлены.",
            type: "success",
        });

        localStorage.setItem("negativePrompt", negativePrompt);

    } catch (error) {
        console.error("Ошибка при обновлении профиля:", error);
        toaster.create({
            title: "Ошибка!",
            description: "Что-то пошло не так. Попробуйте снова.",
            type: "error",
        });
    } finally {
        setLoading(false);
    }
};


    if (!user) return <Text>Загрузка...</Text>;

    return (
        <Flex width="100%" justify='center'>
        <VStack gap={4} p={6} width="100%"  maxWidth="600px"> 
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
            <Button onClick={updateProfile} colorScheme="blue"  loading={loading}>
                Сохранить
            </Button>
            <Button onClick={() => router.push("/")} colorScheme="gray">
                Назад
            </Button>
            </VStack>
            </Flex>
    );
}
