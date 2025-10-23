#!/bin/bash

rm -rf docs

yarn build

mv build docs

git add docs

git commit -m "Updated build: $(git rev-parse HEAD | cut -c-6)"
