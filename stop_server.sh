#! /bin/bash 

echo "Stopping server..."
./server/node_modules/forever/bin/forever stopall
echo "Stopping gdb containers..."
docker ps | grep gdb | cut -f1 -d" " | xargs docker kill
