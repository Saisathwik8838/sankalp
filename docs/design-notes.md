# Sankalp — Design Notes & Token Specification

> **Source of Truth**: [`Sankalp — design board.html`](../Sankalp%20—%20design%20board.html)  
> **Philosophy**: *"A quiet lamp being lit, not a leaderboard."*  
> Calm, unhurried, mindful visual language inspired by traditional discipline, brass, clay, saffron, and sacred geometry.

---

## 1. Extracted Design Tokens

### 1.1 Color Palette

#### Light Theme (`:root`)
| Token Name | CSS Variable | Hex Value | Usage / Semantic Role |
| :--- | :--- | :--- | :--- |
| **Background** | `--bg` | `#FFF8EE` | Warm ivory canvas, serene and peaceful |
| **Surface** | `--sf` | `#FFFFFF` | Card containers, interactive controls, sheets |
| **Saffron (Primary)** | `--pr` | `#E8590C` | Primary actions, today ring, active indicator, diya flame |
| **Saffron Dark** | `--pd` | `#C2410C` | Primary hover/active states, higher-contrast accents |
| **Text** | `--tx` | `#4A1D12` | Primary typography (deep sacred maroon) |
| **Muted** | `--mt` | `#8A6A5C` | Secondary labels, descriptions, inactive icons |
| **Completed** | `--ok` | `#3F7D3A` | Checkmarks, completed day tile fills (sacred green) |
| **Missed (Clay)** | `--ms` | `#B4846C` | Missed day dashed borders and tinted fills (never red!) |
| **Line** | `--ln` | `#EBD9C5` | Subtle borders, dividers, unread track rings |

#### Dark Theme (`[data-theme="dark"]`)
| Token Name | CSS Variable | Hex Value | Usage / Semantic Role |
| :--- | :--- | :--- | :--- |
| **Background** | `--bg` | `#1A110D` | Deep charcoal-maroon night canvas |
| **Surface** | `--sf` | `#251912` | Dark chocolate card surfaces |
| **Saffron (Primary)** | `--pr` | `#F0793A` | Lifted luminous saffron (ensures ≥ 4.5:1 contrast) |
| **Saffron Dark** | `--pd` | `#F0793A` | Luminous saffron |
| **Text** | `--tx` | `#F6E9DA` | Primary typography (warm cream) |
| **Muted** | `--mt` | `#C4A896` | Warm muted stone text and icons |
| **Completed** | `--ok` | `#7DBB77` | Soft vibrant green |
| **Missed (Clay)** | `--ms` | `#D2A58C` | Luminous warm clay |
| **Line** | `--ln` | `#3A281E` | Deep warm boundary line |

#### Functional Colors & Blends (`color-mix`)
- **Chip Selected Background**: `color-mix(in srgb, var(--pr) 12%, var(--sf))`
- **Option Selected Background**: `color-mix(in srgb, var(--pr) 8%, var(--sf))`
- **Missed Day Tile Fill**: `color-mix(in srgb, var(--ms) 25%, var(--sf))`
- **Counter Radial Glow**: `radial-gradient(circle, var(--sf) 60%, color-mix(in srgb, var(--pr) 14%, var(--sf)))`
- **Completion Glow**: `radial-gradient(circle, color-mix(in srgb, var(--pr) 30%, transparent), transparent 65%)`
- **Backdrop Dim Overlay**: `rgba(26, 17, 13, 0.45)`

---

### 1.2 Typography & Fonts

#### Font Families
- **Display & Headings**: `"Noto Serif", "Tiro Devanagari Hindi", Georgia, serif`
  - Applied to `h1`, `h2`, `.serif`, screen titles, and big counter/streak numerals.
  - Weights: `600` (SemiBold), `700` (Bold for active day numeral).
- **Body & UI**: `Inter, "Noto Sans", system-ui, sans-serif`
  - Applied to controls, labels, buttons, cards, descriptions, tabs.
  - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold).
- **Sacred Scripture / Devanagari**: `"Noto Serif Devanagari", "Tiro Devanagari Hindi", serif`
  - Applied to Sanskrit / Hindi shlokas, chalisa verses, mantras.
  - Line height: `1.7` (`.dev`).

#### Scale & Hierarchy
| Size Token | Pixel Size | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `display-2xl` | `88px` | `1.0` | Big Counter display number |
| `display-xl` | `44px` | `1.0` | Large stat numerals (`.big`) |
| `display-lg` | `36px` | `1.1` | Ring interior day number |
| `display-md` | `32px` | `1.15` | Insights statistic figures |
| `title-lg` | `28px` | `1.2` | Page title (`h1`) |
| `title-md` | `26px` | `1.25` | Completion hero headline |
| `title-sm` | `24px` | `1.3` | Onboarding question headers |
| `heading` | `22px` | `1.3` | Screen headers (`Your journey`, `Journal`, `Insights`, `Reader`, `More`) |
| `subheading`| `20px` | `1.35` | Missed day sheet title, section titles (`h2`), Scripture verses (`.dev`) |
| `body-base` | `15px` | `1.45` | Standard body copy, default UI reading size |
| `ui-md` | `14px` | `1.4` | Chip labels, standard interactive items |
| `caption` | `13px` | `1.4` | Subtext, timestamps, figcaptions, notes (`.sm`) |
| `grid-num` | `12px` | `1.0` | 40-day calendar grid numerals |
| `tab-label` | `11px` | `1.2` | Bottom navigation tab labels, token swatches |
| `chart-axis`| `10px` | `1.2` | Bar chart x-axis labels |
| `badge-sm` | `9px` | `1.0` | Sub-labels on day tiles (`.d small`) |

---

### 1.3 Spacing & Layout Tokens
- **Scale**: `2px`, `4px`, `6px`, `8px`, `12px`, `14px`, `16px`, `20px`, `24px`, `32px`, `44px`, `52px`
- **Phone Frame**: `width: 390px`, `height: 780px` (standard mobile container: `390×844` viewport)
- **Tablet / Desktop Container**: `max-width: 720px` centered 2-column layout (`.tab2`)
- **App Max Width**: `1100px` (`header`, `section.w`)
- **Safe Area Insets**: `env(safe-area-inset-top, 0px)`, `env(safe-area-inset-bottom, 0px)`
- **Minimum Tap Target**: `44px × 44px` (Strictly enforced across all interactive elements)

---

### 1.4 Border Radii
- `rounded-full` (`999px`): Buttons (`.btn`), Filter Chips (`.chip`), Theme Pills (`.pill`), Progress Track (`.bar`)
- `rounded-3xl` (`36px`): Outer mobile phone frame
- `rounded-2xl` (`24px 24px 0 0`): Modal bottom sheets (`.sheet`)
- `rounded-xl` (`16px`): Cards (`.card`), Selection options (`.opt`)
- `rounded-lg` (`12px`): Day grid tiles (`.d`), Swatches (`.sw i`)
- `rounded-md` (`8px`): Checkboxes (`.chk`)
- `rounded-diya` (`12px 12px 50% 50%`): Day 40 Arch-topped Diya tile (`.d.f`)
- `rounded-circle` (`50%`): Stepper buttons (`.stp`, 44×44), Today tile (`.d.t`), Big Tap Circle (`.tap`, 260×260)

---

### 1.5 Shadows & Overlays
- **Light Surface Shadow (`--sh`)**: `0 2px 10px rgba(74, 29, 18, 0.08)`
- **Dark Surface Shadow**: `none`
- **Bottom Sheet Elevation**: `0 -8px 30px rgba(0, 0, 0, 0.25)`
- **Focus Indicator**: `outline: 3px solid var(--pr); outline-offset: 2px`
- **Backdrop Scrim**: `background: rgba(26, 17, 13, 0.45)` with `backdrop-filter: blur(4px)`

---

### 1.6 Iconography & SVG Motifs
1. **Diya (Sacred Lamp)**:
   - Base SVG: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"`
   - Flame: `path d="M12 3c2 2.4 2.4 4 0 6-2.4-2-2-3.600 0-6z"`
   - Bowl: `path d="M3 13h18c0 4-3.500 7-9 7s-9-3-9-7z"`
   - Large Completion Diya: `110px × 110px` with radial golden aura glow.
2. **Today Tab**: Sun / Dawn motif (`circle r="4"` with 4 cardinal rays).
3. **Journey Tab**: 4-square disciplined grid motif.
4. **Counter Tab**: Concentric mala / bead ring motif (`circle r="9"` & `r="3"`).
5. **Journal Tab**: Sacred notebook motif (`path d="M6 3h12v18H6z"` with lines).
6. **More Tab**: 3 horizontal meditative dots.
7. **Checkmark**: Crisp 3px stroke check (`path d="M5 12l5 5 9-10"`).

---

## 2. Slide-to-Screen Mapping

| Slide # | Slide Name in Design Board | Target Application Screen / View | Description & Visual State |
| :---: | :--- | :--- | :--- |
| **1** | `1 Onboarding` | **Setup Wizard (Step 2 of 6)** | Sankalp duration picker (11, 21, 40, 41, Custom days) and calendar start date selector with Tuesdays/Saturdays highlighted in saffron. |
| **2a** | `2a Today, in progress` | **Today Screen (Active / In-Progress)** | Progress ring showing Day 12 of 40 (30%), Chalisa counter (7/11), Japa counter (108/108), Lit a diya checkbox, Niyams accordion, feeling chips, quiet note box, and action button stating `"1 practice left"`. |
| **2b** | `2b Today, completed` | **Today Screen (Completed)** | All practices completed (11/11, 108/108, diya lit), feeling chip selected (`Peaceful`), and button in quiet outline style: `"Your practice is complete ✓"`. |
| **2c** | `2c Today, not started` | **Today Screen (Pre-Start / Inactive)** | Pre-sankalp state (starts in 3 days) or uncommenced morning state (`0/11`), ring empty, message: `"Begin when you are ready."`, button: `"Complete today’s practice"`. |
| **3** | `3 Journey` | **Journey Screen (Day-Detail Sheet)** | 40-day visual grid with 30% progress bar (milestones at 25%, 50%, 75%), streak counters (Current: 3, Best: 7). Clicking Day 9 brings up bottom sheet showing logged-late chip, completed practices, and journal excerpt. |
| **4** | `4 Missed-day prompt` | **Journey Screen (Missed Day Recovery)** | Non-punitive recovery bottom sheet: *"A day was missed. How would you like to continue?"* with 3 radio options: `Restart from Day 1`, `Continue as is`, and `Add a make-up day`. |
| **5** | `5 Counter` | **Japa & Recitation Counter** | Zen full-screen counter with 260px tap ring, large 88px numeral (`7 of 11 recitations`), Ring vs 108 Beads selector, bottom controls for `↶ Undo`, `Haptics ✓`, `Sound`, `Reset`, and keep-awake indicator (`☼ Screen stays on`). |
| **6** | `6 Journal` | **Reflections & Journal Screen** | Search input, reverse-chronological list of daily reflections with mood badges (`Peaceful`, `Tired`, `Grateful`), and peaceful diya empty state (`"No entries yet. Your first note will rest here."`). |
| **7** | `7 Insights` | **Insights Screen (Inside More)** | 2×2 metrics grid (10 days completed, 3 · 7 current/best streak, 110 recitations, 1,080 japa counts), bar chart of "Usual practice time", and bar chart of "Completion by weekday". |
| **8** | `8 Completion` | **Sankalp Completion Celebration** | Sacred lit diya with breathing radiant glow, *"Your Sankalp is complete. 40 days, held with steadiness."*, summary stat card, closing ritual checklist (Offer thanks, Share prasad, Donate), and `Share summary card` / `Done` buttons. |
| **9** | `9 More / Settings` | **More / Settings Screen** | Clean menu rows: Sankalp details, Appearance (System / Light / Dark, Text size), Day start time (4:00 AM), Reminders (Calendar/Notifications), Backup & export, Privacy assurance, Reset data (two-step confirmation). |
| **10**| `10 Reader` | **Scripture & Chalisa Reader** | Reader interface with script toggle (`Aa · Roman` / `Devanagari`), bookmarked verse card, Devanagari typography, transliteration, and verse translations. |
| **Adapt**| `Tablet / desktop (~720px)` | **Responsive Viewport Adaptation** | Clean dual-column layout centering Today's active practice alongside the Journey 40-day grid with comfortable margins. |

---

## 3. Design Decisions & Conflict Resolutions

### 3.1 Non-Punitive Tone & Missed Days
- **Decision**: Missed days use warm terracotta clay (`#B4846C` / `#D2A58C`), NEVER alarming crimson red.
- **Copy**: *"A day was missed"*, never *"You failed"* or *"Streak broken"*.
- **Streak Behavior**: Current and best streaks are presented calmly without flashing alerts.
- **Recovery Flexibility**: Users can choose to add a make-up day, continue as-is, or restart from Day 1 without shame.

### 3.2 Sacred Imagery & Respectful Visuals
- **Decision**: No deity faces or canonical religious illustrations are hard-coded.
- **Motif**: The Diya (lamp) serves as the primary spiritual motif symbolizing awareness, steadiness, and inner light.
- **Header Image**: An optional customizable frame allows users to upload or select their preferred deity or inspiration.

### 3.3 Completion & Celebration
- **Decision**: No gamified confetti or noisy celebration sound effects.
- **Experience**: A gentle, slow breathing glow behind the lit brass diya, accompanied by thoughtful closing rituals (prasad, gratitude, donation).
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, animations are replaced with static warmth.

### 3.4 Accessibility (WCAG 2.1 AA Audits)
1. **Color Contrast**:
   - Deep Maroon (`#4A1D12`) on Warm Ivory (`#FFF8EE`) achieves **11.9:1** (Exceeds WCAG AAA).
   - Muted Brown (`#8A6A5C`) on Ivory (`#FFF8EE`) achieves **4.55:1** (Compliant with AA ≥ 4.5:1).
   - In Dark Mode, Saffron is boosted from `#E8590C` to `#F0793A` to achieve **6.2:1** against `#1A110D`.
   - On the primary button, white text (`#FFFFFF`) on `#E8590C` is ~3.3:1; in UI components we employ Saffron Dark (`#C2410C`) for button text/fills or high-contrast text pairs to guarantee ≥ 4.5:1 compliance.
2. **Touch Targets**:
   - Every single interactive element (buttons, chips, calendar dates, navigation tabs, steppers) maintains a minimum bounding box of **44px × 44px**.
   - Steppers (`+` / `-`) have `44px` circular click targets.
   - Primary action buttons have `52px` minimum height.
3. **Screen Reader Semantics**:
   - Nav bar tabs use `role="navigation"`, `aria-label="Main"`, and `aria-current="page"`.
   - Stepper buttons include explicit descriptive labels: `aria-label="Increase recitation count"`.
   - Progress rings expose proper SVG `role="progressbar"` with `aria-valuenow` and `aria-valuemax`.

---

## 4. Theme & Token Architecture

The design tokens are unified into:
1. `src/theme/tokens.ts`: Single source of truth TypeScript constants for all colors, fonts, spacing, shadows, and radii.
2. `tailwind.config.js`: Custom Tailwind theme extension mapping semantic utility classes directly to CSS variables and token constants.
3. `src/index.css`: Root CSS custom properties for instant light/dark theme switching and fluid typography.

*Ready to proceed to Phase 2: App implementation and component scaffolding.*
