"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const markdownFileFromUrl = searchParams.get("markdownFile");

  const [markdownContent, setMarkdownContent] = useState("");
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

  const renderMarkdown = async (markdown: string) => {
    // Configure marked.js to use GitHub Flavored Markdown
    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight: function (code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      },
    });

    // Replace '|' with a unique placeholder before marked.js processes it
    const processedMarkdownForPlaceholder = markdown.replace(
      / \| /g,
      ' <span class="separator"></span> '
    );

    let html = marked.parse(processedMarkdownForPlaceholder);
    setMarkdownContent(html);
  };

  const loadAndRenderMarkdown = async (baseFilename: string, lang: string) => {
    const filename = getLanguageFilename(baseFilename, lang);
    try {
      setMarkdownContent("Loading " + filename + "...");
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
          renderMarkdown(markdown);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} for ${filename}`);
      }
      const markdown = await response.text();
      renderMarkdown(markdown);
    } catch (error) {
      console.error("Error loading or rendering markdown:", error);
      setMarkdownContent(
        `<p style="color: red;">Failed to load ${filename}.</p>`
      );
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
        className={isSettingsMenuCollapsed ? "collapsed" : ""}
      >
        <button
          id="settings-toggle-button"
          onClick={() => setIsSettingsMenuCollapsed(!isSettingsMenuCollapsed)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24px"
            height="24px"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
        <div id="settings-content">
          <label htmlFor="font-select">Font:</label>
          <select id="font-select" onChange={handleFontChange} value={selectedFont}>
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
          <div className="language-selector">
            <div className="selected-language">
              <img src="usa-flag.svg" alt="USA Flag" className="flag-icon" />
              <span>English</span>
            </div>
            <ul className="language-options">
              <li data-lang="en" onClick={() => handleLanguageChange("en")}>
                <img src="usa-flag.svg" alt="USA Flag" className="flag-icon" />
                <span>English</span>
              </li>
              <li data-lang="vi" onClick={() => handleLanguageChange("vi")}>
                <img
                  src="vietnam-flag.svg"
                  alt="Vietnam Flag"
                  className="flag-icon"
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
        dangerouslySetInnerHTML={{ __html: markdownContent }}
      ></div>
    </div>
  );
}
