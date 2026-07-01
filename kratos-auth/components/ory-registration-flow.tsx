"use client"

import dynamic from "next/dynamic"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

import { coerceOryDates } from "@/app/hydra/_lib/browser-flow"

const Registration = dynamic(() => import("@/components/ory-registration"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="registration" />,
})

export default function OryRegistrationFlow({ flow }: { flow: unknown }) {
    return (
        <Registration
            flow={coerceOryDates(flow) as never}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
