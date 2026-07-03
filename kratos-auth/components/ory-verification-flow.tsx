"use client"

import dynamic from "next/dynamic"
import { type VerificationFlow } from "@ory/client-fetch"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

const Verification = dynamic(() => import("@/components/ory-verification"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="verification" />,
})

export default function OryVerificationFlow({ flow }: { flow: VerificationFlow }) {
    return (
        <Verification
            flow={flow}
            config={config}
            components={{ Card: {} }}
        />
    )
}
