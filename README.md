# Gryns – Hydroponic Tower Tracker

Mobile-first PWA for tracking hydroponic towers and plant pods. Built with React, Vite, Tailwind CSS, and Dexie (IndexedDB).

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For production:

```bash
npm run build
npm run preview
```

## Structure

- **`/src/components/ui`** – Atomic UI (Button, Input, Select, Card)
- **`/src/components/features`** – SplashScreen, Dashboard, TowerView, PodDetail, OnboardingFlow
- **`/src/context`** – TowerContext (towers, pods, isInitialized)
- **`/src/hooks`** – useOnboardingState
- **`/src/db`** – Dexie schema (towers, pods)
- **`/src/data`** – Plant library for onboarding

## Flow

1. **Splash** (5s) → DB has towers? **Dashboard** : **Onboarding**
2. **Onboarding** – 6 steps: tower count → plant → slot → date → photo (optional) → NFC placeholder → Dashboard
3. **Dashboard** – Towers in columns; tap a tower → pod list
4. **Pod detail** – Photo, stage, “It Sprouted!” (etc.), inline edit name/slot/date with Save

## Tech

- React 18, React Router 6, TypeScript
- Tailwind (dark, mobile-first), lucide-react
- Dexie.js for IndexedDB, vite-plugin-pwa for PWA
