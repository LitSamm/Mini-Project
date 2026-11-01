# Anargya ITS

Official website showcase for the Anargya ITS Formula EV research team. The site introduces the team and its GIIAS 2027 plans, presents the Mark 06 electric race car in an interactive 3D viewer, and shares team stories and merchandise.

**Live project repository:** [github.com/LitSamm/Mini-Project](https://github.com/LitSamm/Mini-Project)

## Features

- Responsive homepage with event highlights and team introduction.
- Interactive Mark 06 viewer with 360-degree rotation, zoom, auto-rotate, and reset controls.
- Team updates for upcoming, ongoing, and completed activities.
- Filterable merchandise catalogue with product availability.
- Event and team-story pages.
- Scroll-based reveals and subtle motion that respect reduced-motion preferences.
- Mobile navigation and layouts.

## Pages

| Route | Description |
| --- | --- |
| `/` | Team introduction, GIIAS 2027, Mark 06, team updates, merchandise preview, and track record. |
| `/merchandise` | Merchandise catalogue with category filters and availability information. |
| `/journey/giias-2027` | Information about the team's upcoming GIIAS 2027 journey. |
| `/journey/inside-the-workshop` | A look at the people and work behind the car. |
| `/journey/electric-by-design` | The team's electric motorsport and engineering story. |

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19 and TypeScript
- [Three.js](https://threejs.org/) for the Mark 06 3D viewer
- CSS and [Tailwind CSS](https://tailwindcss.com/)

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/LitSamm/Mini-Project.git
   cd Mini-Project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build locally. Run `npm run build` first. |

## Project structure

```text
src/
  app/                 App Router pages and global styles
  components/          Site sections, navigation, footer, and 3D viewer
  lib/                 Journey and merchandise content
public/
  images/              Site photography, logos, and merchandise images
  models/mark-6/       Mark 06 FBX model and textures
```

Journey content is maintained in `src/lib/journeys.ts`; merchandise items and availability are maintained in `src/lib/merchandise.ts`.

The Mark 06 viewer loads its FBX model and textures from `public/models/mark-6/`. It is loaded when the viewer approaches the viewport to reduce the initial page workload. Drag the model to rotate, scroll to zoom, or use the on-screen controls to auto-rotate and reset the view.

## Author

**LitSamm**

GitHub: [@LitSamm](https://github.com/LitSamm)
