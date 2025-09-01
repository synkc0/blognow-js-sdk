# Release Guide

This document explains how to create releases for the BlogNow SDK using the automated GitHub workflows.

## 🚀 **Release Methods**

### **Method 1: Automated Version Bumping (Recommended)**

Use the **"Bump Version and Release"** workflow for automatic semantic versioning:

1. **Go to GitHub Actions**: `https://github.com/synkc0/blognow-js-sdk/actions`
2. **Select**: "Bump Version and Release" workflow
3. **Click**: "Run workflow"
4. **Choose release type**:
   - `patch`: Bug fixes (1.1.1 → 1.1.2)
   - `minor`: New features (1.1.1 → 1.2.0)  
   - `major`: Breaking changes (1.1.1 → 2.0.0)
   - `prerelease`: Pre-release versions (1.1.1 → 1.1.2-alpha.0)

5. **For prereleases, select type**:
   - `alpha`: Early development versions
   - `beta`: Feature-complete but may have bugs
   - `rc`: Release candidates, stable for testing

6. **Click "Run workflow"**

**What this workflow does:**
- ✅ Runs all tests and quality checks
- ✅ Automatically bumps version in `package.json`
- ✅ Updates `CHANGELOG.md` with release info
- ✅ Commits changes and creates git tag
- ✅ Triggers the release workflow automatically
- ✅ Publishes to NPM with correct tags
- ✅ Creates GitHub release with release notes
- ✅ Deploys documentation to GitHub Pages

### **Method 2: Manual Version Release**

Use the **"Quick Release"** workflow when you know the exact version:

1. **Go to GitHub Actions**: `https://github.com/synkc0/blognow-js-sdk/actions`
2. **Select**: "Quick Release" workflow  
3. **Click**: "Run workflow"
4. **Enter exact version**: e.g., `1.2.0`, `2.0.0-beta.1`
5. **Click "Run workflow"**

**Use this when:**
- You need a specific version number
- Jumping multiple versions
- Creating hotfix releases

## 📋 **Release Checklist**

Before creating any release:

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is up to date
- [ ] Breaking changes are documented

## 🏷️ **Version Tagging Strategy**

### **Stable Releases**
- `v1.0.0`, `v1.1.0`, `v1.2.0` → Published with `latest` tag on NPM

### **Prereleases**
- `v1.1.0-alpha.0`, `v1.1.0-alpha.1` → Published with `alpha` tag
- `v1.1.0-beta.0`, `v1.1.0-beta.1` → Published with `beta` tag  
- `v1.1.0-rc.0`, `v1.1.0-rc.1` → Published with `rc` tag

## 📦 **NPM Distribution Tags**

```bash
# Install specific versions
npm install @blognow/sdk          # Latest stable
npm install @blognow/sdk@alpha    # Latest alpha
npm install @blognow/sdk@beta     # Latest beta
npm install @blognow/sdk@rc       # Latest release candidate
```

## 🔍 **Monitoring Releases**

### **Check Release Status**
- **GitHub Releases**: `https://github.com/synkc0/blognow-js-sdk/releases`
- **NPM Package**: `https://www.npmjs.com/package/@blognow/sdk`
- **Documentation**: `https://synkc0.github.io/blognow-js-sdk/`

### **GitHub Actions Status**
- **Workflows**: `https://github.com/synkc0/blognow-js-sdk/actions`
- **Release Workflow**: Publishes to NPM and creates GitHub release
- **Docs Workflow**: Deploys documentation to GitHub Pages

## ❌ **Troubleshooting**

### **"Version already exists" Error**
- The version you're trying to release already exists on NPM
- Use a different version bump or check existing releases
- Check: `npm view @blognow/sdk versions --json`

### **"Tests Failed" Error**  
- Fix failing tests before releasing
- Run locally: `npm test`

### **"Build Failed" Error**
- Fix TypeScript compilation errors
- Run locally: `npm run build`

### **"NPM Publish Failed" Error**
- Check NPM_TOKEN secret is configured
- Verify you have publish permissions to `@blognow` scope

### **"GitHub Pages Deploy Failed" Error**
- Check repository Pages settings
- Verify GitHub Actions has write permissions

## 🔧 **Local Development Releases**

For testing releases locally without publishing:

```bash
# Test the build process
npm run build

# Test NPM package creation  
npm pack

# Test installation from local package
npm install ./blognow-sdk-1.1.1.tgz

# Dry run NPM publish
npm publish --dry-run
```

## 📈 **Release History**

See `CHANGELOG.md` for detailed release history and changes.

## 🆘 **Getting Help**

If you encounter issues with releases:

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify repository settings** (Pages, Actions permissions)  
3. **Check NPM token** expiration and permissions
4. **Create an issue** with workflow logs attached

---

**Happy Releasing! 🚀**