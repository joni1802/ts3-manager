FROM node:lts

# the webserver will look for the environment variable "PORT"
# otherwise the default port is hard coded as 3000
ENV PORT 8080

# set directory for frontend and backend
ENV BACKEND_DIR ./backend
ENV FRONTEND_DIR ./frontend

# create the directory "app" inside the docker image and set it to the default directory
WORKDIR /app

# copy the files into the workdir (node_modules are excluded by ignore file)
COPY . .

# download all the packages for the backend
RUN npm --prefix ${BACKEND_DIR} install ${BACKEND_DIR}

# download all the packages for the frontend and build app for production with minification
RUN npm --prefix ${FRONTEND_DIR} install ${FRONTEND_DIR} && npm run build --prefix ${FRONTEND_DIR}

# the webserver port
EXPOSE ${PORT}

# starts the webserver (backend)
# info: in the exec form it is not possible to access environment variables
CMD ["npm", "start", "--prefix", "./backend"]
