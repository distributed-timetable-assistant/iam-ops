FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

COPY . .
RUN printf 'nodeLinker: pnp\nenableGlobalCache: false\ncacheFolder: .yarn/berry/cache\n' > .yarnrc.yml
RUN corepack enable && yarn install --immutable
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/distributed-timetable-assistant/iam-ops

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
