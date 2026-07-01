// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import "@ory/elements-react/theme/styles.css"
import "./globals.css"
import React, { ReactNode } from "react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.className} min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased`}
            >
                {children}
            </body>
        </html>
    )
}
