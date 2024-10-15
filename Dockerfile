FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

EXPOSE 8081
WORKDIR /app
COPY web .
RUN apk --no-cache add --no-check-certificate ca-certificates \
    && update-ca-certificates
RUN apk add --no-cache git openssh
RUN yarn
RUN cd frontend && yarn && yarn run build
CMD ["yarn", "run", "serve"]
