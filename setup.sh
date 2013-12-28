#! /bin/bash

echo "Creating log directories and setting permissions"
mkdir -p /var/log/virtual-arduino
chown -R ubuntu:ubuntu /var/log/virtual-arduino
chmod -R g+rwx /var/log/virtual-arduino
chmod -R g+s /var/log/virtual-arduino

NODE_VERSION=`node --version`

if [ "$?" -ne "0" -o "${NODE_VERSION:0:5}" != "v0.10" ] 
then
  echo "Installing node..."
  wget "http://nodejs.org/dist/v0.10.24/node-v0.10.24-linux-x64.tar.gz" -O /tmp/node.tar.gz
  tar  --strip-components 1 -zxvf /tmp/node.tar.gz -C /usr/local
fi

echo "Installing server module"

cd server && npm install
