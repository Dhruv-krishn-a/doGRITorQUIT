# gritorquit Desktop Production Pipeline

## 1) One-command local packaging
From repository root:

```bash
pnpm desktop:packages
```

This command will:
- build desktop frontend
- build Tauri Linux bundles (`.deb`, `.rpm`, `.AppImage`) and a native Arch package (`.pkg.tar.zst`)
- build Arch package (`.pkg.tar.zst`) when `makepkg` is available

Artifacts are generated under:
- `apps/desktop/src-tauri/target/release/bundle/`
- `packaging/arch/`

## 2) CI/CD release workflow
Workflow file: `.github/workflows/desktop-release.yml`

Trigger: pushing semantic version tags (`vX.Y.Z`, `vX.Y.Z-beta.N`)

Jobs:
1. `verify`: typecheck/tests/build checks
2. `linux-tauri`: builds `.deb`, `.rpm`, `.AppImage`
3. `arch-pacman`: builds `.pkg.tar.zst` from produced native desktop binary via `makepkg`
4. `publish`: uploads release artifacts and `sha256sum.txt`

## 3) Required GitHub secrets
Set in repository secrets:
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

For updater keypair generation, use Tauri signer tooling and set updater public key in:
- `apps/desktop/src-tauri/tauri.conf.json` (`plugins.updater.pubkey`)

## 4) Environment separation
Desktop env examples:
- `apps/desktop/.env.development.example`
- `apps/desktop/.env.staging.example`
- `apps/desktop/.env.production.example`

Copy the correct file to `.env` in desktop app environment and update domain values.

## 5) Stable/Beta channels
- Stable tags: `vX.Y.Z`
- Beta tags: `vX.Y.Z-beta.N`

Release workflow marks pre-release automatically when tag includes `-`.

## 6) Rollback policy
- Keep at least 2 previous stable releases published.
- If a release regresses, roll back updater target to previous stable tag.
- Preserve checksums for auditability (`sha256sum.txt`).

## 7) Production readiness checklist
- verify installer/uninstaller on Ubuntu/Fedora/Arch
- verify database migrations from previous two versions
- verify offline/online auth flows
- verify PDF export save locations and file permissions
- verify updater from `vN` to `vN+1`
