FROM node:18-alpine

EXPOSE 8081
WORKDIR /app
COPY web .
RUN yarn
RUN cd frontend && yarn && yarn run build
CMD ["yarn", "run", "serve"]
