FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl ca-certificates

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Copy static assets into standalone output
RUN cp -r .next/static .next/standalone/.next/static && \
    cp -r public .next/standalone/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]
