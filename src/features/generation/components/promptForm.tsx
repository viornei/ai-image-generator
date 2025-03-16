"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, VStack, Text } from "@chakra-ui/react";
import { generateImage } from "@/features/generation/generateImage";

interface PromptFormProps {
    userId: string | null;
    defaultNegativePrompt: string | null;
    saveToHistory: (userId: string, prompt: string, negative_prompt: string, imageUrl: string) => Promise<void>;
    setImageUrl: React.Dispatch<React.SetStateAction<string>>;
}

export default function PromptForm({ userId, defaultNegativePrompt, saveToHistory, setImageUrl }: PromptFormProps) {
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("worst quality, low quality");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (defaultNegativePrompt) {
            setNegativePrompt(defaultNegativePrompt);
        }
    }, [defaultNegativePrompt]);

    return (
        <VStack gap={6} width="100%" maxWidth="600px">
            <Text fontSize="2xl" fontWeight="bold">AI Image Generator</Text>
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
                onClick={() => generateImage(prompt, negativePrompt, userId, saveToHistory, setImageUrl, setLoading)}
                colorScheme="blue"
                loading={loading}
            >
                Сгенерировать
            </Button>
        </VStack>
    );
}
