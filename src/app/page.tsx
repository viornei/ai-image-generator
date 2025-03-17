"use client";
import React from "react";
import {
    VStack,
    Flex,
    HStack,
    Button,
    Text,
    Box,
    Image,
    Link,
    Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import useAuth from "@/features/auth/hooks/useAuth";
import useHistory from "@/features/history/hooks/useHistory";
import PromptForm from "@/features/generation/components/promptForm";
import History from "@/features/history/components/history";
import { motion } from "framer-motion";
export default function Home() {
    const router = useRouter();
    const { user, signIn, signOut, loading } = useAuth();
    const { history, saveToHistory } = useHistory(user?.id ?? null);
    const [imageUrl, setImageUrl] = React.useState("");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Flex width="100%" justify="center">
                <VStack gap={8} p={4} width="100%" mt={2}>
                    {loading ? (
                        <Spinner size="lg" color="blue.500" />
                    ) : user ? (
                        <Flex
                            direction="row"
                            justify="space-between"
                            width="100%"
                            gap={2}
                        >
                            <VStack
                                textAlign="left"
                                align="flex-start"
                                gap={1}
                                fontSize={["sm", "md"]}
                            >
                                <Text>Вы вошли как:</Text>
                                <Text>{user.email}</Text>
                            </VStack>
                            <HStack gap={3}>
                                <Button onClick={() => router.push("/profile")}>
                                    Профиль
                                </Button>
                                <Button onClick={signOut} colorScheme="red">
                                    Выйти
                                </Button>
                            </HStack>
                        </Flex>
                    ) : (
                        <HStack gap={3}>
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
                        </HStack>
                    )}

                    <PromptForm
                        userId={user?.id ?? null}
                        defaultNegativePrompt={
                            user?.default_negative_prompt ??
                            "worst quality, low quality"
                        }
                        saveToHistory={saveToHistory}
                        setImageUrl={setImageUrl}
                    />
                    {imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box textAlign="center">
                                <Image
                                    src={imageUrl}
                                    alt="Сгенерированное изображение"
                                    borderRadius="md"
                                    boxShadow="lg"
                                />
                                <Link
                                    mt={6}
                                    colorScheme="blue"
                                    href={imageUrl}
                                    download="generated_image.png"
                                    target="_blank"
                                >
                                    <Button colorScheme="blue">
                                        Скачать изображение
                                    </Button>{" "}
                                </Link>
                            </Box>
                        </motion.div>
                    )}

                    <History history={history} />
                </VStack>
            </Flex>
        </motion.div>
    );
}
