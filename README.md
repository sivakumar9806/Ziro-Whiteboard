# 🎨 Miro Clone — Collaborative Whiteboard

A high-performance, modern infinite whiteboard web application inspired by Miro, built with **React**, **TypeScript**, **Vite**, and pure CSS glassmorphism.

![Miro Clone Whiteboard](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Features

### 1. 🌐 Infinite Canvas & Navigation
- **Infinite Dot-Grid**: Dynamically scaling SVG dot-grid background.
- **Smooth Panning**: `Space + Drag`, `Middle Click Drag`, Hand/Pan Tool (`H`), or two-finger trackpad panning.
- **Cursor-Anchored Zooming**: Mouse wheel and pinch zoom (10% to 400%), plus bottom-right preset zoom controls (`-`, `+`, `% presets`, `Fit to Content`, `Reset 100%`).
- **Interactive Minimap**: Live thumbnail overview of all board elements with click-to-navigate viewport frame.

### 2. 📝 Rich Object System
- **Pastel Sticky Notes (`S`)**: 6 curated Miro color themes (Yellow, Coral Pink, Sky Blue, Mint Green, Lavender, Warm Amber) with realistic shadows, top strips, corner fold effects, and double-click in-place editing.
- **Shapes (`R`, `O`)**: Rectangles (rounded corners, dashed/solid stroke) and Circles/Ellipses with customizable fill, border, and centered editable text.
- **Arrows (`A`)**: Vector arrows with directional arrowheads, solid/dashed styling, and draggable endpoint handles.
- **Freehand Drawing (`P`)**: Quadratic spline-smoothed pen with variable stroke thickness and color palette.
- **Standalone Typography (`T`)**: Text boxes with custom font size, text alignment, and colors.
- **Eraser (`E`)**: Quick click/drag element removal.

### 3. 🎯 Manipulation & Selection
- **Multi-Selection**: Click to select, `Shift + Click` multi-select, and lasso/box marquee drag selection.
- **Transformations**: 8 bounding box resize handles, rotation, and smooth multi-object dragging.
- **Contextual Floating Property Bar**: Pops up directly above selected objects with real-time palette swatches, stroke widths, text alignment, layer ordering (`Bring Forward` / `Send Backward`), and duplicate (`Ctrl+D`).

### 4. ⏳ History & Local Persistence
- **Undo / Redo Stack**: State snapshot history with `Ctrl+Z` and `Ctrl+Y` (or `Cmd+Z` / `Cmd+Shift+Z`).
- **LocalStorage Sync**: Automatic debounced saving with live `Saved` / `Saving...` indicator.
- **Import & Export**:
  - Export as high-resolution **PNG image**.
  - Export & import full **JSON board files**.
- **Pre-built Templates**: One-click starter boards (Kanban Sprint Board, Brainstorming Mind Map, Retrospective).

---

## ⌨️ Keyboard Shortcuts

| Key | Tool / Action |
|---|---|
| `V` | Select Tool |
| `H` | Hand / Pan Canvas |
| `S` | Sticky Note Tool |
| `R` | Rectangle Shape Tool |
| `O` or `C` | Circle / Ellipse Tool |
| `A` | Arrow Connection Tool |
| `P` | Freehand Pen Tool |
| `T` | Text Box Tool |
| `E` | Eraser Tool |
| `Space + Drag` | Pan Viewport |
| `Wheel / Pinch` | Zoom In / Out |
| `Ctrl + +` / `Ctrl + -` | Zoom In / Out |
| `Ctrl + 0` | Reset Zoom (100%) |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Ctrl + A` | Select All |
| `Ctrl + D` | Duplicate Selected |
| `Delete` / `Backspace` | Delete Selected |
| `Shift + Click` | Multi-select Toggle |
| `Escape` | Deselect All |
| `?` | Keyboard Shortcuts Modal |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/miro-clone.git
cd miro-clone

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory.

---

## 🚢 Deploying to Netlify

1. Push this repository to your **GitHub** account.
2. Go to [Netlify](https://app.netlify.com/) and log in.
3. Click **Add new project** → **Import an existing project** → **GitHub**.
4. Select your `miro-clone` repository.
5. Set the build configuration:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy site**! 🎉

---

## 📄 License
MIT
