FROM node:19-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

EXPOSE 8081
WORKDIR /app
COPY web .
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN yarn
RUN cd frontend && yarn && yarn run build
CMD ["yarn", "run", "serve"]
