FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm config set fetch-retries 5 \
	&& npm config set fetch-retry-factor 2 \
	&& npm config set fetch-retry-mintimeout 10000 \
	&& npm config set fetch-retry-maxtimeout 120000 \
	&& npm config set fetch-timeout 600000 \
	&& npm config set registry https://registry.npmjs.org/ \
	&& npm ci --omit=dev --no-audit --no-fund \
	&& npm cache clean --force

COPY . .

ARG PORT=8002
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["node", "index.js"]