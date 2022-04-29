# Angular Project: Hello World

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.4. With the purpose to practice deploy the app in a k8s or OpenShift cluster.

## External Config

We can externalize config using `src/config.json` file. To be able to use this file, we need to add the next properties in the `tsconfig.json` under **compilerOptions** section:
```
   "resolveJsonModule": true,
   "esModuleInterop": true,
   "allowSyntheticDefaultImports": true,
```

> **NOTE:** check the `src/app/app.component.ts` and `src/app/app.component.html` to know how to use the ENV VARS.

## Multi-stage build containers

See the next Dockerfile to see how to do a chained build:
```
FROM node:14
ENV JQ_VERSION=1.6
RUN wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 -O /tmp/jq-linux64
RUN cp /tmp/jq-linux64 /usr/bin/jq
RUN chmod +x /usr/bin/jq
WORKDIR /app
COPY . .
RUN jq 'to_entries | map_values({ (.key) : ("$" + .key) }) | reduce .[] as $item ({}; . + $item)' ./src/config.json > ./src/config.tmp.json && mv ./src/config.tmp.json ./src/config.json
RUN npm install && npm run build

FROM nginx:1.17
ENV JSFOLDER=/usr/share/nginx/html/*.js
COPY ./start-nginx.sh /usr/bin/start-nginx.sh
RUN chmod +x /usr/bin/start-nginx.sh
WORKDIR /usr/share/nginx/html
COPY --from=0 /app/dist/*/ .

ENTRYPOINT [ "start-nginx.sh" ]
```

The content of `start-nginx.sh` is the next one:
```bash
#!/usr/bin/env bash
export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
for file in $JSFOLDER;
do
  cat $file | envsubst $EXISTING_VARS | tee $file
done
nginx -g 'daemon off;'
```

## Build and Run the container

To build your Angular app and run a container with the new environments variables, run the next commands:
```bash
$ docker build -t frontend .
$ docker run -d -p 8080:80 --rm --name frontend -e ENV1=value1 -e ENV2=value2 frontend
```

> **NOTE:** the ENV1 and ENV2 variables should match with ones in the `src/config.json` file.
