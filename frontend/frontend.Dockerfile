FROM node:18-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
COPY config/.env ./
RUN npm ci

COPY frontend/ .

RUN npm run build

EXPOSE 3349

CMD ["npm", "run", "frontend"]
# CMD ["serve", "-s", "dist", "-l", "3000"]
# CMD ["npm", "run", "dev", "--", "--host"]