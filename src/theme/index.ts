// Netwify Design System - Theme Configuration

export const colors = {
    // Primary - Dark Purple
    // Primary - Dark Purple
    primary: {
        50: '#ECEBFA',
        100: '#D5D2EB',
        200: '#BDB9DD',
        300: '#9E97CA', // Neutral/Text
        400: '#8A84BC',
        500: '#756EAE',
        600: '#48426D', // Main Primary
        700: '#3A3557',
        800: '#2C2842',
        900: '#1E1B2D',
    },

    // Secondary - Soft Peach / Orange
    secondary: {
        50: '#FDF8F3',
        100: '#FAEDDF',
        200: '#F7E2CB', // Light Orange
        300: '#F9DCC4', // Peach (My QR Background - Tweaked)
        400: '#F2CCA3',
        500: '#F0C38E', // Main Secondary
        600: '#D8AF80',
        700: '#C09C72',
        800: '#A88963',
        900: '#907555',
    },

    // Accent - Salmon
    accent: {
        500: '#F2A090', // Main Accent (Scan QR Background - Tweaked)
        600: '#D9998B',
    },

    // Neutral Colors (Lavender/Grey tones)
    neutral: {
        50: '#FAFAFA', // Background
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9E97CA', // Using the provided Neutral/Text color
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#48426D', // Using primary

    // Background Colors
    background: {
        primary: '#FAFAFA', // New background color
        secondary: '#FFFFFF',
        tertiary: '#F4F4F5',
    },

    // Text Colors
    text: {
        primary: '#48426D', // Using Primary for main text based on design
        secondary: '#9E97CA', // Using Neutral for secondary text
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
    },

    // Border Colors
    border: {
        light: '#E5E7EB',
        medium: '#D1D5DB',
        dark: '#9E97CA',
    },
};

export const typography = {
    fontFamily: {
        primary: 'System',
        mono: 'monospace',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
};

export const borderRadius = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        elevation: 1,
    },
    md: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 2,
    },
    lg: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        elevation: 4,
    },
};

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
};

export type Theme = typeof theme;
export default theme;
