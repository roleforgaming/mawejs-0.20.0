# MaweJS Operations Runbook

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All tests passing: `npm run react-test` and `node test/run.js [test files]`
- [ ] Security audit clean: `npm audit --production`
- [ ] Code reviewed and merged to main
- [ ] Version bumped in `package.json`
- [ ] Release notes prepared
- [ ] Example files updated if necessary

### Building for Distribution

#### Current Platform Only

```bash
npm run build
```

Output locations:
- **React:** `build/` directory
- **Electron:** `dist/` directory

#### Cross-Platform Release (Windows & Linux)

```bash
npm run release
```

Creates packages for both platforms in the `dist/` directory.

#### Platform-Specific Builds

```bash
# Current platform
npm run electron-build

# Windows + Linux
npm run electron-build-mwl
```

### Release Process

1. **Prepare release**
   ```bash
   npm install    # Ensure dependencies up-to-date
   npm audit --production  # Check for vulnerabilities
   ```

2. **Build application**
   ```bash
   npm run release
   ```

3. **Test built packages**
   - Test on Windows (AppX/NSIS installer)
   - Test on Linux (AppImage)
   - Verify import/export functionality
   - Test with example files from `examples/`

4. **Create GitHub release**
   - Tag: `v[version]`
   - Upload build artifacts from `dist/`
   - Include release notes
   - Mark as pre-release if beta

### Rollback Procedures

If a release has critical issues:

1. **Immediate action**
   - Remove release from GitHub
   - Mark as withdrawn in discussions/issues

2. **Code fixes**
   - Create hotfix branch from release tag
   - Fix the issue
   - Test thoroughly
   - Merge to main
   - Create new release with patched version

3. **Communication**
   - Post update on discussions page
   - Notify users in issues
   - Document the issue and fix

## Monitoring and Alerts

### User Feedback Channels

- **GitHub Issues:** Bug reports and feature requests
- **Discussions:** Status updates and general questions
- **Pull Requests:** Community contributions

### Common Issues and Fixes

#### Linux Sandbox Errors

**Symptom:** Errors like "chrome-sandbox" permission denied

**Fix:**
```bash
npm run fix
# or manually:
sudo chown root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

**Prevention:** Run `npm run fix` after updating Electron

#### Development Server Not Starting

**Symptom:** `npm run dev` hangs or fails to connect

**Windows Fix:** Use separate terminals:
```bash
# Terminal 1
npm run dev:react

# Terminal 2 (wait for server to be ready)
npm run dev:electron
```

**Linux:** Check if port 3000 is in use:
```bash
lsof -i :3000
# Kill the process if needed
kill -9 [PID]
```

#### File Import/Export Failures

**Symptom:** Can't import .docx or other formats

**Troubleshooting:**
1. Check file format is supported (.mawe, .mawe.gz, .txt, .docx)
2. Verify file is not corrupted
3. Try import preview dialog to see specific error
4. Check application logs in developer console

**Supported Formats:**
- `.mawe` - MaweJS native format (XML)
- `.mawe.gz` - Compressed MaweJS format
- `.docx` - Word documents (via mammoth library)
- `.txt` - Plain text
- Clipboard content

#### Build Failures

**Symptom:** `npm run build` or `npm run release` fails

**Steps:**
1. Clean dependencies:
   ```bash
   npm run fresh
   ```

2. Check Node.js version (recommend v16+):
   ```bash
   node --version
   npm --version
   ```

3. Check for Electron-specific issues:
   ```bash
   npm audit --production
   npm install
   ```

4. Try building React and Electron separately:
   ```bash
   npm run react-build
   npm run electron-build
   ```

#### Memory/Performance Issues

**Symptom:** Slow editor, high memory usage with large documents

**Mitigation:**
- Upgrade to latest version (performance improvements ongoing)
- Try using folding to hide sections
- Split large projects into multiple files
- Disable auto-save if it's impacting performance

**Check Autosave Settings:** Settings are stored in `settings_doc.json`

#### Document Corruption

**Recovery Options:**
1. Check `.mawe.gz` is actually gzipped (try manual decompression)
2. Look for `.mawe` backup in same directory
3. Check recent files in settings
4. Try importing from plain text backup if available

**Prevention:**
- Always keep backups
- Test export functionality regularly
- Use version control for important projects

## Performance Tuning

### Recommended Settings

**For Large Documents:**
- Use folding to collapse sections you're not working on
- Increase word count refresh interval
- Disable statistics view if not needed

**For Limited Hardware:**
- Close other applications
- Use smaller example files for testing
- Consider splitting project into chapters

### Monitoring Performance

**React Dev Tools:**
- Attach React DevTools to monitor component renders
- Look for unnecessary re-renders

**Electron Dev Tools:**
- Open with `Ctrl+Shift+I` / `Cmd+Option+I`
- Check Memory tab for leaks
- Monitor Network tab for IPC delays

## Environment Setup

### Development Environment Variables

The application respects standard Electron environment variables. No special setup typically required for development.

### Production Deployment

No environment variables are required for end-users. All configuration is stored in:
- `settings_doc.json` - Document settings
- `localStorage` - Theme and UI preferences

## Backup and Recovery

### Automatic Backups

MaweJS creates backups through standard file operations. Always save regularly:
- Auto-save runs periodically (background)
- Manual save: `Ctrl+S` / `Cmd+S`

### Manual Backup Strategy

1. **During development:**
   ```bash
   # Commit to git
   git add .
   git commit -m "Checkpoint: [description]"
   ```

2. **Before major changes:**
   ```bash
   cp myfile.mawe myfile.mawe.backup
   ```

3. **Export to multiple formats:**
   - Export as TXT for plain-text backup
   - Export as HTML for formatted backup
   - Keep .mawe native format as primary

### File Format Migration

MaweJS automatically migrates older file formats on load:

```
Version 1 → Version 2 → Version 3 ... (automatic)
```

See `src/document/xmljs/migration.js` for technical details.

## Dependency Management

### Current Dependencies

| Category | Purpose |
|----------|---------|
| **React/Electron** | UI framework and desktop app shell |
| **SlateJS** | Rich text editor |
| **Redux Toolkit** | State management |
| **Material-UI** | Component library |
| **electron-better-ipc** | Main/Renderer communication |
| **mammoth** | Word document parsing |
| **Recharts** | Statistics visualization |
| **xml-js** | XML serialization |
| **pako** | Gzip compression |

### Updating Dependencies

**Check for updates:**
```bash
npm outdated
```

**Security audit:**
```bash
npm audit
npm audit --production
```

**Update dependencies:**
```bash
npm update
npm install [package@latest]
```

**After updates:**
```bash
npm run fresh        # If major issues
npm run react-test   # Verify tests pass
npm run build        # Test build
```

## Troubleshooting Deployment

### Package Size Too Large

**Check:**
```bash
du -sh dist/
```

**Reduce:**
- Remove debug symbols: configure electron-builder
- Check for unnecessary dependencies: `npm ls`
- Use `npm audit` to identify security issues that might require updates

### Installation Issues on Target

**Windows:**
- Test both NSIS and AppX installers
- Check for antivirus false positives
- Verify code signing if applicable

**Linux:**
- Test on multiple distributions (Ubuntu, Fedora, etc.)
- Verify AppImage permissions
- Check glibc compatibility (use `--no-sandbox` if needed)

### Update/Patch Deployment

**For critical fixes:**

1. Create hotfix branch:
   ```bash
   git checkout -b hotfix/issue-name main
   ```

2. Fix and test:
   ```bash
   npm run react-test
   npm run build
   ```

3. Version bump (patch):
   ```bash
   # Manually update package.json version: X.Y.Z -> X.Y.(Z+1)
   git add package.json
   git commit -m "fix: [description]"
   git tag vX.Y.Z
   ```

4. Build and release:
   ```bash
   npm run release
   ```

## Support and Documentation

- **Main Repository:** https://github.com/mkoskim/mawejs
- **Discussions:** https://github.com/mkoskim/mawejs/discussions
- **Issues:** https://github.com/mkoskim/mawejs/issues
- **Wiki:** https://github.com/mkoskim/mawejs/wiki
- **Example Files:** `examples/` directory in repository

## Contact

For deployment and production issues:
- Author: Markus Koskimies <mkoskim@gmail.com>
- Project Home: https://github.com/mkoskim/mawejs
