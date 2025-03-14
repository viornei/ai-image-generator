"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Input,
    Image,
    Text,
    VStack,
    SimpleGrid,
    Flex,
    HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import supabase from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

type HistoryItem = {
    id: number;
    prompt: string;
    negative_prompt: string;
    imageUrl: string;
    created_at: string;
    user_id: string;
};

export type User = {
    id: string;
    email: string;
    display_name?: string;
    default_negative_prompt?: string;
    avatar_url?: string;
};

export default function Home() {
     const router = useRouter(); 
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState(
        "worst quality, low quality",
    );
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
    const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();

     if (error || !data?.user) {
        console.warn("Пользователь не авторизован"); 
        setUser(null);
        return;
    }

        const user = { id: data.user.id, email: data.user.email! };
        setUser(user);
        await fetchOrCreateUser(user);
        loadHistory(user.id);
    };
    fetchUser();
}, []);


    const generateImage = async () => {
        if (!prompt.trim()) {
            alert("Введите описание изображения!");
            return;
        }
        if (!user) {
            alert("Войдите, чтобы использовать генератор!");
            return;
        }

        setLoading(true);
        setImageUrl("");

        try {
            console.log(
                "Отправляем запрос с prompt:",
                prompt,
                "и negative_prompt:",
                negativePrompt,
            );

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    negative_prompt: negativePrompt,
                }),
            });

            const data = await response.json();
            console.log("Ответ API:", data);

            if (data.image) {
                await uploadToCloudinary(data.image);
            } else {
                alert(
                    "Ошибка генерации: " + (data.error || "Неизвестная ошибка"),
                );
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert("Ошибка сети. Попробуйте снова.");
        }

        setLoading(false);
    };

    const uploadToCloudinary = async (imageUrl: string) => {
        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageUrl }),
            });

            const data = await response.json();

            if (data.secure_url) {
                setImageUrl(data.secure_url);
                console.log(
                    "Изображение загружено в Cloudinary:",
                    data.secure_url,
                );

                await saveToHistory(
                    user!.id,
                    prompt,
                    negativePrompt,
                    data.secure_url,
                );
                await loadHistory(user!.id);
            } else {
                alert("Ошибка загрузки в Cloudinary");
            }
        } catch (error) {
            console.error("Ошибка при загрузке в Cloudinary:", error);
        }
    };

    const saveToHistory = async (
        userId: string,
        prompt: string,
        negative_prompt: string,
        imageUrl: string,
    ) => {
        if (!userId || !prompt || !imageUrl) return;

        const { error } = await supabase
            .from("history")
            .insert([
                {
                    user_id: userId,
                    prompt,
                    negative_prompt,
                    imageUrl,
                    created_at: new Date().toISOString(),
                },
            ]);

        if (error) {
            console.error("Ошибка сохранения в Supabase:", error.message);
        } else {
            console.log("История сохранена в Supabase!");
        }
    };

    const loadHistory = async (userId: string) => {
        const { data, error } = await supabase
            .from("history")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Ошибка загрузки истории:", error.message);
        } else {
            setHistory(data as HistoryItem[]);
        }
    };

    const signIn = async (provider: "google" | "discord") => {
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error)
            console.error(`Ошибка входа через ${provider}:`, error.message);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setHistory([]);
        window.location.reload();
    };
    const fetchOrCreateUser = async (user: { id: string; email: string }) => {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();
        if (error && error.code === "PGRST116") {
            // Если пользователя нет, создаем нового
            const { error: insertError } = await supabase.from("users").insert({
                id: user.id,
                email: user.email,
                display_name: user.email.split("@")[0], // По умолчанию имя = email без @
                avatar_url: "",
                default_negative_prompt: "worst quality, low quality",
            });

            if (insertError) {
                console.error(
                    "Ошибка создания пользователя:",
                    insertError.message,
                );
            }
        } else if (!error) {
            // Если пользователь уже есть — загружаем его данные
            setUser({
                id: data.id,
                email: data.email,
                display_name: data.display_name,
                avatar_url: data.avatar_url,
                default_negative_prompt: data.default_negative_prompt,
            });
        }
    };

    return (
        <Flex width="100vw">
            <VStack gap={10} p={6} width='100%'>
                {user ? (
                    <>
                        <Flex direction="row" justify="space-between"  width="100%">
                            <Flex direction="column">
                                <Text>Вы вошли как:</Text>
                                <Text>{user.email}</Text>
                            </Flex>
                            <HStack gap={3}>
                                <Button onClick={() => router.push("/profile")}>
                                    Профиль
                                </Button>
                                <Button onClick={signOut} colorScheme="red">
                                    Выйти
                                </Button>
                            </HStack>
                        </Flex>
                    </>
                ) : (
                       <Flex direction="row" justify='flex-end' gap={6} width="100%">
                           <Button
                                onClick={() => signIn("google")}
                                colorScheme="blue"
                            >
                                Войти через Google
                            </Button>
                            <Button
                                onClick={() => signIn("discord")}
                                colorScheme="purple"
                            >
                                Войти через Discord
                            </Button>
                        </Flex> 
                )}
                <Flex  direction='column' align='center' width="50%" gap={6}>
                <Text fontSize="2xl" fontWeight="bold">
                    AI Image Generator
                </Text>
                <Input
                    placeholder="Введите описание изображения..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    size="lg"
                />
                <Input
                    placeholder="Введите негативный промт..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    size="lg"
                />

                <Button
                    onClick={generateImage}
                    colorScheme="blue"
                    loading={loading}
                >
                    Сгенерировать
                    </Button>
                    </Flex>
                {loading && (
                    <Box textAlign="center" mt={4}>
                        <Text
                            mt={2}
                            fontSize="lg"
                            fontWeight="bold"
                            color="gray.500"
                        >
                            AI думает...
                        </Text>
                    </Box>
                )}

                {imageUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <Box mt={4} textAlign="center">
                            <Image
                                src={imageUrl}
                                alt="Сгенерированное изображение"
                                borderRadius="md"
                                boxShadow="lg"
                            />
                            <Button
                                mt={2}
                                onClick={() => window.open(imageUrl, "_blank")}
                            >
                                Скачать
                            </Button>
                        </Box>
                    </motion.div>
                )}

                <Text fontSize="xl" fontWeight="bold">
                    История генераций:
                </Text>
                {history.length > 0 ? (
                    <SimpleGrid columns={[1, 2, 3, 4]} gap={4} mt={4}>
                        {history.map((item, index) => (
                            <Box
                                key={index}
                                p={4}
                                borderWidth="1px"
                                borderRadius="lg"
                            >
                                <Text fontWeight="bold">
                                    Промт: {item.prompt}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    Негативный промт: {item.negative_prompt}
                                </Text>
                                <Image
                                    src={item.imageUrl}
                                    alt="Сгенерированное изображение"
                                    borderRadius="md"
                                    boxSize="150px"
                                />
                            </Box>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Text color="gray.500">История пока пуста</Text>
                )}
            </VStack>
        </Flex>
    );
}
