#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Firebase Storage CORS Setup Script${NC}"
echo "This script will help you configure CORS for Firebase Storage."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo -e "${RED}Firebase CLI is not installed.${NC}"
    echo "Please install it first with: npm install -g firebase-tools"
    echo "Or follow the manual instructions in FIREBASE_CORS_SETUP.md"
    exit 1
fi

# Check if user is logged in to Firebase
echo "Checking if you're logged in to Firebase..."
firebase login:list &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}You need to log in to Firebase first.${NC}"
    firebase login
fi

# Ask for project ID
echo ""
echo -e "${YELLOW}Enter your Firebase project ID${NC} (e.g., workout-tracker-263c1):"
read project_id

if [ -z "$project_id" ]; then
    echo -e "${RED}Project ID cannot be empty.${NC}"
    exit 1
fi

# Set the project
echo ""
echo "Setting Firebase project to $project_id..."
firebase use $project_id

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set project. Make sure the project ID is correct.${NC}"
    exit 1
fi

# Update CORS configuration
echo ""
echo "Updating CORS configuration..."
firebase storage:cors update --config=cors.json

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to update CORS configuration.${NC}"
    echo "Please try manually following the instructions in FIREBASE_CORS_SETUP.md"
    exit 1
fi

echo ""
echo -e "${GREEN}CORS configuration updated successfully!${NC}"
echo "You should now be able to upload images from your local development environment."
echo "If you still encounter issues, please check FIREBASE_CORS_SETUP.md for troubleshooting." 