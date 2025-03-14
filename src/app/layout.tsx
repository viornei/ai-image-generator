"use client"; // Next.js 13+ требует "use client" для клиентских компонентов
import React from "react";

import { Provider } from "@/components/ui/provider";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
