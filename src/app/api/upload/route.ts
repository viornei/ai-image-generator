import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { image } = await req.json();
        
        if (!image) {
            return NextResponse.json({ error: "Нет изображения для загрузки" }, { status: 400 });
        }

        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "ml_default");
        formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Ошибка Cloudinary: ${data.error?.message}`);
        }

        return NextResponse.json(data);
    }catch (error: unknown) {
        console.error("Ошибка загрузки в Cloudinary:", error);
    
        let errorMessage = "Ошибка сервера";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
    
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}    
