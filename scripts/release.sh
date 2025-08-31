#!/bin/bash

# BlogNow SDK Release Script
# Usage: ./scripts/release.sh [patch|minor|major|prerelease] [--alpha|--beta|--rc]

set -e

RELEASE_TYPE=$1
PRERELEASE_TAG=$2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate arguments
if [ -z "$RELEASE_TYPE" ]; then
    print_error "Release type required: patch, minor, major, or prerelease"
    echo "Usage: $0 [patch|minor|major|prerelease] [--alpha|--beta|--rc]"
    exit 1
fi

# Check if we're on main or develop branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "develop" ]]; then
    print_warning "You are not on main or develop branch (currently on: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Release cancelled"
        exit 0
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

print_info "Starting release process..."

# Run tests
print_info "Running tests..."
npm test
print_success "Tests passed"

# Run linter
print_info "Running linter..."
npm run lint
print_success "Linting passed"

# Run type checking
print_info "Running type check..."
npm run typecheck
print_success "Type checking passed"

# Build the package
print_info "Building package..."
npm run build
print_success "Build completed"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Determine new version
if [ "$RELEASE_TYPE" == "prerelease" ]; then
    if [ -z "$PRERELEASE_TAG" ]; then
        print_error "Prerelease tag required: --alpha, --beta, or --rc"
        exit 1
    fi
    
    PRERELEASE_ID=${PRERELEASE_TAG#--}
    NEW_VERSION=$(npm version prerelease --preid=$PRERELEASE_ID --no-git-tag-version)
else
    NEW_VERSION=$(npm version $RELEASE_TYPE --no-git-tag-version)
fi

NEW_VERSION=${NEW_VERSION#v} # Remove 'v' prefix
print_info "New version: $NEW_VERSION"

# Update CHANGELOG
print_info "Updating CHANGELOG.md..."
CHANGELOG_DATE=$(date +"%Y-%m-%d")
sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [$NEW_VERSION] - $CHANGELOG_DATE/" CHANGELOG.md
rm CHANGELOG.md.bak
print_success "CHANGELOG.md updated"

# Commit version changes
print_info "Committing version changes..."
git add package.json CHANGELOG.md
git commit -m "chore: bump version to $NEW_VERSION"
print_success "Version changes committed"

# Create git tag
print_info "Creating git tag..."
git tag "v$NEW_VERSION"
print_success "Tag v$NEW_VERSION created"

# Push changes and tags
print_info "Pushing changes and tags..."
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"
print_success "Changes and tags pushed"

print_success "Release $NEW_VERSION completed successfully!"
print_info "GitHub Actions will now handle publishing to NPM and creating the GitHub release."

# Show next steps
echo
print_info "Next steps:"
echo "1. 🎉 GitHub Actions will automatically:"
echo "   - Publish to NPM with appropriate tag"
echo "   - Create GitHub release with changelog"
echo "   - Generate and deploy documentation (for stable releases)"
echo
echo "2. 🔍 Monitor the release:"
echo "   - GitHub Actions: https://github.com/synkc0/blognow-js-sdk/actions"
echo "   - NPM Package: https://www.npmjs.com/package/@blognow/sdk"
echo
echo "3. 📢 Announce the release:"
echo "   - Update project documentation"
echo "   - Notify users of new features/changes"