"use client"

import dynamic from "next/dynamic"
import { type RecoveryFlow } from "@ory/client-fetch"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

const Recovery = dynamic(() => import("@/components/ory-recovery"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="recovery" />,
})

export default function OryRecoveryFlow({ flow }: { flow: RecoveryFlow }) {
    return (
        <Recovery
            flow={flow}
            config={config}
            components={{ Card: {} }}
        />
    )
}
