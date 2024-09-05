FROM node:16.10.0-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run ng build -- --base-href /ultra-concurrent-rl/

FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/ultra-concurrent-remote-lab/ /usr/share/nginx/html
