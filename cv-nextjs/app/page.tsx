"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Prism from "prismjs"; // Keep Prism for custom code component
import DownloadButton from "../components/DownloadButton"; // New import

// Custom component for code blocks to apply PrismJS highlighting
const CodeBlock = ({ children, className }: { children: string; className?: string }) => {
  const language = className?.replace(/language-/, "") || "markup";
  const highlightedCode = Prism.highlight(children, Prism.languages[language], language);
  return (
    <pre className={className}>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
};

// Custom Separator component
const Separator = () => <span className="border-l border-gray-300 self-stretch mx-4 min-h-[1.5em]"></span>;

// Simple React components for HTML tags
const H1 = ({ children }: { children: React.ReactNode }) => <h1 className="text-4xl font-bold text-black">{children}</h1>;
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="text-2xl font-bold mt-6 mb-2 text-black">{children}</h2>;
const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="text-xl font-bold text-black">{children}</h3>;
const P = ({ children }: { children: React.ReactNode }) => <p className="my-2">{children}</p>;
const UL = ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-5 my-0 mb-4">{children}</ul>;
const LI = ({ children }: { children: React.ReactNode }) => <li className="mb-1">{children}</li>;
const A = ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href} className="no-underline text-black hover:underline">{children}</a>;


const components = {
  pre: (props: any) => <CodeBlock {...props} />,
  code: (props: any) => {
    // If code is inline, render it as is. If it's part of a pre, CodeBlock handles it.
    if (props.className && props.className.startsWith('language-')) {
      return null; // Handled by CodeBlock
    }
    return <code {...props} />;
  },
  DownloadButton, // Add DownloadButton component
  Separator, // Add Separator
  h1: H1, // Map h1 to H1 component
  h2: H2, // Map h2 to H2 component
  h3: H3, // Map h3 to H3 component
  p: P,   // Map p to P component
  ul: UL, // Map ul to UL component
  li: LI, // Map li to LI component
  a: A,   // Map a to A component
  // Add other custom components here if needed
};

function HomeContent() {
  const searchParams = useSearchParams();
  const markdownFileFromUrl = searchParams.get("markdownFile");

  const [mdxSource, setMdxSource] = useState<any>(null); // State to store serialized MDX
  const [mdxFrontmatter, setMdxFrontmatter] = useState<any>({}); // State to store extracted frontmatter
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedMarkdownFile, setSelectedMarkdownFile] = useState(
    markdownFileFromUrl || "resume.md"
  );
  const [selectedFont, setSelectedFont] = useState("Times New Roman, serif");
  const [isSettingsMenuCollapsed, setIsSettingsMenuCollapsed] = useState(true);

  // Function to get the language-specific filename
  const getLanguageFilename = (baseFilename: string, lang: string) => {
    if (lang === "en") {
      return baseFilename.replace(".md", "_en.md");
    } else if (lang === "vi") {
      return baseFilename.replace(".md", "_vi.md");
    }
    return baseFilename; // Fallback to original if no language or unknown language
  };

  const loadAndRenderMarkdown = async (baseFilename: string, lang: string) => {
    const filename = getLanguageFilename(baseFilename, lang);
    try {
      setMdxSource(null); // Clear previous content
      setMdxFrontmatter({}); // Clear previous frontmatter
      const response = await fetch(filename);
      if (!response.ok) {
        // If language-specific file not found, try fallback to base filename
        if (filename !== baseFilename) {
          console.warn(
            `Language-specific file ${filename} not found, trying ${baseFilename}`
          );
          const fallbackResponse = await fetch(baseFilename);
          if (!fallbackResponse.ok) {
            throw new Error(
              `HTTP error! status: ${fallbackResponse.status} for both ${filename} and ${baseFilename}`
            );
          }
          const markdown = await fallbackResponse.text();
          const { compiledSource, frontmatter } = await serialize(markdown, { parseFrontmatter: true });
          setMdxSource({ compiledSource });
          setMdxFrontmatter(frontmatter);
          console.log("Frontmatter:", frontmatter);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} for ${filename}`);
      }
      const markdown = await response.text();
      const { compiledSource, frontmatter } = await serialize(markdown, { parseFrontmatter: true });
      setMdxSource({ compiledSource });
      setMdxFrontmatter(frontmatter);
      console.log("Frontmatter:", frontmatter);
    } catch (error: any) {
      console.error("Error loading or rendering markdown:", error);
      setMdxSource(await serialize(`<p style="color: red;">Failed to load ${filename}.</p>`));
      setMdxFrontmatter({});
    }
  };

  useEffect(() => {
    // Initialize language from localStorage or default to 'en'
    const storedLanguage = localStorage.getItem("selectedLanguage") || "en";
    setSelectedLanguage(storedLanguage);

    // If markdownFileFromUrl is present, it takes precedence
    const initialMarkdownToLoad = markdownFileFromUrl || selectedMarkdownFile;
    loadAndRenderMarkdown(initialMarkdownToLoad, storedLanguage);
  }, [markdownFileFromUrl, selectedMarkdownFile]);

  useEffect(() => {
    document.body.style.fontFamily = selectedFont;
  }, [selectedFont]);

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMarkdownFile = event.target.value;
    setSelectedMarkdownFile(newMarkdownFile);
    loadAndRenderMarkdown(newMarkdownFile, selectedLanguage);
  };

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFont(event.target.value);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("selectedLanguage", lang);
    loadAndRenderMarkdown(selectedMarkdownFile, lang);
  };

  const updatePdfDownloadLink = (markdownFilename: string, lang: string) => {
    const pdfDownloadLink = document.getElementById("pdf-download-link");
    if (pdfDownloadLink) {
      const pdfFilename = getLanguageFilename(markdownFilename, lang).replace(
        ".md",
        ".pdf"
      );
      pdfDownloadLink.setAttribute("href", pdfFilename);
      pdfDownloadLink.setAttribute("download", pdfFilename);
    }
  };

  useEffect(() => {
    updatePdfDownloadLink(selectedMarkdownFile, selectedLanguage);
  }, [selectedMarkdownFile, selectedLanguage]);

  // Drag and drop functionality for the floating settings menu
  useEffect(() => {
    const settingsMenu = document.getElementById("floating-settings-menu");
    const settingsToggleButtonForDrag = document.getElementById(
      "settings-toggle-button"
    );

    let isDragging = false;
    let offsetX: number, offsetY: number;
    let currentX: number, currentY: number;
    let hasDragged = false;

    function getEventXY(event: MouseEvent | TouchEvent) {
      if (event.type.startsWith("touch")) {
        return {
          x: (event as TouchEvent).touches[0].clientX,
          y: (event as TouchEvent).touches[0].clientY,
        };
      } else {
        return {
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        };
      }
    }

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      hasDragged = false;
      const menuRect = settingsMenu?.getBoundingClientRect();
      if (menuRect) {
        const eventXY = getEventXY(e);
        currentX = menuRect.left;
        currentY = menuRect.top;
        offsetX = eventXY.x - currentX;
        offsetY = eventXY.y - currentY;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchmove", onMouseMove);
        document.addEventListener("touchend", onMouseUp);
      }
    };

    const onMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !settingsMenu) return;

      hasDragged = true;

      const eventXY = getEventXY(event);
      currentX = eventXY.x - offsetX;
      currentY = eventXY.y - offsetY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const menuWidth = settingsMenu.offsetWidth;
      const menuHeight = settingsMenu.offsetHeight;

      const minX = 0;
      const maxX = viewportWidth - menuWidth;
      const minY = 0;
      const maxY = viewportHeight - menuHeight;

      currentX = Math.max(minX, Math.min(currentX, maxX));
      currentY = Math.max(minY, Math.min(currentY, maxY));

      settingsMenu.style.left = `${currentX}px`;
      settingsMenu.style.top = `${currentY}px`;
      settingsMenu.style.right = "auto";
      settingsMenu.style.bottom = "auto";
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
    };

    settingsToggleButtonForDrag?.addEventListener("mousedown", onMouseDown);
    settingsToggleButtonForDrag?.addEventListener("touchstart", onMouseDown);

    return () => {
      settingsToggleButtonForDrag?.removeEventListener("mousedown", onMouseDown);
      settingsToggleButtonForDrag?.removeEventListener("touchstart", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, []);

  return (
    <div>
      <div
        id="floating-settings-menu"
        className={`fixed top-5 right-5 z-50 bg-white border border-gray-300 rounded-lg shadow-md p-2.5 flex flex-col gap-2.5 ${
          isSettingsMenuCollapsed ? "p-0 border-none shadow-none" : ""
        }`}
      >
        <button
          id="settings-toggle-button"
          onClick={() => setIsSettingsMenuCollapsed(!isSettingsMenuCollapsed)}
          className="bg-blue-500 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-sm self-end"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24px"
            height="24px"
            className="w-6 h-6 fill-white"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
        <div id="settings-content" className={`flex flex-col gap-2.5 ${isSettingsMenuCollapsed ? "hidden" : ""}`}>
          <label htmlFor="font-select">Font:</label>
          <select
            id="font-select"
            onChange={handleFontChange}
            value={selectedFont}
            className="px-4 py-2 border border-gray-300 rounded-md text-base bg-gray-100 cursor-pointer h-10 appearance-none focus:border-blue-500 focus:outline-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%20viewBox%3D%220%200%20292.4%20292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2C197.9L159.3%2C69.2c-3.7-3.7-9.7-3.7-13.4%2C0L5.4%2C197.9c-3.7%2C3.7-3.7%2C9.7%2C0%2C13.4l13.4%2C13.4c3.9%2C3.9%2C10.1%2C3.9%2C14%2C0l116.8-116.8l116.8%2C116.8c3.9%2C3.9%2C10.1%2C3.9%2C14%2C0l13.4-13.4C290.7%2C207.6%2C290.7%2C201.6%2C287%2C197.9z%22%2F%3E%3C%2Fsvg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '12px',
              paddingRight: '30px',
            }}
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Calibri, sans-serif">Calibri</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Montserrat, sans-serif">Montserrat</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="Aptos, sans-serif">Aptos</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Open Sans, sans-serif">Open Sans</option>
            <option value="Lato, sans-serif">Lato</option>
            <option value="Raleway, sans-serif">Raleway</option>
            <option value="Jetbrains Mono, monospace">Jetbrains Mono</option>
            <option value="Hasklig, monospace">Hasklig</option>
            <option value="Tektur, sans-serif">Tektur</option>
            <option value="Cambria, serif">Cambria</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Garamond, serif">Garamond</option>
            <option value="Palatino, serif">Palatino</option>
          </select>
          <label htmlFor="language-select">Language:</label>
          <div className="relative cursor-pointer">
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-gray-100">
              <img src="usa-flag.svg" alt="USA Flag" className="w-5 h-3.5 mr-2" />
              <span>English</span>
            </div>
            <ul className="hidden absolute top-full left-0 w-full border border-gray-300 border-t-0 rounded-b-md bg-white list-none p-0 m-0 z-10">
              <li data-lang="en" onClick={() => handleLanguageChange("en")} className="flex items-center px-4 py-2 hover:bg-gray-200">
                <img src="usa-flag.svg" alt="USA Flag" className="w-5 h-3.5 mr-2" />
                <span>English</span>
              </li>
              <li data-lang="vi" onClick={() => handleLanguageChange("vi")} className="flex items-center px-4 py-2 hover:bg-gray-200">
                <img
                  src="vietnam-flag.svg"
                  alt="Vietnam Flag"
                  className="w-5 h-3.5 mr-2"
                />
                <span>Tiếng Việt</span>
              </li>
            </ul>
          </div>
          <label htmlFor="markdown-selector">CV Type:</label>
          <select
            id="markdown-selector"
            onChange={handleMarkdownChange}
            value={selectedMarkdownFile}
            className="px-4 py-2 border border-gray-300 rounded-md text-base bg-gray-100 cursor-pointer h-10 appearance-none focus:border-blue-500 focus:outline-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%20viewBox%3D%220%200%20292.4%20292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2C197.9L159.3%2C69.2c-3.7-3.7-9.7-3.7-13.4%2C0L5.4%2C197.9c-3.7%2C3.7-3.7%2C9.7%2C0%2C13.4l13.4%2C13.4c3.9%2C3.9%2C10.1%2C3.9%2C14%2C0l116.8-116.8l116.8%2C116.8c3.9%2C3.9%2C10.1%2C3.9%2C14%2C0l13.4-13.4C290.7%2C207.6%2C290.7%2C201.6%2C287%2C197.9z%22%2F%3E%3C%2Fsvg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '12px',
              paddingRight: '30px',
            }}
          >
            <option value="resume.md">RESUME</option>
            <option value="cv_fullstack_developer.md">
              Fullstack Developer CV
            </option>
            <option value="cv_mobile_developer.md">Mobile Developer CV</option>
          </select>
          <a id="pdf-download-link" href="#" download className="download-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download CV (PDF)
          </a>
        </div>
      </div>
      <div
        id="markdown-container"
        className="markdown-body max-w-3xl mx-auto" // Add markdown-body class for styling
      >
        {mdxSource ? (
          <MDXRemote {...mdxSource} components={components} />
        ) : (
          <div>Loading MDX content...</div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}