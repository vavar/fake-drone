#!/usr/bin/env bash

projects=$(ls -d */)

for project in ${projects}
do
    cd ${project}
    rm -rf node_modules
    npm i
    cd ..
done