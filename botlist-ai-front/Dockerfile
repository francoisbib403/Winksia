# Étape 1: Build l'application
FROM node:18-alpine AS builder

WORKDIR /app

# Copie uniquement les fichiers nécessaires au cache des dépendances
COPY package.json package-lock.json ./

# Installation complète des dépendances
RUN npm ci --prefer-offline

# Copie du reste des fichiers
COPY . .

# Build de l'application
RUN npm run build

# Étape 2: Runner
FROM node:18-alpine AS runner

WORKDIR /app

# Copie les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "start"]