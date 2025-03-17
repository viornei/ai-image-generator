"use client";
import { toaster } from "@/components/ui/toaster";

export async function generateImage(
    prompt: string,
    negativePrompt: string | null,
    userId: string | null,
    saveToHistory: (
        userId: string,
        prompt: string,
        negative_prompt: string,
        imageUrl: string,
    ) => Promise<void>,
    setImageUrl: (url: string) => void,
    setLoading: (loading: boolean) => void,
) {
    if (!prompt.trim()) {
        toaster.create({
            title: "Ошибка",
            description: "Введите описание изображения",
            type: "error",
        });
        return;
    }
    if (!userId) {
        toaster.create({
            title: "Ошибка",
            description: "Войдите, чтобы использовать генератор",
            type: "error",
        });
        return;
    }

    setLoading(true);
    setImageUrl("");

    const finalNegativePrompt = negativePrompt?.trim()
        ? negativePrompt
        : "worst quality, low quality";

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                negative_prompt: finalNegativePrompt,
            }),
        });

        const data = await response.json();

        if (data.image) {
            setImageUrl(data.image);
            await saveToHistory(
                userId,
                prompt,
                finalNegativePrompt,
                data.image,
            );
        } else {
            toaster.create({
                title: "Ошибка генерации",
                description: data.error || "Неизвестная ошибка",
            });
        }
    } catch {
        toaster.create({
            title: "Ошибка сети",
            description: "Попробуйте снова",
        });
    }

    setLoading(false);
}
