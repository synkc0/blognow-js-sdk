#!/bin/bash

# BlogNow SDK Version Bump Script
# Usage: ./scripts/bump-version.sh [patch|minor|major]

set -e

BUMP_TYPE=${1:-patch}

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 [patch|minor|major]"
  echo "Default: patch"
  exit 1
fi

echo "🔍 Current version: $(npm pkg get version | tr -d '"')"

# Bump version using npm version
NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version)

echo "✅ Bumped version to: $NEW_VERSION"

# Update CHANGELOG.md header if it exists
if [ -f "CHANGELOG.md" ]; then
  sed -i.bak "1s/^/## [$NEW_VERSION] - $(date +%Y-%m-%d)\n\n### Changes\n- Version bump for release\n\n/" CHANGELOG.md
  rm CHANGELOG.md.bak 2>/dev/null || true
  echo "📝 Updated CHANGELOG.md"
fi

echo ""
echo "🚀 Ready to release! Next steps:"
echo "1. git add package.json CHANGELOG.md"
echo "2. git commit -m \"chore: bump version to $NEW_VERSION\""
echo "3. git tag $NEW_VERSION"
echo "4. git push origin main --tags"
echo ""
echo "Or use the release script:"
echo "npm run release:$BUMP_TYPE"