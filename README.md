# EPUB & PDF Reader Application

A modern, responsive web application designed for seamlessly reading EPUB ebooks and PDF documents right from your browser. It features customized reading environments, progress tracking, local caching, and adaptive navigation layouts.

---

## 🔑 Key Features

- **Multi-Format Support**: Read both **EPUB** and **PDF** files inside a unified, distraction-free interface.
- **Persistent Reading State**: Automatically saves your last read position, custom font sizes, themes, and layout preferences using IndexedDB and `localStorage`.
- **Customizable Themes**: Toggle effortlessly between multiple color modes designed for different lighting conditions:
  - 🖤 **OLED** (Pure Black)
  - 📜 **Sepia** (Warm, paper-like tone)
  - 🌙 **Night** (Dark Slate Gray)
  - ☀️ **Light** (Classic High Contrast)
- **Flexible Navigation Layout**: Change the navigation bar (`BottomNav`) position dynamically to **Bottom**, **Left**, or **Right** to suit mobile or desktop viewing orientations.
- **Reading Progress Tracking**: Real-time page indicator showing current page numbers and total completion percentage.
- **Responsive Canvas Control**: Intelligent reflow and dynamic canvas resizing whenever navigation bars or screen dimensions change.

---

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **EPUB Engine**: [epubjs](https://github.com/futurepress/epub.js)
- **Storage**: [idb-keyval](https://github.com/jakearchibald/idb-keyval) (IndexedDB) & Web `localStorage`
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)