# Spacecoin Orbitport Integration Demo

## 🌌 Project Title: **Cosmic Launch Lottery — Orbitport Integration Demo**

### 🎯 Objective:

Build a web2 client-side application that demonstrates the use of **Orbitport’s `cTRNG` cosmic randomness API** by letting users participate in a space-themed lottery where they "launch" to a random planet. The experience will feel cosmic, interactive, and lay the foundation for future extensions like trait generation and NFTs.

---

## 🚀 Phase 1: **Cosmic Launch Lottery MVP (Orbitport Integration)**

### ✨ User Flow:

1. User visits the site and sees a cosmic-themed interface with a spaceship and a “Launch” button.
2. On clicking "Launch," a request is made (via backend proxy) to Orbitport's `cTRNG` endpoint to fetch a true random number.
3. The number determines the planet the spaceship "lands" on.
4. The planet is revealed with its name and rarity.
5. A short animation (e.g. rocket launch or zoom through stars) enhances immersion.
6. Add an "About" section explaining that the number is sourced from **real satellites in orbit** (cEDGE/Crypto2).

### 🔧 Tech Stack (Easily spun up & reproducable):

- **Frontend**: NextJS + TailwindCSS
- **Backend**: Next.js API route (to proxy Orbitport API & hide keys)
- **Randomness Source**: Orbitport's `cTRNG` API
- **Deployment**: Vercel

### 📊 Planet Mapping:

- 100 pre-defined planets (Planet #1 to Planet #100)
- Each has:
  - Name (e.g. “Xylon-8”)
  - Rarity tier: Common, Rare, Legendary
  - Image/icon
  - Optional lore/flavor text

### 🎨 Visual Design:

- Starry galaxy background
- Neon glowing buttons
- Planet artwork (use placeholder assets or generated ones)
- Mini animations

---

## 🧪 Phase 2 (Optional Extension): **Cosmic Trait Generation**

- Use additional random bits to generate planet traits:
  - Color
  - Ring system
  - Number of moons
  - Surface
  - Size (Gravity)
- Visuals update dynamically based on these traits
- Traits saved locally, but demonstrates further use case of `cTRNG`

---

## 🪙 Phase 3 (Stretch Goal): **Mint to NFT**

- After landing on a planet, user can “claim” it
- Mint metadata = planet ID + traits
- Integrate a simple wallet flow (e.g. MetaMask or AA like Thirdweb)
- Testnet of choice

---

## 🗓️ Timeline

| Day       | Task                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| **Day 1** | Finalize design, planet list, API contract, and backend proxy setup          |
| **Day 2** | Implement backend + Orbitport API integration; test randomness fetching      |
| **Day 3** | Build main UI: rocket launch button, loading animation, planet reveal screen |
| **Day 4** | Hook up backend with frontend, test full flow                                |
| **Day 5** | Polish animations, add lore text & UI styling                                |
| **Day 6** | Optional additions (e.g. rarity coloring, share button, About section)       |
| **Day 7** | Final deployment + written content                                           |

---

## 📦 Deliverables (for this phase)

- Deployed web app with working launch & planet reveal
- GitHub repo with README and setup instructions
- Short written explanation on how cosmic randomness is used
