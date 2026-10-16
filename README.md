# PS09 Adaptive Memory Matching Game

[![CI](https://github.com/example/adaptive-memory-game/actions/workflows/ci.yml/badge.svg)](https://github.com/example/adaptive-memory-game/actions)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729b1b.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Azure](https://img.shields.io/badge/Azure-Static_Web_Apps-0078d4.svg?logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/en-us/products/app-service/static)

An adaptive browser memory matching game built with **React**, **TypeScript**, and **Tailwind CSS**. The game monitors working memory velocity and accuracy, adjusting subsequent rounds based on a transparent, documented rule engine.

---

## 🎯 Minimum Requirements Compliance Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **Initial 4×4 Grid (8 pairs)** | Starts on a baseline 4×4 grid with 8 pairs (16 cards). Configurable across 4 tiers. | ✅ Fulfilled |
| **Reproducible Random Seed** | Mulberry32 PRNG generates deterministic layouts. Custom seeds, preset test seeds, and shareable URLs (`?seed=...`). | ✅ Fulfilled |
| **At Least Two Difficulties** | Four documented tiers: **Casual (3×4, 6p)**, **Standard (4×4, 8p)**, **Expert (4×5, 10p)**, and **Master (6×6, 18p)**. | ✅ Fulfilled |
| **Shuffled Cards & Matching Logic** | Deterministic Fisher-Yates card shuffle with smooth 3D CSS transforms and distinct visual icons. | ✅ Fulfilled |
| **Third Selection Lockout** | `isLocked` guard strictly blocks any 3rd card clicks while two unmatched cards resolve. | ✅ Fulfilled |
| **Repeat & Matched Click Guards** | Clicking the already revealed face-up card or any matched card is safely ignored (no move increments). | ✅ Fulfilled |
| **Active Time Tracking** | High-precision active timer that automatically pauses on window blur or browser tab switch. | ✅ Fulfilled |
| **Documented Thresholds** | Formal mathematical rules evaluating moves and elapsed time to promote, demote, or maintain difficulty. | ✅ Fulfilled |
| **Explainable Adaptation** | Comprehensive win report detailing metrics, rule pass/fail states, and human-readable reasoning. | ✅ Fulfilled |
| **Safe Restart & Timer Reset** | Bumps generation ref and clears in-flight mismatch timeouts, preventing old callbacks from leaking into new rounds. | ✅ Fulfilled |
| **Demonstrations & Automated Checks** | Interactive in-app test suite running live assertions for matches, mismatches, rapid clicks, restart timers, and adaptation. | ✅ Fulfilled |
| **Unit & Integration Tests** | 27 Vitest unit and integration tests covering PRNG, rules, hook state machine, and UI controls. | ✅ Fulfilled |
| **GitHub Actions CI/CD** | Dual-node matrix workflow (`.github/workflows/ci.yml`) with automated typechecking, test execution, and Azure SWA deployment. | ✅ Fulfilled |
| **Azure Hosting Design** | Full cloud design specification (`AZURE_HOSTING.md`), Bicep template (`infra/main.bicep`), and `staticwebapp.config.json`. | ✅ Fulfilled |

---

## 🧠 Documented Performance-Driven Adaptation Matrix

Adaptive difficulty transitions are calculated upon game completion according to this rule matrix:

| Difficulty Tier | Grid Dimensions | Pairs | Promotion Threshold (AND) | Demotion Threshold (OR) | Flip Delay |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **Casual** | 3 × 4 | 6 | Moves ≤ 9 **AND** Time ≤ 22s | *Base Tier (Warm-up Guidance)* | 1100ms |
| **Standard** *(Default)* | 4 × 4 | 8 | Moves ≤ 14 **AND** Time ≤ 32s | Moves ≥ 22 **OR** Time ≥ 65s | 900ms |
| **Expert** | 4 × 5 | 10 | Moves ≤ 18 **AND** Time ≤ 45s | Moves ≥ 28 **OR** Time ≥ 90s | 800ms |
| **Master** | 6 × 6 | 18 | *Peak Tier Reached* | Moves ≥ 50 **OR** Time ≥ 150s | 700ms |

### Explainable Reasoning Output
- **Promotion**: *"Outstanding cognitive velocity! Completed in 12 moves (≤14) and 24.5s (≤32.0s). Upgraded to Expert (4×5 grid, 10 pairs) to sustain optimal cognitive engagement."*
- **Demotion**: *"High cognitive load detected: high move count (24 ≥ 22). Adjusted downward to Casual (3×4 grid, 6 pairs) with a relaxed 1100ms inspection window to rebuild recall confidence."*
- **Maintained**: *"Balanced session: 16 moves and 38.0s fall within the target stability envelope. Retaining Standard tier for reinforcement."*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript 5.5, Tailwind CSS 3.4
- **Icons & Animation**: Lucide React, Canvas Confetti
- **Audio**: Web Audio API (synthetic chimes, zero external MP3/WAV dependencies)
- **State Machine**: Custom `useMemoryGame` React hook with ref-synchronized guards
- **Testing**: Vitest 2.1, React Testing Library, JSDOM
- **Cloud Hosting**: Microsoft Azure Static Web Apps, Azure Bicep, GitHub Actions

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/example/adaptive-memory-game.git
cd adaptive-memory-game

# Install dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running Tests
```bash
# Run Vitest test suite once
npm test

# Run Vitest with live file watching
npm run test:watch
```

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🎮 Game Controls & Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **Tab / Shift+Tab** | Move focus between hidden cards |
| **Enter / Space** | Reveal the focused card |
| **R** | Instant restart (cleans in-flight timers) |
| **P** | Pause / resume game timer |
| **M** | Toggle sound effects on / off |
| **Esc** | Close any open modal dialog |

---

## 🧪 In-Browser Demonstration & Automated Verification Suite

Click the **"Demos & Tests"** button in the top navigation bar to open the built-in verification suite. You can run all 5 checks with a single click:

1. **Demonstrate a Match**: Selects pair A1 and A2, asserting state changes to `matched` and `completedPairs` increments.
2. **Demonstrate a Mismatch & Lockout**: Selects non-matching cards, asserts `isLocked === true` during resolution, and verifies cards flip back to `face-down`.
3. **Rapid Clicks Guard**: Fires 5 consecutive clicks in 50ms while board is locked; asserts that extra clicks are blocked and third selection is impossible.
4. **Restart During Pending Timer**: Schedules a flip-back timeout, triggers `restart()`, and verifies old timers never alter the new round.
5. **Performance-Driven Difficulty Change**: Simulates high-velocity win (triggers promotion) and cognitive strain win (triggers demotion) with explainable reasoning.

---

## ☁️ Azure Deployment

See [AZURE_HOSTING.md](AZURE_HOSTING.md) for full cloud architecture, Bicep templates, and security configurations.
