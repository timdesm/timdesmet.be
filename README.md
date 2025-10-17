<div align="center">
  <img src="https://timdesmet.be/img/favicon/web-app-manifest-192x192.png" alt="Tim De Smet" width="120"/>
  <h1>timdesmet.be</h1>
  <p><strong>Personal Portfolio — built with Next.js & GSAP</strong></p>
</div>

---

## 🚀 Overview

This is the source code for **[timdesmet.be](https://timdesmet.be)** — a minimalist, single-page portfolio website built with **Next.js**, **TypeScript**, and **GSAP animations**.  
It showcases my work as a **developer, designer, and entrepreneur**, combining smooth motion design with a performant static build.

---

## 🧩 Tech Stack

- **Next.js** (Static Site Generation & App Router)
- **React 18**
- **TypeScript**
- **GSAP** for animation and scroll interactions
- **SCSS / CSS Modules** for styling
- **Deployed via [Wizzou](https://wizzou.com)**

---

## ⚙️ Development

### Install dependencies

```bash
npm install
# or
yarn install
```

### Run locally

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧱 Project Structure

```
timdesmet.be/
├── app/               # Next.js App Router pages and layout
├── components/        # Reusable React components
├── public/            # Static assets (images, fonts, etc.)
├── styles/            # Global and modular styles
├── utils/             # Helpers and animation setup
└── package.json
```

---

## 🪄 Animations

All scroll-based and entrance animations are powered by **GSAP** and **ScrollTrigger**.  
Animations are lightweight, performant, and trigger only once for visual polish without blocking rendering.

---

## 📦 Deployment

The site is deployed via **[Wizzou](https://wizzou.com)** for optimal performance and CDN edge caching.  
To build and serve manually:

```bash
npm run build
npm run start
```

---

## 👤 Author

**Tim De Smet**  
Software Engineer & Founder of [Wizzou](https://wizzou.com)  
📍 Antwerp, Belgium

---

## 🖼️ License

This project is open source and available under the [MIT License](LICENSE).
