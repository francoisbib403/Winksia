FROM node:22.14.0

# Créer un répertoire pour l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json d'abord pour optimiser le cache
COPY package*.json ./

# Installer les dépendances avec l'option legacy-peer-deps pour éviter les conflits
RUN npm install --legacy-peer-deps

# Copier le reste des fichiers de l'application
COPY . .

# Compiler l'application
RUN npm run build

# Exposer le port utilisé par l'application
EXPOSE 8020

# Lancer l'application
CMD ["npm", "start"]