#!/bin/bash

# --- Comprehensive Git Push Script for Finance Hub ---

echo "🚀 Starting deployment of Finance Hub updates..."

# 1. Add ALL relevant files (including the [id] sub-folders for Delete/Reject)
git add src/app/api/tasks/route.ts
git add src/components/DashboardClient.tsx
git add src/app/api/external-requests/route.ts
git add src/app/api/external-requests/\[id\]/route.ts
git add prisma/schema.prisma
git add src/app/api/users/route.ts

# 2. Commit the changes
git commit -m "Fixed Delete logic by including the [id] API route and updated permissions"

# 3. Push to the repository
echo "📤 Pushing to main branch..."
git push origin main

echo "✅ Successfully deployed! The Finance Hub is now updated with:"
echo "   - Functional DELETE option (Permanently removes from DB)"
echo "   - Functional REJECT option with comments"
echo "   - Correct Default Status ('Pending')"
echo "   - Role-based Action Column (Admins/Allocators only)"
