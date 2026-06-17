FROM node:22-alpine AS development

WORKDIR /workspace

COPY package.json package-lock.json* ./
COPY apps/api-server/package.json apps/api-server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm install

COPY . .

CMD ["npm", "run", "dev:docker", "--workspace", "@nmm/api-server"]
