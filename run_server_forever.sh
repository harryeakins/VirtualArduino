#! /bin/bash 
set -e

./server/node_modules/forever/bin/forever start server/index.js
