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

## PLAN

### Task 1: Update GitHub Actions
- **Subplan 1.1:** `deploy.yml` has been updated to build and deploy the Next.js application.
- **Subplan 1.2:** `generate-pdf.yml` has been updated to use Puppeteer for PDF generation.

### Task 2: Verify Next.js application
- Run `npm run dev` in `cv-nextjs` to ensure the application runs locally without errors.
- Test all functionalities (font selection, language switching, markdown loading, PDF download link, draggable menu).
- Manually test PDF generation using the `generate-pdf.js` script locally.

### Task 3: Clean up (if necessary)
- Remove original `index.html`, `style.css`, and other redundant files from the root directory once the Next.js migration is complete and verified.
