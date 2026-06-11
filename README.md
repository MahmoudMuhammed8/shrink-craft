# ShrinkCraft 🚀

ShrinkCraft is a high-performance, privacy-focused batch image compression web application. Built from scratch using React, Node.js, and Tailwind CSS v4, it provides an interface similar to premium tools like iLoveIMG, allowing users to compress multiple images simultaneously and download them individually or bundled inside a single ZIP archive.

## ✨ Features

- **Batch Processing Canvas:** Smooth, responsive drag-and-drop zone supporting mixed multi-file uploads (`.png`, `.jpg`, `.jpeg`, `.webp`).
- **Dynamic Re-compression Configuration:** A global quality slider allowing real-time tuning and immediate processing re-runs on your active queue.
- **Dual-Mode Delivery Engine:** Streamlined single-file asset downloads or unified bundle collection packaging powered by `jszip`.
- **Stateless & Privacy First:** Zero database footprint. Images are processed directly in-memory (RAM) using `sharp` and are immediately destroyed after delivery.
- **Tailwind CSS v4 Engine:** Styled using the latest Tailwind CSS specification utilizing lightning-fast native CSS compilation layers.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js / Express (ES Modules)
- **Image Processor:** Sharp
- **Archive Engine:** JSZip
- **File Middleware:** Multer

---

## 📂 Project Architecture

```text
shrink-craft/
├── shrink-craft-backend/   # Node/Express Service Architecture
│   ├── src/
│   │   ├── controllers/    # Compression Engine Business Logic
│   │   └── routes/         # API Endpoint Definitions
│   └── server.js           # Server Initialization Entry point
└── shrink-craft-frontend/  # React Client Presentation Interface
    ├── src/
    │   ├── components/     # UI Control Dashboards
    │   ├── App.jsx         # Component Wrapper Entry
    │   └── index.css       # Tailwind v4 Unified Stylesheets


1. Clone the Repository
https://github.com/MahmoudMuhammed8/shrink-craft.git
cd shrink-craft


2. Backend Environment Configuration
Navigate into the backend subfolder and install dependencies:

cd shrink-craft-backend
npm install


Create a .env file in the root of shrink-craft-backend/ and add the following environmental variables:

PORT=5000
CLIENT_URL=http://localhost:5173

Fire up the local development engine using Nodemon:

npm run dev


3. Frontend Interface Setup
Open a new terminal window, navigate to the frontend subfolder, and install dependencies:

cd ../shrink-craft-frontend
npm install

Launch Vite's local development server:

npm run dev