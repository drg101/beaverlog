#!/bin/bash

source .env

echo "Running on test"
psql $TEST_DATABASE_URL -f ./migrate/migrate.sql
read -p "Do you want to continue and run on prod? (y/n): " answer
if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    echo "Continuing"
else
    exit 0
fi
echo "Running on prod"
psql $DATABASE_URL -f ./migrate/migrate.sql
