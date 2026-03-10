FROM node:20.20.1
WORKDIR /uno-front-end
COPY . .
RUN npm ci
EXPOSE 5173
ENTRYPOINT ["npm", "run", "dev", "--", "--host"]