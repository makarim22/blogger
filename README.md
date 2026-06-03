# 🎬 My Media Log - Frontend

A beautifully designed, modern web application for tracking your personal media consumption (Movies and Books). Built with Vue 3, Vite, and cutting-edge frontend architecture.

## ✨ Features

- **Media Tracking:** Keep a detailed log of the movies you watch and the books you read, complete with star ratings and reviews.
- **Premium UX:** Enjoy fluid micro-animations and page transitions powered by Vue's `<TransitionGroup>`.
- **Lightning Fast:** Uses **TanStack Vue Query** for seamless data fetching, intelligent caching, and background synchronization.
- **Robust State:** Global authentication state managed safely with **Pinia**.
- **SEO Optimized:** Dynamic meta tags and document titles via **Unhead**.
- **Beautiful Feedback:** Elegant toast notifications for success and error states using **Vue3-Toastify**.

## 🛠️ Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite
- **Data Fetching:** `@tanstack/vue-query`
- **State Management:** Pinia
- **Styling:** Vanilla CSS (Glassmorphism & Gradients)
- **Routing:** Vue Router

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
Ensure that the [NestJS Backend API](../nestjs) is also running locally on `http://localhost:3000`.

### Installation

1. Clone the repository and navigate into the directory:
   ```bash
   cd blogger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`.

## 🔒 Authentication
To modify, add, or delete media, you must log in via the "Admin Login" portal. This communicates securely with the backend via JWT. 

*Note: Default credentials can be found in the backend's seed file.*

## 📜 License
This project is open-source and available under the MIT License.
