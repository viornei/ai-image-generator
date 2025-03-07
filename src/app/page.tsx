"use client";
import { useState } from "react";
import { Box, Button, Input, Image, Text, VStack, Spinner } from "@chakra-ui/react";

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt.trim()) {
            alert("Введите описание изображения!");
            return;
        }

        setLoading(true);
        setImageUrl("");

        try {
            console.log("Отправляем запрос с prompt:", prompt); // Логируем перед отправкой

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }) // ✅ Отправляем prompt
            });

            const data = await response.json();
            console.log("Ответ API:", data); // Логируем ответ

            if (data.image) {
                setImageUrl(data.image); // ✅ Устанавливаем изображение
            } else {
                alert("Ошибка генерации: " + (data.error || "Неизвестная ошибка"));
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert("Ошибка сети. Попробуйте снова.");
        }

        setLoading(false);
    };

    return (
        <VStack gap={6} p={8}>
            <Text fontSize="2xl" fontWeight="bold">AI Image Generator</Text>

            <Input
                placeholder="Введите описание изображения..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                size="lg"
            />

            <Button onClick={generateImage} colorScheme="blue" loading={loading}>
                Сгенерировать
            </Button>

            {loading && <Spinner size="xl" />}
            
            {imageUrl && (
                <Box mt={4}>
                    <Image src={imageUrl} alt="Сгенерированное изображение" borderRadius="md" />
                    <Button mt={2} onClick={() => window.open(imageUrl, "_blank")}>
                        Скачать
                    </Button>
                </Box>
            )}
        </VStack>
    );
}
