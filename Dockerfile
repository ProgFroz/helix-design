# helix-design Storybook: build the static site with Node, serve it with Caddy.
# Railway builds this file from the repo root; see docs/deploy.md.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY .storybook ./.storybook
COPY stories ./stories
COPY src ./src
COPY dist ./dist
RUN npm run build-storybook

FROM caddy:2-alpine
# Railway injects PORT; 8080 is the fallback. SITE_ROOT is read by deploy/Caddyfile.
ENV PORT=8080 \
    SITE_ROOT=/srv
RUN addgroup -S storybook && adduser -S -G storybook storybook \
 && chown -R storybook:storybook /data /config
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/storybook-static /srv
USER storybook
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["sh", "-c", "wget -qO- http://127.0.0.1:${PORT:-8080}/ >/dev/null || exit 1"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
