// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { SessionProvider } from "@ory/elements-react/client"
import { getLogoutFlow, getServerSession } from "@ory/nextjs/app"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Ory Next.js App router Example",
}

export default async function RootLayout() {
    const session = await getServerSession()
    const traits = session?.identity?.traits as {
        email: string
        username: string
        phone: string
    }

    return (
        <SessionProvider session={session}>
            <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Image src="/logo.svg" alt="Ory Logo" width={160} height={160} priority />
                    <h1 className="font-bold text-xl">Ory Next.js App Router Example</h1>
                    {!session && (
                        <div className="flex items-center gap-2 bg-white rounded-sm border flex-col w-60 p-3">
                            <Link
                                className="underline block w-full"
                                href="/registration"
                            >
                                Registration
                            </Link>
                            <Link className="underline block w-full" href="/login">
                                Login
                            </Link>
                            <Link className="underline block w-full" href="/recovery">
                                Account Recovery
                            </Link>
                            <Link
                                className="underline block w-full"
                                href="/verification"
                            >
                                Account Verification
                            </Link>
                        </div>
                    )}
                    {session && (
                        <div className="flex items-center gap-2 bg-white rounded-sm border flex-col w-60 p-3">
                            <h2 className="w-full">
                                Hi, {traits.email ?? traits.username ?? traits.phone}!
                            </h2>
                            <Link className="underline block w-full" href="/settings">
                                Settings
                            </Link>
                            <LogoutLink />
                        </div>
                    )}
                    <div className="flex gap-2 text-sm">
                        <a
                            href="https://github.com/ory/elements/tree/master/examples/nextjs-pages-router"
                            className="underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            App Router Example
                        </a>
                        <a
                            href="https://github.com/ory/elements/tree/master/examples/nextjs-pages-router"
                            className="underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Page Router Example
                        </a>
                    </div>
                </div>
            </div>
        </SessionProvider>
    )
}

async function LogoutLink() {
    const flow = await getLogoutFlow({})

    return (
        <Link className="underline block w-full" href={flow.logout_url}>
            Logout
        </Link>
    )
}
