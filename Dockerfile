FROM node:22-alpine

WORKDIR /app

# لا توجد تبعيات خارجية في هذا المشروع.
COPY package.json server.mjs ./
COPY src ./src
COPY scripts ./scripts
COPY site ./site

RUN node scripts/build.mjs && npm run check

ENV NODE_ENV=production

USER node
EXPOSE 3000

CMD ["node", "server.mjs"]
