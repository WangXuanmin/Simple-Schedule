---
name: publish-git-project-to-github
description: Prepare and publish a local project to GitHub. Use when the user asks to upload, publish, push, or transfer a local code project to GitHub, especially when using GitHub Desktop, Git CLI, or a local folder that is not yet a Git repository.
---

# Publish Git Project To GitHub

## Overview

Use this workflow to turn a local project folder into a clean Git repository and publish it to GitHub. Prefer the safest path available: create a local commit first, avoid committing generated dependencies, then publish through GitHub Desktop or push to an existing remote.

## Workflow

### 1. Inspect The Project

Run from the project root:

```powershell
Test-Path .git
Get-ChildItem -Force
Get-Command git -ErrorAction SilentlyContinue
Get-Command gh -ErrorAction SilentlyContinue
```

If `git` is not on `PATH`, check whether GitHub Desktop is installed and use its bundled Git:

```powershell
Get-Process | Where-Object { $_.ProcessName -like "*GitHub*" } | Select-Object ProcessName,Path
Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop" -Recurse -Filter git.exe -ErrorAction SilentlyContinue
```

On Windows, prefer `powershell.exe -NoProfile -Command` to avoid profile execution-policy noise.

### 2. Add A Gitignore

Before the first commit, create or update `.gitignore`. For Node/Electron projects, include at least:

```gitignore
node_modules/
dist/
out/
release/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
Thumbs.db
```

Do not commit `node_modules/`. Do commit `package-lock.json` when present.

### 3. Initialize And Commit

If the folder is not already a Git repository:

```powershell
git init -b main
```

Confirm identity:

```powershell
git config --global user.name
git config --global user.email
```

Then stage and commit:

```powershell
git status --short
git check-ignore -v node_modules
git add .
git status --short
git commit -m "Initial commit"
```

If `node_modules` appears in `git status`, stop and fix `.gitignore` before committing.

### 4. Publish With GitHub Desktop

Use this path when the user already has GitHub Desktop open or authenticated.

1. Open the repository folder in GitHub Desktop.
2. Confirm the first commit exists and the working tree is clean.
3. Click `Publish repository`.
4. Choose repository name and visibility.
5. Publish.

If launching GitHub Desktop from PowerShell:

```powershell
Start-Process -FilePath "<GitHubDesktop.exe path>" -ArgumentList "<project path>"
```

After publishing, verify:

```powershell
git remote -v
git status --short
```

### 5. Publish With Git CLI

Use this path when the user gives a GitHub remote URL or has already created the GitHub repository.

```powershell
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

If the remote already exists:

```powershell
git remote -v
git remote set-url origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

### 6. Publish With GitHub CLI

Use this path only when `gh` is installed and authenticated:

```powershell
gh auth status
gh repo create <repo-name> --source . --private --push
```

Use `--public` instead of `--private` only when the user explicitly wants a public repository.

## Safety Rules

- Never run destructive Git commands such as `git reset --hard` or `git clean -fd` unless the user explicitly asks.
- Never commit secrets, tokens, `.env` files, credentials, or generated dependency folders.
- Check `git status --short` before and after staging.
- If the project already has a Git repository, inspect remotes before changing them.
- If authentication or repository visibility is unclear, use GitHub Desktop and let the user confirm the publish dialog.

## Completion Checklist

Before final response, report:

- Whether the local Git repository was initialized.
- Commit hash and commit message, if a commit was created.
- Whether `.gitignore` excludes generated dependencies.
- Whether a remote exists.
- Whether the project was pushed, or what exact GitHub Desktop action remains.
