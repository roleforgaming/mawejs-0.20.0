# Documentation Summary

Generated: 2026-02-05

## New Documentation Files Created

### 1. CONTRIB.md (232 lines)
**Purpose:** Development contribution guide for contributors

**Contents:**
- Development workflow and setup instructions
- Complete scripts reference table with descriptions
- Project architecture overview (process boundary, renderer structure)
- State management details
- Document model and SlateJS integration
- Key coding conventions
- Platform-specific notes (Linux, Windows)
- Debugging guides
- Code quality standards
- Git workflow
- Issue reporting guidelines

**Status:** ✅ **NEW** - Created 2026-02-05 21:53
**Audience:** Developers, contributors

---

### 2. RUNBOOK.md (385 lines)
**Purpose:** Operations guide for deployment, monitoring, and maintenance

**Contents:**
- Pre-deployment checklist
- Building procedures (single platform and cross-platform)
- Release process with rollback procedures
- Monitoring and user feedback channels
- Common issues and fixes (9 categories):
  - Linux sandbox errors
  - Development server startup issues
  - File import/export failures
  - Build failures
  - Memory/performance issues
  - Document corruption
- Performance tuning recommendations
- Environment setup
- Backup and recovery strategies
- Dependency management
- Troubleshooting deployment
- Support and documentation links

**Status:** ✅ **NEW** - Created 2026-02-05 21:53
**Audience:** DevOps, maintainers, power users

---

## Existing Documentation Files

### Legacy Format Files (Last modified: 2026-02-02)

These files document internal file format and system details, not actively maintained:

| File | Lines | Purpose | Age |
|------|-------|---------|-----|
| **MAWE.FileFormat.txt** | 470 | MaweJS file format specification | 3 days |
| **MAWE.VersionedFile.txt** | 195 | Versioned file structure documentation | 3 days |
| **MAWE.VersionSections.txt** | 82 | Version sections reference | 3 days |
| **Hotkeys.txt** | 106 | Keyboard shortcuts reference | 3 days |
| **GUIDELINES** | 167 | Old development guidelines (superseded by CONTRIB.md) | 3 days |
| **Misc.txt** | 16 | Miscellaneous notes | 3 days |

**Status:** ⚠️ **LEGACY** - Not modified in 3 days (likely stable/archived)

---

## Documentation Maintenance Recommendations

### Files Recommended for Review/Update

1. **GUIDELINES**
   - **Current Status:** Superseded by CONTRIB.md
   - **Recommendation:** Review for any unique content, archive or consolidate into CONTRIB.md
   - **Priority:** Medium

2. **Hotkeys.txt**
   - **Current Status:** May be outdated with UI changes
   - **Recommendation:** Verify hotkeys match current application, consider migrating to CONTRIB.md appendix
   - **Priority:** Medium

3. **MAWE.*.txt** (File format docs)
   - **Current Status:** Internal technical reference, likely stable
   - **Recommendation:** Keep as-is; these document file format stability for backwards compatibility
   - **Priority:** Low

### Files to Create (Future)

1. **USER_GUIDE.md** - End-user documentation
   - Getting started for new users
   - Feature explanations with screenshots
   - Tutorial workflows
   - FAQ

2. **CHANGELOG.md** - Release notes
   - Version history
   - Breaking changes
   - Feature additions
   - Bug fixes

3. **API_REFERENCE.md** - IPC protocol documentation
   - Channel descriptions
   - Message formats
   - Examples

---

## Documentation Structure

Current structure organized by audience:

```
docs/
├── CONTRIB.md          ← Contributors (how to develop)
├── RUNBOOK.md          ← Operators (how to deploy/maintain)
├── [Legacy docs]       ← Internal format references
└── [To create]         ← User guides, API docs
```

---

## Diff Summary

### Changed Files

None - all documentation is new.

### New Files

```
docs/CONTRIB.md          +232 lines  ✅ Created
docs/RUNBOOK.md          +385 lines  ✅ Created
```

### Total Impact

- **New documentation:** 617 lines
- **Covers:** Development workflow, deployment procedures, troubleshooting, architecture overview
- **Consolidates:** Previously scattered information from README.md and CLAUDE.md

---

## Scripts Reference (from package.json)

### Development Scripts

| Script | Platform | Purpose |
|--------|----------|---------|
| `dev` | Linux | Start React dev server + Electron concurrently |
| `dev:react` | All | React development server on localhost:3000 |
| `dev:electron` | All | Electron window with dev tools |

### Build Scripts

| Script | Purpose |
|--------|---------|
| `build` | React build + Electron package (current platform) |
| `release` | React build + Electron for Windows + Linux |
| `react-build` | Optimized React production build |
| `electron-build` | Build Electron for current platform |
| `electron-build-mwl` | Build Electron for Windows & Linux |

### Testing & Maintenance

| Script | Purpose |
|--------|---------|
| `react-test` | Run React test suite |
| `audit` | Audit production dependencies for vulnerabilities |
| `fresh` | Clean rebuild (deletes dist/, build/, node_modules/, package-lock.json) |
| `fix` | Set SUID on chrome-sandbox (Linux, requires sudo) |

---

## Environment Variables

No `.env.example` file exists in the repository. The application does not require environment variables for:
- Development
- Production deployment
- End-user configuration

All configuration is stored in:
- `settings_doc.json` - Document-level settings
- `localStorage` - Theme and UI preferences

---

## Next Steps

1. **Review** these new documentation files
2. **Update GUIDELINES** - consolidate into CONTRIB.md or archive
3. **Verify Hotkeys.txt** - ensure hotkeys are current
4. **Consider adding** USER_GUIDE.md for end-user documentation
5. **Set up documentation CI/CD** - auto-validate broken links, formatting

---

## Documentation Maintenance Checklist

- [x] Scripts reference extracted from package.json
- [x] Architecture documented in CONTRIB.md
- [x] Development workflow documented
- [x] Deployment procedures documented
- [x] Common issues and fixes documented
- [ ] User guide created (future)
- [ ] API reference created (future)
- [ ] GUIDELINES merged or archived (action item)
- [ ] Hotkeys verified and updated (action item)
- [ ] CI/CD validation added (future)
