"use client"

import dynamic from "next/dynamic"
import { type RegistrationFlow } from "@ory/client-fetch"

import config from "@/ory.config"
import { AuthFlowLoading } from "@/components/auth-flow-shell"

const Registration = dynamic(() => import("@/components/ory-registration"), {
    ssr: false,
    loading: () => <AuthFlowLoading label="registration" />,
})

export default function OryRegistrationFlow({ flow }: { flow: RegistrationFlow }) {
    return (
        <Registration
            flow={flow}
            config={config}
            components={{ Card: {} }}
        />
    )
}
