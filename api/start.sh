#!/bin/sh
node /app/bin/www &
nginx -g 'daemon off;'
