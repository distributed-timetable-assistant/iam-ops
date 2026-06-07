// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { createOryMiddleware } from "@ory/nextjs/middleware"
import oryConfig from "@/ory.config"

// This function can be marked `async` if using `await` inside
export const proxy = createOryMiddleware(oryConfig)

// See "Matching Paths" below to learn more
export const config = {}
