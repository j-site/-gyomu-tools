# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A collection of static HTML/JS browser tools for Crastore (Japanese construction company). No build step, no package manager, no framework. Each tool is a single self-contained HTML file.

**Tools:**
- `estimate.html` — Estimate (見積書) / Invoice (請求書) PDF generator — **implemented**
- Expense management (経費管理) — planned
- Site management (現場管理) — planned

## Running locally

```bash
python3 -m http.server 8765
# Open http://localhost:8765
```

## Architecture: single-file pattern

Each tool (`estimate.html`, future `expense.html`, etc.) is fully self-contained:
- Inline `<style>` — all CSS including `@media print`
- Inline `<script>` — all logic; no external JS libraries
- Assets (logo, QR code) embedded as base64 `data:` URIs so the file works offline and as a direct file open

## estimate.html internals

**State object** — the `data` const at the top of `<script>` is the source of truth for pre-filled content. Editing `data` is the intended way to pre-populate a document programmatically.

**Rendering pipeline:**
1. `bindField()` wires header fields (date, client, doc number, etc.) to `data` via `contenteditable` divs
2. `renderRows()` builds the line-item `<tbody>` from `data.items`, attaches `input` listeners
3. `recalc()` re-totals every row (qty × price, or direct `amount`), updates subtotal/tax/grand total
4. `fitSheet()` scales the 794px A4 sheet to fit the viewport (CSS `transform: scale()`); disabled in `@media print`

**Mode switching** (`setMode('estimate'|'invoice')`) adds `mode-estimate` or `mode-invoice` to `<body>`. Elements with `.only-estimate` / `.only-invoice` are shown/hidden purely via CSS rules keyed on that class.

**Print/PDF output** is triggered by `window.print()`. The `@media print` block removes the toolbar, resets the scale transform, and sets `@page { size: A4; margin: 0; }`.

## Key conventions

- **Language**: UI, comments, and company data are in Japanese
- **Currency/locale**: `toLocaleString("ja-JP")` for number formatting; tax default is 10% (`taxRate`)
- **A4 width**: 794px at 96 DPI — don't change without verifying print output
- **Brand colors**: navy `#497B9F` / `#2c5f8a`, orange `#e6622d`
- **Adding a new tool**: follow the single-file pattern; link it from `index.html`; embed any image assets as base64
- **Changing logo or QR**: re-encode the image to base64 and replace the `src` attribute in the relevant `<img>` tag inside the HTML
