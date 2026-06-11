#!/bin/bash

echo "🧹 Cleaning React cache..."
rm -rf client/node_modules/.cache
rm -rf client/.eslintcache
rm -rf client/build

echo "🚀 Starting clean React development server..."
cd client && npm start