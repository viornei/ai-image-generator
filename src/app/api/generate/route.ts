import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

// Обрабатываем POST-запрос
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 },
            );
        }

        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) {
            console.error("Ошибка: API-ключ отсутствует!");
            return NextResponse.json(
                { error: "API key is missing" },
                { status: 500 },
            );
        }

        // Подключаемся к Replicate API
        const replicate = new Replicate({ auth: apiKey });

        console.log("Отправляем запрос в Replicate...");

        // Отправляем запрос на генерацию изображения
        const prediction = await replicate.predictions.create({
            version:
                "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
            input: {
                prompt,
                width: 512,
                height: 512,
                num_outputs: 1,
            },
        });

        console.log("Ждем завершения генерации...");

        // Ждем завершения обработки
        let result = prediction;
        while (result.status !== "succeeded" && result.status !== "failed") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            result = await replicate.predictions.get(prediction.id);
            console.log("Текущий статус:", result.status);
        }

        // Если генерация завершилась с ошибкой
        if (result.status === "failed") {
            return NextResponse.json(
                { error: "Image generation failed" },
                { status: 500 },
            );
        }

        // Получаем URL изображения
        const imageUrl = result.output ? result.output[0] : null;
        if (!imageUrl) {
            return NextResponse.json(
                { error: "No image URL returned" },
                { status: 500 },
            );
        }

        console.log("Генерация завершена! URL изображения:", imageUrl);

        return NextResponse.json({ image: imageUrl }, { status: 200 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Ошибка сервера:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 },
        );
    }
}
