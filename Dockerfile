FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

EXPOSE 8081
WORKDIR /app
COPY web .
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN ssh-keyscan github.com >> /etc/ssh/known_hosts
RUN yarn
RUN cd frontend && yarn && yarn run build
CMD ["yarn", "run", "serve"]
