# 🚀 gritorquit: The Professional Production Release Blueprint

This document explains exactly how to take your project from a single local folder to a professional, global application. It is designed for developers who want to keep their source code private while providing a high-quality, auto-updating experience for users on **Ubuntu, Arch, Fedora, Debian, and Windows**.

---

## 🏗 Phase 1: Git Architecture (Branches & Safety)
**Goal:** Prevent breaking your production website or app while you are actively coding new features.

### 1.1 The Two-Branch System
Currently, you have one branch: `main`. In a production environment, we use two:
1.  **`dev` (Development):** Your "Daily Workspace." You write code, fix bugs, and experiment here. If it crashes, it's fine because the public doesn't see it.
2.  **`main` (Production):** The "Holy Branch." This branch **only** contains code that is tested and ready for the world. Vercel (Web) and GitHub Actions (Desktop) build their apps from this branch.

### 1.2 Step-by-Step Branch Setup
1.  **Create the Dev branch:** Run this in your project root:
    ```bash
    git checkout -b dev
    ```
    *Outcome: You are now on a new branch called `dev`.*
2.  **Push it to GitHub:**
    ```bash
    git push origin dev
    ```
    *Outcome: GitHub now knows about your `dev` branch.*
3.  **How to work from now on:**
    *   Always ensure you are on `dev` before coding: `git checkout dev`.
    *   Commit and push to `dev` normally.
    *   Only move code to `main` when you are ready to "Release."

---

## 📦 Phase 2: The "Ghost" Repository (Code Privacy)
**Goal:** Create a public repo where users can download the app without ever seeing your private source code.

### 2.1 Create the New Repo
1.  Go to [GitHub.com/new](https://github.com/new).
2.  **Repository Name:** `gritorquit-releases`.
3.  **Visibility:** **Public**.
4.  **Crucial:** Do **NOT** upload your source code here. This repository will stay "empty" of code. It will only host the finished "Installers" (.exe, .deb, .AppImage) in the "Releases" section.

### 2.2 Generate the "Secret Handshake" (Access Token)
Your private repo (where the code is) needs permission to upload files to your new public repo.
1.  Go to your **GitHub Profile Settings > Developer Settings > Personal Access Tokens (Classic)**.
2.  Click **Generate New Token**.
3.  **Name:** `gritorquit Release Token`.
4.  **Expiration:** No expiration (or 1 year).
5.  **Scope:** Check the box for **`repo`**.
6.  **Copy the token immediately** (it starts with `ghp_...`). You will never see it again!

---

## 🤖 Phase 3: Infrastructure & Security (Secrets)
**Goal:** Prepare the "Robot" (GitHub Actions) to build and sign your application.

### 3.1 Adding GitHub Secrets
1.  Go to your **Private Repo** (the one with the code) on GitHub.
2.  Click **Settings > Secrets and Variables > Actions**.
3.  Click **New Repository Secret** and add these three:
    *   `RELEASE_TOKEN`: Paste the token from Step 2.2.
    *   `TAURI_SIGNING_PRIVATE_KEY`: Paste the private key you got from `tauri signer generate`.
    *   `TAURI_SIGNING_PASSWORD`: Paste the password you used for that key.

---

## 🌍 Phase 4: Distro-Specific Distribution
**Goal:** Ensure every Linux user can install your app easily.

### 4.1 Ubuntu / Debian / Kali (.DEB)
*   **The File:** `dogrit-planner_1.0.0_amd64.deb`
*   **User Action:** They download the file and double-click it.
*   **Outcome:** The app installs into their system just like Chrome or Discord.

### 4.2 Arch Linux (The AUR)
Arch users prefer "Build Scripts" over raw files.
*   **Your Action:** You (or a community member) create a `PKGBUILD` file.
*   **How it works:** This script tells the computer: "Go to your Public Release repo, download the latest AppImage, and put it in the `/usr/bin` folder."
*   **Outcome:** Arch users type `yay -S dogrit-planner` and they are done.

### 4.3 Fedora / RedHat / SUSE (.AppImage)
*   **The File:** `dogrit-planner_1.0.0_amd64.AppImage`
*   **Why:** These distros use different systems, but **AppImage works on all of them**.
*   **Outcome:** A single file that "just runs" without needing a complex installation.

---

## 🚀 Phase 5: The "Big Launch" Routine
**Goal:** The exact ritual you follow to push an update to your users.

### Step 1: Update the Version Numbers
1.  Open `apps/desktop/src-tauri/tauri.conf.json` and change `"version": "1.0.0"` to `"1.0.1"`.
2.  Open `apps/web/app/api/update/[target]/[version]/route.ts` and change `LATEST_VERSION` to `"1.0.1"`.

### Step 2: Merge Dev to Main
When your code on `dev` is perfect, bring it into `main`:
```bash
git add .
git commit -m "feat: added habit streaks"
git checkout main
git merge dev
git push origin main
```

### Step 3: The "Magic Tag" (Triggers the Robot)
This command tells the GitHub Robot: "Start building the Desktop App now!"
```bash
git tag -a v1.0.1 -m "Launch Version 1.0.1"
git push origin v1.0.1
```

### Step 4: Watch the Robot Work
1.  Go to the **Actions** tab in your GitHub repo.
2.  You will see a job named "Release gritorquit" running.
3.  Once it finishes (5-10 mins), go to your **Public Release Repo**. You will see a new "Release" with all the download links!

---

## 💎 Bonus: How Auto-Updates Work (The Instagram Experience)
1.  The user opens gritorquit v1.0.0.
2.  The app silently checks `https://www.gritorquit.in/api/update/...`.
3.  The server (Vercel) sees the `LATEST_VERSION` is `1.0.1` and sends the download link.
4.  The app shows a popup: **"A new update is available! Restart to install?"**
5.  The user clicks "Yes," and the app updates itself instantly. **No manual downloading required.**

---

## 🛡 Final Security Reminder
Because you are using the **Tauri Rust Bridge** (implemented in `src/lib.rs`), your sensitive logic, database connection details, and internal URLs are compiled into machine code. It is virtually impossible for a user to "decompile" your app to steal your secrets. Your source code remains 100% safe in your private repository.
