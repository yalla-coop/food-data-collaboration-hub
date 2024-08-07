FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

EXPOSE 8081
WORKDIR /app
COPY web .
RUN yarn
RUN cd frontend && yarn && yarn run build
RUN yarn global add pm2
CMD ["pm2-runtime", "yarn run serve", "--error", "~/hub.log", "--output", "~/hub.log"]
