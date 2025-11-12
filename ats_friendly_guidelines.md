# ATS-Friendly Resume Guidelines (Design Tokens)

These guidelines serve as "design tokens" for creating an Applicant Tracking System (ATS)-friendly resume, focusing on structure, formatting, and content to ensure optimal parsability by automated systems.

## 1. Structure & Layout Tokens:

*   **`layout-type`**: `single-column`
    *   *Description*: Strictly adhere to a single-column layout. Avoid multi-column designs which can confuse ATS.
*   **`section-order`**: `chronological-reverse`
    *   *Description*: List work experience, education, etc., from most recent to oldest.
*   **`header-placement`**: `body-content`
    *   *Description*: Place contact information and your name within the main body of the resume, not in headers or footers, as ATS may not always read these sections.
*   **`spacing-consistency`**: `standard`
    *   *Description*: Maintain consistent line spacing and paragraph breaks throughout the document.

## 2. Typography Tokens:

*   **`font-family-primary`**: `[Arial, Calibri, Times New Roman, Georgia, Tahoma, Trebuchet, Verdana]`
    *   *Description*: Select one professional, widely recognized, and easy-to-read font from this list.
*   **`font-size-body`**: `11pt` | `12pt`
    *   *Description*: Use for the main body text to ensure readability.
*   **`font-size-heading`**: `14pt` | `16pt`
    *   *Description*: Use for section headings to provide clear hierarchy.
*   **`font-weight-heading`**: `bold`
    *   *Description*: Section headings should be bolded for emphasis.
*   **`text-alignment`**: `left`
    *   *Description*: All text should be left-aligned for standard readability.

## 3. Content & Formatting Tokens:

*   **`section-headings`**: `[Work Experience, Education, Skills, Summary, Certifications, Projects, Awards]`
    *   *Description*: Use only standard, universally recognized section titles. Avoid creative or unique headings.
*   **`bullet-style`**: `[solid-circle, open-circle, square]`
    *   *Description*: Use simple, standard bullet points for lists of accomplishments and responsibilities. Avoid intricate or custom bullet characters.
*   **`date-format`**: `[MM/YYYY, Month YYYY]`
    *   *Description*: Maintain a consistent date format (e.g., "01/2020" or "January 2020") and place dates immediately adjacent to the corresponding entry.
*   **`keyword-integration`**: `natural`
    *   *Description*: Integrate relevant keywords and phrases directly from the job description naturally into your experience and skills sections.
*   **`avoid-graphics`**: `true`
    *   *Description*: Do not include images, charts, graphs, icons, or other visual elements.
*   **`avoid-tables`**: `true`
    *   *Description*: Do not use tables or text boxes, as these can often be misinterpreted by ATS.
*   **`avoid-special-characters`**: `true`
    *   *Description*: Avoid unusual symbols, accented characters, or emojis that could be misinterpreted.
*   **`file-format-preference`**: `[docx, pdf-ats-optimized]`
    *   *Description*: Save your resume as a .docx file. If a PDF is required, ensure it is a truly ATS-optimized PDF (often created by saving directly from a word processor, not scanning).

## 4. Language & Tone Tokens:

*   **`language-clarity`**: `concise-direct`
    *   *Description*: Use clear, concise, and direct language.
*   **`action-verbs`**: `strong-impactful`
    *   *Description*: Start bullet points with strong action verbs.
*   **`proofreading-standard`**: `error-free`
    *   *Description*: Thoroughly proofread for any spelling, grammar, or punctuation errors.