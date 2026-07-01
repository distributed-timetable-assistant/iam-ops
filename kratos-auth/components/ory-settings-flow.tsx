"use client"

import dynamic from "next/dynamic"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

import { coerceOryDates } from "@/app/hydra/_lib/browser-flow"

const Settings = dynamic(() => import("@/components/ory-settings"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="settings" />,
})

export default function OrySettingsFlow({ flow }: { flow: unknown }) {
    return (
        <Settings
            flow={coerceOryDates(flow) as never}
            config={config}
            components={{
                Card: {},
            }}
        />
    )
}
