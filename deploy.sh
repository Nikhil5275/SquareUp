#!/bin/bash

echo "🚀 SquareUp Vercel Deployment Script"
echo "===================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  No remote origin found."
    echo "Please create a GitHub repository at: https://github.com/new"
    echo "Name it: squareup-v2"
    echo ""
    read -p "Enter your GitHub username: " username
    echo "Run: git remote add origin https://github.com/$username/squareup-v2.git"
    echo "Then: git push -u origin main"
    echo ""
    echo "After pushing, go to https://vercel.com/new and import your repo!"
    exit 0
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Now deploy to Vercel:"
    echo "1. Go to: https://vercel.com/new"
    echo "2. Import your 'squareup-v2' repository"
    echo "3. Vercel will auto-detect Next.js"
    echo "4. Click 'Deploy'"
    echo ""
    echo "🔧 Don't forget to add environment variables in Vercel dashboard!"
    echo "   Copy them from your .env.local file"
else
    echo "❌ Failed to push to GitHub. Please check your repository URL."
fi
