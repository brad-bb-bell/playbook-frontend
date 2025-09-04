# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development server**: `npm run dev` - Starts the Vite dev server with hot-reload
- **Build for production**: `npm run build` - Creates production build using Vite
- **Preview production build**: `npm run preview` - Preview the production build locally
- **Lint code**: `npm run lint` - Run ESLint with automatic fixes on .vue, .js, .jsx, .cjs, .mjs files
- **Format code**: `npm run format` - Run Prettier on all files in src/ directory

## Architecture Overview

### Technology Stack
- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom configuration and CSS variables
- **UI Components**: shadcn-vue components (located in `src/components/ui/`)
- **Charts**: ApexCharts via vue3-apexcharts, @unovis/vue for data visualization
- **State Management**: Local component state (no global state management library)
- **HTTP Client**: Axios for API calls
- **Icons**: lucide-vue-next

### Project Structure
- `src/App.vue` - Main application component containing the primary UI (sports betting tracker)
- `src/main.js` - Application entry point that mounts Vue app and registers VueApexCharts
- `src/components/ui/` - shadcn-vue UI components (Button, Card, Carousel, Chart, DropdownMenu, Input, Textarea)
- `src/lib/utils.js` - Utility functions including `cn()` for className merging
- `src/assets/` - Static assets and global CSS (index.css)

### Key Configuration Files
- `vite.config.js` - Vite configuration with Vue plugin and path alias (@/ → ./src)
- `tailwind.config.js` - Tailwind CSS configuration with custom theme extensions, fonts (Matemasie, Anek Devanagari), and CSS variables
- `.eslintrc.cjs` - ESLint configuration using Airbnb base, Prettier, Vue3, and accessibility rules
- `components.json` - shadcn-vue configuration for component generation

### Code Conventions
- **Import Aliases**: Use `@/` for src directory imports
- **Component Naming**: PascalCase for Vue components
- **Linting**: Enforces Airbnb style guide with Vue-specific rules
- **Formatting**: Prettier with Tailwind CSS plugin for consistent class ordering
- **File Extensions**: Always include `.vue` extension in imports, never include `.js` extension

### Application Context
This is a sports betting tracker application that allows users to:
- Track bets across different sports and seasons
- View win/loss records and total winnings
- Visualize betting performance with charts
- Browse bets in a carousel interface with filtering options