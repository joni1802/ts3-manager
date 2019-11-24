# Doc for development

## Start backend
```
npm run dev
```
It uses the environment variables SECRET and PORT to start the server.

## Generate executables
The package pkg from zeit is used for creating 3 executables (Mac, Windows and Linux).
```
npm install pkg -g
```
The following will generate the executables:
```
pkg .
```
It uses the bin and pkg properties inside the package.json to create the executables.
