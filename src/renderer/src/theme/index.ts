/**
 * Omni Controller 主题配置
 * 基于设计系统：Dark Mode (OLED) + 开发者工具风格
 */

export const themeConfig = {
  // 颜色系统
  colors: {
    // 主色调
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryActive: '#1D4ED8',
    
    // 背景色
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    backgroundElevated: '#1A202C',
    
    // 文字色
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textDisabled: '#475569',
    
    // 边框和分割线
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    divider: 'rgba(255, 255, 255, 0.06)',
    
    // 功能色
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // 设备类型颜色
    android: '#10B981',
    ios: '#3B82F6',
    web: '#F59E0B',
  },
  
  // 间距系统
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // 字体系统
  typography: {
    fontFamily: {
      code: '"Fira Code", "Fira Mono", monospace',
      sans: '"Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // 阴影系统
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  },
  
  // 圆角系统
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // 过渡动画
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  
  // 断点
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
}

// Ant Design 主题令牌配置
export const antdThemeTokens = {
  token: {
    // 主色调
    colorPrimary: themeConfig.colors.primary,
    colorPrimaryHover: themeConfig.colors.primaryHover,
    colorPrimaryActive: themeConfig.colors.primaryActive,
    
    // 背景色
    colorBgContainer: themeConfig.colors.background,
    colorBgElevated: themeConfig.colors.backgroundElevated,
    colorBgLayout: themeConfig.colors.background,
    
    // 文字色
    colorText: themeConfig.colors.textPrimary,
    colorTextSecondary: themeConfig.colors.textSecondary,
    colorTextTertiary: themeConfig.colors.textTertiary,
    
    // 边框
    colorBorder: themeConfig.colors.border,
    colorBorderSecondary: themeConfig.colors.divider,
    
    // 功能色
    colorSuccess: themeConfig.colors.success,
    colorWarning: themeConfig.colors.warning,
    colorError: themeConfig.colors.error,
    colorInfo: themeConfig.colors.info,
    
    // 字体
    fontFamily: themeConfig.typography.fontFamily.sans,
    fontFamilyCode: themeConfig.typography.fontFamily.code,
    
    // 圆角
    borderRadius: themeConfig.borderRadius.md,
    borderRadiusLG: themeConfig.borderRadius.lg,
    borderRadiusSM: themeConfig.borderRadius.sm,
    
    // 阴影
    boxShadow: themeConfig.shadows.md,
    boxShadowSecondary: themeConfig.shadows.lg,
  },
  
  components: {
    // Button 组件
    Button: {
      colorPrimary: themeConfig.colors.primary,
      colorPrimaryHover: themeConfig.colors.primaryHover,
      colorPrimaryActive: themeConfig.colors.primaryActive,
      borderRadius: themeConfig.borderRadius.md,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    
    // Card 组件
    Card: {
      colorBgContainer: themeConfig.colors.backgroundSecondary,
      borderRadius: themeConfig.borderRadius.lg,
      colorBorderSecondary: themeConfig.colors.border,
    },
    
    // Input 组件
    Input: {
      colorBgContainer: themeConfig.colors.backgroundTertiary,
      colorBorder: themeConfig.colors.border,
      borderRadius: themeConfig.borderRadius.md,
      controlHeight: 40,
    },
    
    // List 组件
    List: {
      colorSplit: themeConfig.colors.divider,
    },
    
    // Menu 组件
    Menu: {
      colorItemBg: 'transparent',
      colorItemBgHover: 'rgba(255, 255, 255, 0.05)',
      colorItemBgSelected: 'rgba(59, 130, 246, 0.15)',
      colorItemText: themeConfig.colors.textSecondary,
      colorItemTextSelected: themeConfig.colors.primary,
    },
    
    // Tabs 组件
    Tabs: {
      colorBorderSecondary: themeConfig.colors.divider,
      cardBg: themeConfig.colors.backgroundSecondary,
    },
    
    // Tag 组件
    Tag: {
      borderRadius: themeConfig.borderRadius.sm,
    },
    
    // Modal 组件
    Modal: {
      colorBgElevated: themeConfig.colors.backgroundElevated,
      borderRadius: themeConfig.borderRadius.lg,
    },
    
    // Select 组件
    Select: {
      colorBgContainer: themeConfig.colors.backgroundTertiary,
      borderRadius: themeConfig.borderRadius.md,
    },
    
    // Tooltip 组件
    Tooltip: {
      colorBgDefault: themeConfig.colors.backgroundElevated,
      colorTextLightSolid: themeConfig.colors.textPrimary,
    },
  },
}

// 快捷 CSS 变量（用于非 Ant Design 组件）
export const cssVariables = `
  :root {
    /* Colors */
    --color-primary: ${themeConfig.colors.primary};
    --color-primary-hover: ${themeConfig.colors.primaryHover};
    --color-primary-active: ${themeConfig.colors.primaryActive};
    --color-background: ${themeConfig.colors.background};
    --color-background-secondary: ${themeConfig.colors.backgroundSecondary};
    --color-background-tertiary: ${themeConfig.colors.backgroundTertiary};
    --color-text-primary: ${themeConfig.colors.textPrimary};
    --color-text-secondary: ${themeConfig.colors.textSecondary};
    --color-text-tertiary: ${themeConfig.colors.textTertiary};
    --color-border: ${themeConfig.colors.border};
    --color-border-hover: ${themeConfig.colors.borderHover};
    --color-success: ${themeConfig.colors.success};
    --color-warning: ${themeConfig.colors.warning};
    --color-error: ${themeConfig.colors.error};
    
    /* Typography */
    --font-family-code: ${themeConfig.typography.fontFamily.code};
    --font-family-sans: ${themeConfig.typography.fontFamily.sans};
    
    /* Spacing */
    --space-xs: ${themeConfig.spacing.xs}px;
    --space-sm: ${themeConfig.spacing.sm}px;
    --space-md: ${themeConfig.spacing.md}px;
    --space-lg: ${themeConfig.spacing.lg}px;
    --space-xl: ${themeConfig.spacing.xl}px;
    
    /* Shadows */
    --shadow-sm: ${themeConfig.shadows.sm};
    --shadow-md: ${themeConfig.shadows.md};
    --shadow-lg: ${themeConfig.shadows.lg};
    --shadow-glow: ${themeConfig.shadows.glow};
    
    /* Border Radius */
    --radius-sm: ${themeConfig.borderRadius.sm}px;
    --radius-md: ${themeConfig.borderRadius.md}px;
    --radius-lg: ${themeConfig.borderRadius.lg}px;
    
    /* Transitions */
    --transition-fast: ${themeConfig.transitions.fast};
    --transition-normal: ${themeConfig.transitions.normal};
    --transition-slow: ${themeConfig.transitions.slow};
  }
`

export default themeConfig
