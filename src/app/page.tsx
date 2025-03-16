"use client";
import React from "react";
import { VStack, Flex, HStack, Button, Text, Box, Image, Link } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useHistory from "@/hooks/useHistory";
import PromptForm from "@/components/promptForm";
import History from "@/components/history";

export default function Home() {
    const router = useRouter();
    const { user, signIn, signOut } = useAuth();
    const { history, saveToHistory } = useHistory(user?.id ?? null);
    const [imageUrl, setImageUrl] = React.useState(""); 

    return (
        <Flex width="100vw">
            <VStack gap={8} p={6} width="100%">
                {user ? (
                    <Flex direction="row" justify="space-between" width="100%">
                        <Text>Вы вошли как: {user.email}</Text>
                        <HStack gap={3}>
                            <Button onClick={() => router.push("/profile")}>Профиль</Button>
                            <Button onClick={signOut} colorScheme="red">Выйти</Button>
                        </HStack>
                    </Flex>
                ) : (
                        <HStack gap={3}>
                            <Button onClick={() => signIn("google")} colorScheme="blue">Войти через Google</Button>
                            <Button onClick={() => signIn("discord")} colorScheme="purple">Войти через Discord</Button>
                        </HStack>
                )}
                
                <PromptForm 
                    userId={user?.id ?? null} 
                    defaultNegativePrompt={user?.default_negative_prompt ?? "worst quality, low quality"} 
                    saveToHistory={saveToHistory} 
                    setImageUrl={setImageUrl} 
                />
                
                {imageUrl && (
                    <Box textAlign="center" mt={4}>
                        <Image src={imageUrl} alt="Сгенерированное изображение" borderRadius="md" boxShadow="lg" />
                        <Link
                            mt={6}
                            colorScheme="blue"
                            href={imageUrl}
                            download="generated_image.png"
                            target="_blank">
                            <Button colorScheme="blue">Скачать изображение</Button>    </Link>
                    </Box>
                )}
                
                <History history={history} />
            </VStack>
        </Flex>
    );
}
