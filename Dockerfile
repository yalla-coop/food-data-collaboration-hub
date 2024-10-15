FROM node:18-alpine3.19

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

EXPOSE 8081
WORKDIR /app
COPY web .
RUN yarn
RUN cd frontend && yarn && yarn run build
CMD ["yarn", "run", "serve"]
