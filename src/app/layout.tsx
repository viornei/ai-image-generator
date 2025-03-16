"use client"; 
import React from "react";

import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Provider>{children}  <Toaster/></Provider>
            </body>
        </html>
    );
}
