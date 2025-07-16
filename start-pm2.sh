#!/bin/bash

green='\033[0;32m' # Green
reset='\033[0m'    # Reset color

mkdir -p logs

echo -e "${green}Deleting old PM2 processes...${reset}"
pnpm pm2:stop

echo -e "${green}Building application...${reset}"
VITE_API_URL=http://172.23.50.2:8080 pnpm build

echo -e "${green}Starting with PM2 on port 8080...${reset}"
pm2 start ecosystem.config.cjs

# Show status
pm2 status