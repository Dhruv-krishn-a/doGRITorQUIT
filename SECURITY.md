# Security Analysis & Threat Model

This document outlines the security architecture, identified vulnerabilities, and recommended mitigations for the gritorquit ecosystem.

## 1. Executive Summary
The system relies on a hybrid trust model:
*   **Web/Mobile:** High trust in server-side validation; frontend is untrusted.
*   **Desktop:** Mixed trust. The application performs offline enforcement using a JWT-based lease, but implementation weaknesses currently allow for license cracking and offline abuse.

---

## 2. Identified Vulnerabilities

### V1: Offline Activation Bypass (License Cracking)
*   **Description:** The desktop application enforces a 48-hour offline lease using a JWT token stored in a local SQLite database (`offline_lease`). The React-based enforcement layer (`OfflineProvider.tsx`) decodes the token using `atob()` but **never verifies the HMAC signature**.
*   **Exploit:**
    1.  Interrogate the local SQLite database `planner.db`.
    2.  Locate the JWT in the `offline_lease` table.
    3.  Manually construct a JWT payload with an inflated `dur` (duration) or `exp` (expiry) claim.
    4.  Update the database with this forged token.
    5.  The application will accept the token as valid because the client-side code only reads the payload and does not verify its integrity against the secret.
*   **Severity:** **Critical** (Bypasses monetization and allows permanent offline usage).
*   **Fix:**
    *   **Short-term:** Embed the `OFFLINE_TOKEN_SECRET` (or a public key if using RSA/Ed25359) in the desktop binary (obfuscated) and perform signature verification in the Rust core before passing entitlements to the frontend.
    *   **Long-term:** Move enforcement logic entirely into the Rust layer (Tauri Commands) and only expose "feature-allowed" booleans to the UI.

### V2: System Clock Manipulation
*   **Description:** The 48-hour offline limit calculation relies on `Date.now()` in the JavaScript layer.
*   **Exploit:** An attacker can disconnect from the internet and manually set their system clock back by 24 hours every day to prevent the lease from ever expiring.
*   **Severity:** **High** (Trivial to execute on Linux/macOS/Windows).
*   **Fix:** Use a monotonic clock or retrieve system uptime via Tauri's Rust layer. Compare the delta of system uptime against the lease start time rather than absolute wall-clock time.

### V3: Weak Device Fingerprinting
*   **Description:** The `deviceId` used for token generation is a SHA-256 hash of the `User-Agent` string (`apps/web/app/api/auth/offline-token/route.ts`).
*   **Exploit:** An attacker can easily spoof the `User-Agent` header using `curl` or a proxy to generate multiple offline tokens for different "devices" from a single machine, or share a single token across multiple machines with the same browser configuration.
*   **Severity:** **Medium**.
*   **Fix:** Use a true hardware ID (e.g., Motherboard UUID or MAC address) retrieved via a Tauri Rust command and sent during the token request.

### V4: Sync Engine Poisoning (Local Database Manipulation)
*   **Description:** The `SyncEngine` (`apps/desktop/src/services/sync.engine.ts`) reads from a local `sync_queue` table and executes actions on the server.
*   **Exploit:** If a user has a "Free Tier" account but modifies their local `planner.db` to include sync items for premium features (e.g., `SAVE_WEEKLY_REFLECTION`), the engine will attempt to sync these.
*   **Severity:** **Medium** (Relies on server-side validation strength).
*   **Mitigation:** The server-side domain services (e.g., `packages/domain/study/service.ts`) currently check ownership, but they must also rigorously verify `checkFeatureAccess` on *every* sync action.

### V5: Unprotected Local Storage
*   **Description:** The `planner.db` SQLite file is stored in plaintext in the user's application data directory.
*   **Exploit:** Sensitive user data, study notes, and the offline lease token are readable by any other process or user on the system.
*   **Severity:** **Medium**.
*   **Fix:** Implement SQLCipher or a similar encryption layer for the Tauri SQL plugin, using a key derived from a machine-specific secret.

### V6: Plaintext Frontend Assets
*   **Description:** The AppImage bundles the entire React frontend in plaintext. 
*   **Exploit:** An attacker can unpack the AppImage (`--appimage-extract`), modify the JavaScript logic (e.g., remove the `if (!isPremium)` check), and repack it.
*   **Severity:** **Medium**.
*   **Fix:**
    *   Integrate `javascript-obfuscator` into the Vite build.
    *   Implement **Binary Integrity Checks**: The Rust layer should compute a hash of the `index.html` and main JS bundles at startup and compare it against a hardcoded hash.

---

## 3. Security Recommendations

### A. Secure License Validation
*   **Don't Trust the Frontend:** Move the "Can this user use X?" logic from `OfflineProvider.tsx` into a Tauri Rust Command. 
*   **Signed Entitlements:** The server should return a signed JSON blob. The Rust core should verify the signature using an embedded public key.

### B. Payment Workflow Hardening
*   **Strict Idempotency:** While `_activateSubscription` checks for `providerSubId`, the `verify` endpoint should have a rate limit per-user to prevent brute-forcing `razorpay_order_id`.
*   **Webhook Priority:** Always prefer the server-to-server webhook (`payment.captured`) for activation rather than the client-side `verify` call.

### C. Anti-Cracking Strategy
*   **Symbol Stripping:** Ensure `NO_STRIP=1` is **removed** in production builds to make reverse engineering harder. (Currently set to `1` in `apps/desktop/package.json`).
*   **Runtime Integrity:** The Rust setup should check if it's being debugged (e.g., `ptrace` check on Linux) and refuse to run.

---

## 4. Threat Model Summary

| Threat | Target | Likelihood | Impact |
| :--- | :--- | :--- | :--- |
| **License Cracking** | Desktop Offline Lease | High | High (Monetization Loss) |
| **Data Forgery** | Sync Engine | Medium | Medium (Data Corruption) |
| **Privacy Breach** | Local SQLite DB | Low | Medium (Personal Data Leak) |
| **Replay Attack** | Payment API | Low | High (Financial Loss) |

---
*Last Updated: March 2026*
