# Release Quick Reference - Tag-Based

## 🎯 TL;DR - How to Release

```bash
# Production release
git tag v1.2.0 && git push origin v1.2.0

# Beta release
git tag v1.2.0-beta.1 && git push origin v1.2.0-beta.1
```

That's it! CI/CD handles the rest 🚀

---

## 📝 Version Format

```
v[MAJOR].[MINOR].[PATCH]             # Production
v[MAJOR].[MINOR].[PATCH]-beta.[NUM]  # Pre-release
```

### Examples
- `v1.0.0` → First stable release
- `v1.0.1` → Bug fix
- `v1.1.0` → New feature
- `v2.0.0` → Breaking change
- `v1.2.0-beta.1` → Beta testing

---

## 🚀 Common Release Scenarios

### Scenario 1: Bug Fix Release
```bash
# Current: v1.2.3
# Fixed some bugs, ready to release

git checkout main
git pull
git tag v1.2.4
git push origin v1.2.4
```
**Result**: Version 1.2.4 published to NPM with `latest` tag

---

### Scenario 2: New Feature Release
```bash
# Current: v1.2.4
# Added new features

git checkout main
git pull
git tag v1.3.0
git push origin v1.3.0
```
**Result**: Version 1.3.0 published to NPM with `latest` tag

---

### Scenario 3: Breaking Changes
```bash
# Current: v1.3.0
# Made breaking API changes

git checkout main
git pull
git tag v2.0.0
git push origin v2.0.0
```
**Result**: Version 2.0.0 published to NPM with `latest` tag

---

### Scenario 4: Beta Testing
```bash
# Want to test v2.0.0 before stable release

git checkout beta
git pull
git tag v2.0.0-beta.1
git push origin v2.0.0-beta.1

# After feedback and fixes
git tag v2.0.0-beta.2
git push origin v2.0.0-beta.2

# Ready for stable release
git checkout main
git tag v2.0.0
git push origin v2.0.0
```
**Result**: 
- Beta versions published with `beta` tag
- Stable version published with `latest` tag

---

## 📋 Decision Tree

```
What changed?
├─ Bug fixes only → Patch (1.0.0 → 1.0.1)
├─ New features (backward compatible) → Minor (1.0.0 → 1.1.0)
├─ Breaking changes → Major (1.0.0 → 2.0.0)
└─ Testing/experimental → Beta (1.0.0 → 1.1.0-beta.1)
```

---

## 🎨 Using NPM Version Command

Shortcut for creating tags:

```bash
# Patch: 1.0.0 → 1.0.1
npm version patch
git push --follow-tags

# Minor: 1.0.0 → 1.1.0
npm version minor
git push --follow-tags

# Major: 1.0.0 → 2.0.0
npm version major
git push --follow-tags

# Pre-release
npm version 1.2.0-beta.1
git push --follow-tags
```

---

## 📦 What Happens After You Push a Tag?

```
You push tag → GitHub Actions triggered
                        ↓
                Install dependencies
                        ↓
                Build project
                        ↓
                Run tests
                        ↓
                Tests pass? ────No───→ FAIL ❌
                        ↓
                       Yes
                        ↓
                Publish to NPM
                        ↓
                Create GitHub Release
                        ↓
                    SUCCESS ✅
```

---

## 🔍 Useful Commands

### Check versions
```bash
# See all your tags
git tag -l

# See latest tag
git describe --tags --abbrev=0

# Check what's on NPM
npm view create-react-forge versions

# Check current package.json version
npm version
```

### Manage tags
```bash
# Create tag
git tag v1.2.0

# Create annotated tag (with message)
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push single tag
git push origin v1.2.0

# Push all tags
git push --tags

# Delete local tag
git tag -d v1.2.0

# Delete remote tag
git push origin :refs/tags/v1.2.0
```

---

## ⚠️ Quick Do's and Don'ts

### ✅ DO
- Test thoroughly before tagging
- Follow semantic versioning
- Use beta tags for experimental features
- Keep tags on stable commits
- Document changes in release notes

### ❌ DON'T
- Don't manually edit `package.json` version
- Don't reuse version numbers
- Don't delete tags after publishing
- Don't tag broken code
- Don't skip testing before release

---

## 🔑 One-Time Setup

Add NPM token to GitHub:

1. **Get NPM token**
   - npmjs.com → Account Settings → Access Tokens
   - Generate New Token (Automation type)

2. **Add to GitHub**
   - Repo Settings → Secrets and variables → Actions
   - New secret: `NPM_TOKEN`

---

## 🆘 Common Issues

### "Tag already exists"
```bash
# Delete and recreate
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0
git tag v1.2.0
git push origin v1.2.0
```

### "Release workflow didn't trigger"
- Check tag format starts with `v` (e.g., `v1.2.0` not `1.2.0`)
- Verify tag was pushed: `git ls-remote --tags origin`
- Check GitHub Actions tab for errors

### "NPM publish failed"
- Verify `NPM_TOKEN` secret is set in GitHub
- Check if version already exists on NPM
- Ensure package name is available

---

## 📥 User Installation Commands

```bash
# Latest stable
npm install create-react-forge

# Specific version
npm install create-react-forge@1.2.0

# Latest beta
npm install create-react-forge@beta

# Specific beta
npm install create-react-forge@1.2.0-beta.1
```

---

## 🏷️ Tag Naming Convention

| Branch | Tag Format | NPM Tag | Example |
|--------|-----------|---------|---------|
| `main` | `v*.*.*` | `latest` | `v1.2.3` |
| `beta` | `v*.*.*-beta.*` | `beta` | `v1.2.0-beta.1` |

---

## 🎓 Pro Tips

💡 **Tip 1**: Use annotated tags for better git history
```bash
git tag -a v1.2.0 -m "Add TypeScript support and new templates"
```

💡 **Tip 2**: Check what will be released before tagging
```bash
npm run build && npm test
```

💡 **Tip 3**: Edit GitHub release notes after auto-generation
- Go to Releases on GitHub
- Click Edit on the release
- Add more details, migration guides, etc.

💡 **Tip 4**: Use beta extensively before major versions
```bash
v2.0.0-beta.1 → v2.0.0-beta.2 → v2.0.0-beta.3 → v2.0.0
```

---

## 📊 Workflow Summary

| Step | Command | Result |
|------|---------|--------|
| 1. Develop | `git commit -m "fix: bug"` | Code changes |
| 2. Ready? | `npm run build && npm test` | Verify quality |
| 3. Tag | `git tag v1.2.0` | Create version |
| 4. Release | `git push origin v1.2.0` | Trigger CI/CD |
| 5. Published! | - | NPM + GitHub ✅ |
