export const theme = {
  // COLORS
  colors: {
    // Primary brand colors
    mainColor: '#679FD6',
    mainColorYellow: '#FEE688',
    logoYellow: '#FCCA3A',
    logoBlue: '#0162BB',  
    logoTeal: '#02B0C2',
    // Text colors
    mainFont: '#333333',
    placeholderText: "#333333 opacity 0.6",
    // Background colors
    white: '#FFFFFF',
    lightGrey: '#F5F5F5',
    
    // Button colors
    mainButton: '#FED539',  
    secondaryButton: '#E7F8FF',

    // Status colors
    error: '#DA1C1C',
    successGreen: '#02C268',
    warningOrange: '#FF9800',
    
    // Misc
    adviceGreen: '#02B0C2 opacity 0.6',
    labelBackground: '#FCCA3A opacity 0.5',
    
  },

   // TYPOGRAPHY
  typography: {
    fontFamily: "'Inter', sans-serif",
    
    // Font sizes
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
      '5xl': '36px',
    },
     // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    // Line heights
    lineHeight: {
      regular: 1,
      normal: 1.4,
      relaxed: 1.5,
    },
  },

   // BORDER RADIUS
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '50%',
  },

  // SHADOWS
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.2)',
    xl: '0 10px 40px rgba(0, 0, 0, 0.2)',
    focus: {
      default: '0 0 0 3px rgba(1, 98, 187, 0.1)',
      error: '0 0 0 3px rgba(218, 28, 28, 0.1)',
    },
  },
  // TRANSITIONS
  transitions: {
    fast: '0.15s ease',
    default: '0.2s ease',
    slow: '0.3s ease',
    
    // Specific transitions
    button: 'border-color 0.2s ease',
    input: 'border-color 0.2s ease, box-shadow 0.2s ease',
    opacity: 'opacity 0.2s ease',
    transform: 'transform 0.2s ease',
    all: 'all 0.2s ease',
  },

  // Z-INDEX
  zIndex: {
    overlay: 1000,
    sideMenu: 1001,
    modal: 1100,
    toast: 2000,
    extreme: 3000,
  },

  // BREAKPOINTS
  breakpoints: {
    md: '768px',
    lg: '1024px',
  },

  // OPACITY VALUES
  opacity: {
    overlay: 0.3,
    overlayDark: 0.5,
    muted: 0.6,
    subtle: 0.7,
    hover: 0.8,
    full: 1.0,
    
  },

  // GRADIENTS
  gradients: {
    primary: 'linear-gradient(180deg, #679FD6 0%, #FEE688 100%)',
    card: 'linear-gradient(180deg, #679FD6, #FEE688)',
  },

  // RGBA HELPERS
  rgba: {
    blueLight: 'rgba(231, 248, 255, 0.5)',
    blueHover: 'rgba(1, 98, 187, 0.05)',
    blueFocus: 'rgba(1, 98, 187, 0.1)',
    yellowHover: 'rgba(254, 202, 58, 0.1)',
    tealBadge: 'rgba(2, 176, 194, 0.15)',
    errorBg: 'rgba(218, 28, 28, 0.1)',
    successBg: 'rgba(76, 175, 80, 0.15)',
    deleteBg: 'rgba(244, 67, 54, 0.15)',
    blackOverlay: 'rgba(0, 0, 0, 0.3)',
    blackOverlayDark: 'rgba(0, 0, 0, 0.5)',
    blackHover: 'rgba(0, 0, 0, 0.05)',
  },
};

// MEDIA QUERY HELPERS
export const media = {
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  
};