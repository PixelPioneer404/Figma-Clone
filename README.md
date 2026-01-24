<div align="center">
  <img src="./assets/app-logo.png" alt="Redesign Logo" width="120" height="120">
  
  # Redesign
  
  ### Create What You Like
  
  A modern, browser-based design tool for creating beautiful designs effortlessly.
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/ecma-262/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
  
</div>

---

## ✨ About

**Redesign** is an intuitive, web-based design application built with vanilla JavaScript that brings the power of visual design tools directly to your browser. With a focus on simplicity and creativity, it provides a seamless canvas experience where you can create, manipulate, and export design elements without the complexity of traditional design software.

Whether you're prototyping UI layouts, creating simple graphics, or just exploring your creative ideas, Redesign offers a clean, distraction-free environment with all the essential tools you need.

---

## 🚀 Features

### Drawing Tools
- **Rectangle Tool** - Create rectangles with customizable dimensions and border radius
- **Circle Tool** - Draw perfect circles or ellipses with independent width/height control
- **Line Tool** - Create lines with adjustable angle and length
- **Text Tool** - Add editable text with custom font sizes (8-200px)
- **Selection Tool** - Select and manipulate existing elements

### Element Manipulation
- **Resize Handles** - Intuitive corner and edge handles for all element types
- **Rotation Handle** - Rotate shapes and text to any angle
- **Drag & Drop** - Smooth repositioning with mouse
- **Arrow Key Movement** - Precise 5-pixel movements with keyboard arrows
- **Canvas Boundaries** - Smart constraints keep elements within the canvas
- **Real-time Dimensions** - Live dimension display during creation and editing

### Properties Panel
- Adjust width, height, and rotation
- Customize fill and stroke colors
- Control stroke width
- Set border radius for rectangles
- Edit text content and font size
- Auto-opens only on element creation for better UX

### Layers Panel
- Visual layer hierarchy with icons
- Reorder layers (move up/down)
- Quick layer selection
- Delete layers
- Z-index based stacking system

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `V` | Selection Tool |
| `R` | Rectangle Tool |
| `C` | Circle Tool |
| `L` | Line Tool |
| `T` | Text Tool |
| `Arrow Keys` | Move selected element (5px) |
| `Delete/Backspace` | Delete selected element |

### Export & Persistence
- **Export to JSON** - Save your design data for later use
- **Export to HTML** - Generate standalone HTML files
- **Auto-save** - Designs persist in LocalStorage
- **Auto-restore** - Resume work exactly where you left off

### User Experience
- Smooth animations and transitions throughout
- Custom-styled scrollbars
- Backdrop blur effects
- Tool tooltips for guidance
- Info modal with app details and credits
- Loading indicators during operations
- Smart UI behavior (prevents interference during interactions)
- Tab-based workflow (Create/Export)

---

## 🛠️ Technologies

**Redesign** is built with modern web technologies:

- **JavaScript (ES6+)** - Modular architecture with clean separation of concerns
- **HTML5** - Semantic markup and canvas elements
- **Tailwind CSS v4** - Utility-first styling with custom theme
- **Remix Icons** - Beautiful icon library
- **LocalStorage API** - Client-side data persistence

### Architecture Highlights
- Modular ES6 imports/exports
- Object-oriented design with dedicated classes
- Event-driven state management
- Bidirectional data binding between UI and canvas
- DOM manipulation with CSS transforms
- Trigonometric calculations for rotation handling

---

## 📦 Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (for ES6 modules to work properly)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajbeersaha/redesign.git
   cd redesign
   ```

2. **Serve the application**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Development Setup

If you want to modify the Tailwind CSS:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build CSS**
   ```bash
   npm run build:css
   ```

3. **Watch for changes**
   ```bash
   npm run watch:css
   ```

---

## 📖 Usage Guide

### Getting Started

1. **Select a Tool** - Click on any tool from the bottom toolbar or use keyboard shortcuts
2. **Draw on Canvas** - Click and drag on the canvas to create elements
3. **Customize Properties** - Use the properties panel on the right to adjust element attributes
4. **Manage Layers** - Use the layers panel on the left to organize your design
5. **Export Your Work** - Switch to the Export tab to save your design

### Creating Elements

**Shapes:**
- Select Rectangle (R), Circle (C), or Line (L) tool
- Click and drag on the canvas
- Release to create the element
- The element is automatically selected with visible handles

**Text:**
- Select Text tool (T)
- Click anywhere on the canvas
- Type your text
- Click outside or press Escape to finish editing

### Editing Elements

**Resize:**
- Select an element
- Drag any of the corner or edge handles
- Hold proportions or stretch freely

**Rotate:**
- Select a shape or text element
- Drag the rotation handle above the element
- Rotate to any angle

**Move:**
- Click and drag an element
- Or use arrow keys for precise 5px movements

**Style:**
- Select an element
- Adjust properties in the right panel
- Changes apply in real-time

### Layer Management

- **Reorder:** Use the up/down arrows in the layers panel
- **Select:** Click on any layer to select it on the canvas
- **Delete:** Use the delete button or Delete/Backspace key

### Exporting

1. Switch to the **Export** tab
2. Choose your format:
   - **JSON** - Preserves all design data
   - **HTML** - Creates a standalone viewable file
3. Click the export button
4. Your file downloads automatically

---

## 🎨 Project Structure

```
redesign/
├── index.html              # Main HTML file
├── app.js                  # Core application logic
├── globals.css             # Global styles and variables
├── input.css               # Tailwind input file
├── output.css              # Compiled Tailwind output
├── assets/
│   ├── app-logo.png        # Application logo
│   └── icons/              # UI icons
└── features/
    ├── deleteElement.js    # Element deletion logic
    ├── export.js           # JSON/HTML export functionality
    ├── handles.js          # Resize and rotation handles
    ├── layersPanel.js      # Layers panel component
    ├── propertiesPanel.js  # Properties panel component
    ├── switchTab.js        # Tab switching logic
    ├── toolsSelect.js      # Tool selection handler
    └── toolsTooltip.js     # Tooltip functionality
```

---

## 🤝 Development Journey

**Time Investment:** 4-6 hours in a focused development session

**Approach:** The project was built using a modular, feature-first approach with an emphasis on clean architecture and user experience. Each feature was implemented as a separate module, making the codebase maintainable and extensible.

**AI Assistance:** Developed with approximately 80-90% AI assistance (GitHub Copilot), which handled implementation details, complex mathematical transformations for rotation handling, and rapid prototyping. The developer focused on architectural decisions, feature requirements, design direction, and iterative refinements.

**Key Challenges Solved:**
- Complex trigonometric calculations for rotated element resizing
- Bidirectional data binding between panels and canvas
- Smart UX patterns (auto-open behavior, boundary constraints)
- Smooth drag operations without UI interference

---

## 👨‍💻 Author

**Rajbeer Saha**

Connect with me:

[![GitHub](https://img.shields.io/badge/GitHub-rajbeersaha-181717?style=flat&logo=github)](https://github.com/rajbeersaha)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-rajbeersaha-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/rajbeersaha)
[![Instagram](https://img.shields.io/badge/Instagram-rajbeersaha-E4405F?style=flat&logo=instagram)](https://www.instagram.com/rajbeersaha)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Remix Icons](https://remixicon.com/) for the beautiful icon library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- The open-source community for inspiration and resources

---

<div align="center">
  
  **Made with ❤️ by Rajbeer Saha**
  
  If you found this project helpful, please consider giving it a ⭐️
  
</div>
