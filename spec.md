# Daily Progress Tracker

## Current State
All app data stored in localStorage via store.tsx. PWA service worker exists. No explicit storage mode or export/import.

## Requested Changes (Diff)

### Add
- storageMode field to AppSettings (default: local)
- storage.ts utility with IndexedDB + localStorage fallback
- Storage section in SettingsTab: Device/Cloud toggle, usage display, Export/Import JSON, Clear All Data

### Modify
- store.tsx: use storage.ts instead of direct localStorage; async init with LOAD_STATE action
- AppSettings + DEFAULT_STATE: add storageMode

### Remove
Nothing.

## Implementation Plan
1. Create src/frontend/src/utils/storage.ts
2. Update store.tsx
3. Update SettingsTab.tsx with Storage section
