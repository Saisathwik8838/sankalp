/**
 * SANKALP DESIGN TOKENS
 * Source of Truth: Sankalp — design board.html
 * 
 * "A quiet lamp being lit, not a leaderboard."
 */

export const TOKENS = {
  colors: {
    light: {
      bg: '#FFF8EE', // Warm Ivory background
      surface: '#FFFFFF', // Card / surface
      primary: '#E8590C', // Saffron
      primaryDark: '#C2410C', // Deep saffron
      text: '#4A1D12', // Deep sacred maroon
      muted: '#8A6A5C', // Muted earthy brown
      completed: '#3F7D3A', // Sacred green
      missed: '#B4846C', // Clay (never red!)
      line: '#EBD9C5', // Warm line / divider
    },
    dark: {
      bg: '#1A110D', // Charcoal maroon night canvas
      surface: '#251912', // Dark chocolate surface
      primary: '#F0793A', // Lifted luminous saffron (>= 4.5:1 on #1A110D)
      primaryDark: '#F0793A',
      text: '#F6E9DA', // Warm cream text
      muted: '#C4A896', // Stone muted
      completed: '#7DBB77', // Soft bright green
      missed: '#D2A58C', // Luminous clay
      line: '#3A281E', // Dark warm border
    },
  },
  fonts: {
    serif: '"Noto Serif", "Tiro Devanagari Hindi", Georgia, serif',
    sans: 'Inter, "Noto Sans", system-ui, sans-serif',
    devanagari: '"Noto Serif Devanagari", "Tiro Devanagari Hindi", serif',
  },
  fontSizes: {
    counterLarge: '88px',
    numeralHero: '44px',
    ringNumber: '36px',
    statsValue: '32px',
    pageTitle: '28px',
    completionTitle: '26px',
    stepTitle: '24px',
    screenTitle: '22px',
    sheetTitle: '20px',
    devanagariVerse: '20px',
    body: '15px',
    chip: '14px',
    caption: '13px',
    dayNumeral: '12px',
    tabLabel: '11px',
    axisLabel: '10px',
    badgeSub: '9px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    touchMin: '44px',
    btnHeight: '52px',
  },
  radii: {
    full: '999px',
    phone: '36px',
    sheet: '24px',
    card: '16px',
    day: '12px',
    checkbox: '8px',
    diyaArch: '12px 12px 50% 50%',
    circle: '50%',
  },
  shadows: {
    light: '0 2px 10px rgba(74, 29, 18, 0.08)',
    dark: 'none',
    sheet: '0 -8px 30px rgba(0, 0, 0, 0.25)',
  },
};
