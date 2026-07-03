"use client"

import dynamic from "next/dynamic"
import { type SettingsFlow } from "@ory/client-fetch"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

const Settings = dynamic(() => import("@/components/ory-settings"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="settings" />,
})

export default function OrySettingsFlow({ flow }: { flow: SettingsFlow }) {
    return (
        <Settings
            flow={flow}
            config={config}
            components={{ Card: {} }}
        />
    )
}
