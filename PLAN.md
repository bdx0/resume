# PLAN

## GOAL
Convert the existing `index.html` to a Next.js application and update GitHub Actions.

## DEV NOTES
- Next.js project `cv-nextjs` has been created.
- Static assets (flags, `style.css`) have been copied to `cv-nextjs/public/`.
- `marked` and `prismjs` have been installed in `cv-nextjs`.
- `cv-nextjs/app/layout.tsx` has been updated to include Google Fonts and remove Geist fonts.
- `cv-nextjs/app/globals.css` has been updated to import `style.css` and remove Geist font variables. The dark mode styles have been removed to fix the "đen thui" issue.
- `cv-nextjs/app/page.tsx` has been updated with the content and logic from the original `index.html`, converted to React components and hooks. It now also reads the `markdownFile` query parameter for PDF generation.
- Markdown and PDF files have been copied to `cv-nextjs/public/`.
- `cv-nextjs/next.config.ts` has been updated to enable static export (`output: "export"`) and unoptimized images.
- `.github/workflows/deploy.yml` has been updated to build and deploy the Next.js application from the `cv-nextjs` directory.
- `.github/workflows/generate-pdf.yml` has been updated to use Puppeteer for PDF generation, removing Pandoc/TeX Live, adding Node.js setup, building the Next.js app, installing Puppeteer, and running a custom script (`scripts/generate-pdf.js`).
- `cv-nextjs/scripts/generate-pdf.js` has been created to handle Puppeteer-based PDF generation.
- MDX support has been added to `cv-nextjs`:
    - `next-mdx-remote` has been installed.
    - `@types/prismjs` has been installed to resolve TypeScript errors.
    - `cv-nextjs/next.config.ts` has been configured to support `.md` and `.mdx` file extensions.
    - `cv-nextjs/app/page.tsx` has been updated to use `next-mdx-remote` and `serialize` to render markdown/MDX content, including a custom `CodeBlock` component for PrismJS highlighting, and wrapped with `Suspense` to resolve `useSearchParams` errors during SSR.
    - A `DownloadButton` React component (`cv-nextjs/components/DownloadButton.tsx`) has been created and integrated into `app/page.tsx`'s `MDXRemote` `components` prop, allowing it to be used within MDX files. Its styling has been converted to use Tailwind CSS classes directly within the component.
    - A `Separator` component and mappings for standard HTML elements (`h1`, `h2`, `h3`, `p`, `ul`, `li`, `a`) have been added to `app/page.tsx`'s `MDXRemote` `components` prop, with their styling converted to Tailwind CSS classes.
    - The floating settings menu, language selector, and select elements (`#markdown-selector`, `#font-select`) in `app/page.tsx` have had their styling converted to Tailwind CSS classes.
    - Global `body` styles have been moved to `cv-nextjs/app/layout.tsx` using Tailwind CSS classes.
    - The `#markdown-container` styles have been moved to its `className` in `app/page.tsx` using Tailwind CSS classes.
    - The test MDX page (`cv-nextjs/app/test-mdx/page.tsx`) has been removed as `next-mdx-remote` is now used for dynamic content rendering.
    - `cv-nextjs/public/style.css` has been cleaned up and now only contains scrollbar hiding rules.
    - The scrollbar hiding rules from `cv-nextjs/public/style.css` have been moved to `cv-nextjs/app/globals.css`.
    - `cv-nextjs/app/page.tsx` has been updated to extract `frontmatter` from markdown files using `next-mdx-remote`'s `serialize` function and store it in a state variable (`mdxFrontmatter`).
- Docker, Docker Compose, and Justfile configurations have been added to the project.
    - `cv-nextjs/Dockerfile` has been created for a multi-stage Docker build of the Next.js application.
    - `docker-compose.yml` has been created in the root directory to define the `cv-nextjs` service, map ports, and mount volumes for development. It now includes a `develop` section with `watch` configuration for live reloading.
    - `Justfile` has been created in the root directory with recipes for `build`, `up`, `down`, `rebuild`, `dev`, `shell`, `lint`, `test` using Docker Compose. It now includes a `watch` recipe, and all Docker-related recipes now explicitly set `DOCKER_HOST=ssh://root@nix01`.

## PLAN

### Task 1: Update GitHub Actions
- **Subplan 1.1:** `deploy.yml` has been updated to build and deploy the Next.js application.
- **Subplan 1.2:** `generate-pdf.yml` has been updated to use Puppeteer for PDF generation.

### Task 2: Verify Next.js application
- Run `npm run dev` in `cv-nextjs` to ensure the application runs locally without errors.
- Test all functionalities (font selection, language switching, markdown loading, PDF download link, draggable menu).
- Verify that markdown content on the main page (`http://localhost:3000/`) is rendered correctly using `next-mdx-remote`, including code highlighting.
- Verify the `DownloadButton` component works as expected when used in an MDX file.
- Verify that the `Separator` component renders correctly when using `|` in MDX.
- Verify that front matter is correctly parsed and logged to the console when loading a markdown file.
- Manually test PDF generation using the `generate-pdf.js` script locally.

### Task 3: Verify Docker, Docker Compose, and Justfile
- Run `just build` to build the Docker image.
- Run `just up` to start the Next.js application using Docker Compose.
- Access the application in a web browser at `http://localhost:3000`.
- Run `just dev` to start the development server and verify hot-reloading.
- Run `just lint` and `just test` to ensure linting and tests can be executed within the Docker container.
- Run `just watch` and verify that changes to source files in `cv-nextjs` trigger a sync and potentially a rebuild/restart of the service.
- Run `just down` to stop and remove the Docker Compose services.

### Task 4: Clean up (if necessary)
- Removed original `index.html`, `style.css`, and other redundant files from the root directory.
- All duplicate files have been removed from the root directory.