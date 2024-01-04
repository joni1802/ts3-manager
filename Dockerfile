# package local-echo needs git for installation
# alpine image of node does not have git installed
FROM node:18 AS build

# create the directory "app" inside the docker image and set it to the default directory
WORKDIR /app

# copy the files into the workdir (node_modules are excluded by ignore file)
COPY . .

ENV UI_DIR ./packages/ui

# download all the packages for the ui and build app for production with minification
RUN npm install --prefix ${UI_DIR} && npm run --prefix ${UI_DIR} build


FROM node:lts-alpine

# the webserver will look for the environment variable "PORT"
# otherwise the default port is hard coded as 3000
ENV PORT 8080

# set directory for frontend and backend
ENV SERVER_DIR ./packages/server

ENV NODE_ENV=production

WORKDIR /app

# only copy the relevant dist and backend files
COPY --from=build /app/packages/ui/dist ./packages/ui/dist
COPY ./packages/server ./packages/server

# download all the packages for the backend
RUN npm install --prefix ${SERVER_DIR}

# the webserver port
EXPOSE ${PORT}

# starts the webserver (backend)
# info: in the exec form it is not possible to access environment variables
CMD ["npm", "start", "--prefix", "./packages/server"]
