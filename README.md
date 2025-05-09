# Em-Dash Processor Web App

A simple, one-page web app for processing and cleaning up text according to editorial rules. Designed for writers, editors, and anyone who needs to quickly standardize em-dashes, punctuation, and common writing issues.

## Features
- **Em-dash normalization:**
  - Replaces em-dashes sentence-by-sentence according to configurable rules.
- **Punctuation correction:**
  - Moves terminal punctuation outside of double quotes and brackets when appropriate.
- **Curly quote replacement:**
  - Converts curly (directional) quotes to straight quotes, with visual highlighting.
- **Warnings:**
  - Highlights and logs common writing issues (e.g., sentence-initial conjunctions, summary clichés, hedging, and professional overkill phrases).
- **Visual highlights:**
  - All changes are visually highlighted (yellow for em-dash, orange for punctuation, blue for straight quotes, red for warnings), but highlights are not included when copying the output text.
- **Processing log:**
  - Sidebar displays warnings and informational messages about the processed text.

## Usage
1. Open `index.html` in your web browser.
2. Paste or type your text into the large text box.
3. Click **Process Text**.
4. View the processed text and any warnings or logs in the sidebar.
5. Copy the cleaned text from the output area—highlights will not be included in your clipboard.

## Customization
- To add or change rules (e.g., warning phrases), edit the `script.js` file.
- To adjust highlight colors, edit the CSS classes in `index.html`.

## Requirements
- No installation or dependencies required. Works in any modern web browser.

## License
MIT License. Free for personal and commercial use. 