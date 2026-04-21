#!/bin/bash

# Navigate to the project directory
cd "C:/Users/PavanKumarReddy/.gemini/antigravity/scratch/task-manager-webapp"

echo "------------------------------------------"
echo "🚀 Starting Intellicar Task Manager Deploy"
echo "------------------------------------------"

# Stage all changes
git add .

# Prompt for a commit message (or use a default)
read -p "Enter commit message (or press Enter for default): " msg
if [ -z "$msg" ]; then
    msg="General updates and improvements"
fi

# Commit and Push
git commit -m "$msg"
git push

echo "------------------------------------------"
echo "✅ Success! Deployment pushed to GitHub."
echo "⏳ Please wait 2 mins for Vercel to update."
echo "------------------------------------------"
