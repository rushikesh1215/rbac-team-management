
FROM node:slim AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:slim AS final

WORKDIR /app


COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma


COPY .env .env



EXPOSE 3000

CMD ["node", "server.js"]