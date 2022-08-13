#!/bin/bash
rm public/*.js
tsc src/*.ts --outDir public
tsc src/client.ts --outDir public --target es2017 --moduleResolution node
