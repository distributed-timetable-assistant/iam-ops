"use client"

import dynamic from "next/dynamic"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

import { coerceOryDates } from "@/app/hydra/_lib/browser-flow"

const Verification = dynamic(() => import("@/components/ory-verification"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="verification" />,
})

export default function OryVerificationFlow({ flow }: { flow: unknown }) {
    return (
        <Verification
            flow={coerceOryDates(flow) as never}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
