#!/bin/bash
echo "🚀 Starting Deployment..."
git add .
git commit -m "Update email templates with production dashboard link"
git push
echo "✅ Deployment submitted! Please wait 2 minutes for Vercel to turn green."
