"use client"

import dynamic from "next/dynamic"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

import { coerceOryDates } from "@/app/hydra/_lib/browser-flow"

const Recovery = dynamic(() => import("@/components/ory-recovery"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="recovery" />,
})

export default function OryRecoveryFlow({ flow }: { flow: unknown }) {
    return (
        <Recovery
            flow={coerceOryDates(flow) as never}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
