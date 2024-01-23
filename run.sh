#!/bin/bash

while true
do
  trap 'npm run start' EXIT
  npm run start
done