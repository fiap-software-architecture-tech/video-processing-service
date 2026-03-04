#!/bin/bash
set -e

# colors
RED="\033[1;31m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
NOCOLOR="\033[0m"

echo -e "${GREEN}Creating resources${NOCOLOR}"
echo

echo -e "${YELLOW}Creating SQS: ${NOCOLOR} video-status-queue"
aws sqs --endpoint-url=http://localhost:4566 --region=us-east-1 create-queue \
    --queue-name video-status-queue | tee > /dev/null 2>&1

echo -e "${GREEN}Resources created successfully!${NOCOLOR}"

