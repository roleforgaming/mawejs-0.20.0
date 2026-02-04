---
id: mawejs-commit-convention
trigger: "when writing a commit message"
confidence: 0.80
domain: git
source: local-repo-analysis
---

# Use Conventional Commits With Scoped Prefixes

## Action

Commit messages must follow:
```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

**Common scopes observed in this repo:**
- `app` — root App component, store, save logic
- `ui` — visual / interaction fixes
- `export` — export formatters
- `autosave` — background auto-save
- `slatejs` — SlateJS editor layer

## Evidence

- `.claude/rules/git-workflow.md` mandates this format
- 6 of 10 commits follow the convention; the 4 that do not are `update` / bare descriptions
- Best examples: `feat(autosave):`, `fix(ui):`, `refactor(app):`
- Attribution is disabled globally — do not append `Co-Authored-By` unless explicitly asked
