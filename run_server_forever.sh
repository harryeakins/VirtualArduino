#! /bin/bash 
set -e

./server/node_modules/forever/bin/forever start -l server.log server/index.js
