// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { PropsWithChildren } from "react"

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 pb-8">
            <div className="w-full max-w-md">{children}</div>
        </main>
    )
}

