# Install Firebase Package

## PowerShell Execution Policy Issue

You're seeing this error because PowerShell script execution is disabled on your system.

## Solution 1: Use Command Prompt (Recommended)

1. Open **Command Prompt** (not PowerShell)
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. Navigate to your project:
   ```cmd
   cd d:\vote
   ```

3. Install Firebase:
   ```cmd
   npm install firebase
   ```

## Solution 2: Enable PowerShell Scripts (One-time)

1. Open PowerShell as **Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter
4. Now you can run:
   ```powershell
   npm install firebase
   ```

## Solution 3: Use npx

```powershell
npx npm install firebase
```

## Solution 4: Manual package.json Update

1. Open `package.json`
2. Add to dependencies:
   ```json
   "dependencies": {
     "firebase": "^10.7.1",
     ...other dependencies
   }
   ```
3. Run: `npm install` (in Command Prompt)

## Verify Installation

After installation, check that Firebase is installed:

```bash
npm list firebase
```

You should see: `firebase@10.x.x`

## Next Steps

Once Firebase is installed:

1. ✅ The lint errors will disappear
2. ✅ TypeScript will recognize Firebase types
3. ✅ You can proceed with Firebase setup

See `FIREBASE_QUICKSTART.md` for the next steps!
