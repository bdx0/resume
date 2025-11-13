const puppeteer = require('puppeteer');
const http = require('http');
const serveHandler = require('serve-handler');
const path = require('path');

const PORT = 3000;
const buildDir = path.join(__dirname, '../out'); // Path to the Next.js build output

const markdownFiles = [
  { name: 'resume', filename: 'resume.md' },
  { name: 'cv_fullstack_developer', filename: 'cv_fullstack_developer.md' },
  { name: 'cv_mobile_developer', filename: 'cv_mobile_developer.md' },
];

async function generatePdfs() {
  // Start a static server
  const server = http.createServer((request, response) => {
    return serveHandler(request, response, {
      public: buildDir,
      rewrites: [
        { source: '/:file.md', destination: '/index.html' } // Rewrite markdown file requests to index.html
      ]
    });
  });

  server.listen(PORT, () => {
    console.log(`Running static server at http://localhost:${PORT}`);
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  for (const file of markdownFiles) {
    const url = `http://localhost:${PORT}/?markdownFile=${file.filename}`;
    const pdfPath = path.join(__dirname, `../public/${file.name}.pdf`);

    console.log(`Generating PDF for ${file.filename} from ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Wait for the markdown content to be rendered
      await page.waitForSelector('#markdown-container:not(:empty)', { timeout: 60000 });

      // Optional: Wait for a specific time to ensure all dynamic content is loaded
      await new Promise(resolve => setTimeout(resolve, 2000));

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      });
      console.log(`Generated ${pdfPath}`);
    } catch (error) {
      console.error(`Error generating PDF for ${file.filename}:`, error);
    }
  }

  await browser.close();
  server.close();
  console.log('PDF generation complete.');
}

generatePdfs();
