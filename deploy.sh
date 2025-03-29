#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Start Linera testnet with an extra wallet and a specific PRNG seed
printf "${YELLOW}Starting Linera testnet with extra wallet and PRNG seed...${NC}\n"
linera_spawn_and_read_wallet_variables linera net up --extra-wallets 1 --testing-prng-seed 37

# Publish Lincoin application
printf "${GREEN}Publishing Lincoin application...${NC}\n"
cd lincoin || exit
LINCOIN_ID=`linera --with-wallet 0 publish-bytecode ./target/wasm32-unknown-unknown/release/lincoin_{contract,service}.wasm`
printf "${PURPLE}Lincoin ID: $LINCOIN_ID${NC}\n"

# Publish Market application
printf "${GREEN}Publishing Market application...${NC}\n"
cd ../market || exit
MARKET_ID=$(linera --with-wallet 0 project publish-and-create --json-argument "null")
printf "${PURPLE}Market ID: $MARKET_ID${NC}\n"

# Publish Auction application
printf "${GREEN}Publishing Auction application...${NC}\n"
cd ../auction || exit
AUCTION_ID=$(linera --with-wallet 0 project publish-and-create \
    --required-application-ids "$LINCOIN_ID" \
    --required-application-ids "$MARKET_ID" \
    --json-argument "null" \
    --json-parameters "{\"lincoin_app_id\":\"$LINCOIN_ID\", \"market_app_id\":\"$MARKET_ID\"}")
printf "${PURPLE}Auction ID: $AUCTION_ID${NC}\n"

# Run applications on different ports
printf "${YELLOW}Running applications...${NC}\n"
linera --with-wallet 0 service --port 8080 &
printf "${BLUE}Application running on port 8080${NC}\n"
linera --with-wallet 1 service --port 8081 &
printf "${BLUE}Application running on port 8081${NC}\n"

# Wait for user input to exit
read -r -p "Press Enter to exit..."
