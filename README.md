# 💎 Fintech Fusion UI Kit

A premium, design-first UI component library built for modern financial dashboards. 

**🌐 [Live Demo Dashboard](https://akibhasan50.github.io/fusion-fintech-ui-kit/)**


## ✨ Key Features

- **Premium Aesthetics**: Modern glassmorphism, depth-heavy surfaces, and ambient gradients.
- **Universal Dark Mode**: Centralized theme synchronization across all component iframes via URL hash.
- **Standalone Components**: 10+ core components designed with utility-first CSS and Figma-mapped tokens.
- **Interactive Stage**: A built-in "Browser Mock" staging area to preview components in realistic environments.

## 🚀 Getting Started

### View the Dashboard
Simply open the `index.html` file in your favorite browser. No local web server is required as the theme synchronization works perfectly on the `file://` protocol.

```bash
open index.html
```

### Exploring Components
All components are organized within the `components/` directory:
- **Badge / Tag**
- **Button**
- **Card**
- **Checkbox**
- **Input Field**
- **Modal / Dialog**
- **Navigation & Tabs**
- **Select / Dropdown**
- **Slider**
- **Switch / Toggle**

## 🎨 Theme Synchronization

This UI kit uses a custom **Hash-Sync** strategy to communicate themes between the dashboard and its iframes. To include theme support in new components, simply add the following script to your `<head>`:

```html
<script src="../../scripts/theme-sync.js"></script>
```

## 🛠️ Built With

- **HTML5** & **Semantic Layouts**
- **Vanilla CSS** & **Design Tokens**
- **Vanilla JavaScript** (Zero dependencies)

## 📄 License
MIT License - Free for everything.
