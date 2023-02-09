# BUILD
FROM node:18.13.0-alpine as build
WORKDIR /build
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . .
RUN npm run build

# APP
FROM node:18.13.0-alpine as app
WORKDIR /app
COPY --from=build /build/dist/ ./
CMD ["node", "app.js"]
