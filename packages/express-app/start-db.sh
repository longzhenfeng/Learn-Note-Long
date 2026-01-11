#!/bin/bash
mkdir -p ./mongodb-data
mongod --dbpath ./mongodb-data --port 27017 --bind_ip 127.0.0.1 &
echo "MongoDB started in background"
