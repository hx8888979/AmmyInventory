#!/bin/sh
set -e
rm -r ./build || true
mkdir -p ./build
cp -r ./src/* ./build
pip3 install -r requirements.txt -t ./build
cd ./build
zip -r9 build.zip .
