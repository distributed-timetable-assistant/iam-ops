// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import type { OryClientConfiguration } from "@ory/elements-react"

const config: OryClientConfiguration = {
    intl: {
        locale: "en",
        customTranslations: {
            en: {
                "login.title": "Sign in to DiTA",
                "login.subtitle": "Welcome back to the Distributed Timetable Assistant",
                "login.registration-button": "Create account",
                "login.registration-label": "New to DiTA?",
                "login.forgot-password": "Forgot password?",
                "login.logout-label": "Something's not working?",
                "login.subtitle-oauth2": "Authenticate to access {clientName}",
                "registration.title": "Create your DiTA account",
                "registration.subtitle": "Join the Distributed Timetable Assistant",
                "registration.login-button": "Sign in",
                "registration.login-label": "Already have an account?",
                "recovery.title": "Reset your password",
                "recovery.subtitle": "Enter your email to receive a recovery code",
                "recovery.login-button": "Sign in",
                "recovery.login-label": "Remember your password?",
                "verification.title": "Verify your email",
                "verification.subtitle": "Enter the email address associated with your account",
                "settings.title": "Account Settings",
                "settings.subtitle": "Manage your DiTA account",
                "settings.subtitle-instructions": "Update your profile, password, and security settings.",
                "settings.title-profile": "Profile",
                "settings.title-password": "Password",
                "settings.navigation-profile": "Profile",
                "settings.navigation-password": "Password",
                "settings.navigation-oidc": "Connected Accounts",
            },
        },
    },
    project: {
        default_redirect_url: "/",
        error_ui_url: "/auth/error",
        name: "DiTA",
        registration_enabled: true,
        verification_enabled: true,
        recovery_enabled: true,
        registration_ui_url: "/auth/registration",
        verification_ui_url: "/auth/verification",
        recovery_ui_url: "/auth/recovery",
        login_ui_url: "/auth/login",
        settings_ui_url: "/auth/settings",
        default_locale: "en",
        enabled_locales: ["en"],
        translations: [],
        locale_behavior: "11184809",
    },
}

export default config
