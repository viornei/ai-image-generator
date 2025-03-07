import Replicate from "replicate";

export async function POST(req) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
        }

        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) {
            console.error("Ошибка: API-ключ отсутствует!");
            return new Response(JSON.stringify({ error: "API key is missing" }), { status: 500 });
        }

        // Подключаемся к Replicate API
        const replicate = new Replicate({
            auth: apiKey,
        });

        console.log("Отправляем запрос в Replicate...");

        // Отправляем запрос на генерацию изображения
        const prediction = await replicate.predictions.create({
            version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637", // Актуальная версия
            input: {
                prompt: prompt,
                width: 512,
                height: 512,
                num_outputs: 1
            }
        });

        console.log("Ждем завершения генерации...");

        // Ждем завершения обработки
        let result = prediction;
        while (result.status !== "succeeded" && result.status !== "failed") {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Ждать 2 секунды
            result = await replicate.predictions.get(prediction.id);
            console.log("Текущий статус:", result.status);
        }

        // Если генерация завершилась с ошибкой
        if (result.status === "failed") {
            return new Response(JSON.stringify({ error: "Image generation failed" }), { status: 500 });
        }

        // Получаем URL изображения
        const imageUrl = result.output ? result.output[0] : null;
        if (!imageUrl) {
            return new Response(JSON.stringify({ error: "No image URL returned" }), { status: 500 });
        }

        console.log("Генерация завершена! URL изображения:", imageUrl);

        return new Response(JSON.stringify({ image: imageUrl }), { status: 200 });

    } catch (error) {
        console.error("Ошибка сервера:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
    }
}
