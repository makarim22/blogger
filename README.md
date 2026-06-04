# 🎬 Literary Noir - Digital Media Archives

A premium, brutalist-inspired web application designed for true cinephiles and bibliophiles. Built with a "Literary Noir" aesthetic, this platform elevates the standard movie/book logging experience into an immersive editorial journey.

## ✨ Core Pillars & Features

1. **Dossier & Watchlists (Pilar 1)**
   - Keep a detailed log of your favorite films and books.
   - Save items to your personal watchlist using the robust backend system.
   
2. **"If You Liked This" Recommendations (Pilar 2)**
   - Context-aware recommendations algorithm at the bottom of every review.
   
3. **Cinematic Focus Mode (Pilar 3)**
   - Enter a distraction-free, cinematic full-screen view for long-form reading.
   - Built-in integration with YouTube trailers for instant immersion.

4. **Editorial Immersion (Pilar 4)**
   - **Voice of Noir:** Listen to reviews with built-in Web Speech API audio narration.
   - **Ambient Glow:** Beautiful dynamic CSS backdrop filters adapting to poster art.
   - **Quote Saver:** Highlight text directly on the page to save brilliant excerpts.

5. **Advanced Curation & Stats (Pilar 5)**
   - **Criterion "Three Reasons":** Striking bullet-point summaries dynamically generated.
   - **Personal Mixtapes:** Group your saved archives into custom collections via LocalStorage.
   - **Dossier Stats:** Track your most saved directors/authors and average ratings.

6. **Playful Discovery (Pilar 6)**
   - **Blind Date Roulette:** Let fate choose your next obsession directly from the homepage.
   - **Ambient Soundscapes:** Toggle rain/lo-fi audio while browsing the archives.
   - **Interactive Timeline:** Explore media history through a beautiful vertical timeline.

## 🛠️ Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite
- **Data Fetching:** `@tanstack/vue-query` for intelligent caching and optimistic updates.
- **State Management:** Pinia (Authentication & Global states)
- **Styling:** Vanilla CSS (Noir aesthetics, glassmorphism, Brutalist typography)
- **Routing:** Vue Router
- **SEO & UX:** Unhead (Meta tags), Vue3-Toastify (Notifications)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.
Ensure that the [NestJS Backend API](../nestjs) is running locally on `http://localhost:3000` and the database has been seeded.

### Installation

1. Clone the repository and navigate into the frontend directory:
   ```bash
   cd blogger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`.

## 🔒 Authentication & Data
To unlock Dossier saving, Mixtape creation, and administrative access, log in via the Login portal. Default test credentials can be found in the NestJS backend's `seed_batch4.js` file.

---
*“Laugh, and the world laughs with you. Weep, and you weep alone.”*
