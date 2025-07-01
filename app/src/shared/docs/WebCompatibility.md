# Web Compatibility Guide

This guide explains how the UNextDoor theme system has been made web-compatible while maintaining full mobile functionality.

## 🌐 Web Compatibility Features

### 1. **Font Loading**
- **Mobile**: Uses Expo Font loading with TTF files
- **Web**: Uses Google Fonts CDN with CSS imports
- **Fallback**: System fonts if Montserrat fails to load

### 2. **Screen Dimensions**
- **Mobile**: Uses React Native Dimensions API
- **Web**: Uses window.innerWidth/innerHeight with fallbacks
- **SSR Safe**: Provides default values for server-side rendering

### 3. **Platform Detection**
- Automatic platform detection using `Platform.OS`
- Different font families for web vs mobile
- Web-specific CSS injection

## 📁 File Structure

```
app/src/shared/
├── styles/
│   ├── modernTheme.js          # Main theme (web compatible)
│   ├── darkTheme.js            # Dark theme (web compatible)
│   ├── webFonts.css           # Web font definitions
│   └── globalStyles.js        # Global web styles
├── utils/
│   ├── fontUtils.js           # Font loading utilities
│   └── webConfig.js           # Web configuration utilities
└── docs/
    └── WebCompatibility.md    # This file
```

## 🔧 Implementation Details

### Font Loading Strategy

**Mobile (iOS/Android):**
```javascript
// Uses Expo Font with TTF files
await Font.loadAsync({
  'Montserrat-Light': require('../../assets/fonts/Montserrat-VariableFont_wght.ttf'),
  'Montserrat-Regular': require('../../assets/fonts/Montserrat-VariableFont_wght.ttf'),
  // ... other weights
});
```

**Web:**
```javascript
// Uses Google Fonts CDN
const FONTS = {
  MONTSERRAT_LIGHT: 'Montserrat, sans-serif',
  MONTSERRAT_REGULAR: 'Montserrat, sans-serif',
  // ... other weights
};
```

### Screen Dimensions

**Cross-Platform Safe:**
```javascript
const getScreenDimensions = () => {
  try {
    const { width, height } = Dimensions.get("window");
    return { width, height, /* breakpoints */ };
  } catch (error) {
    // Web fallback
    const width = typeof window !== "undefined" ? window.innerWidth : 375;
    const height = typeof window !== "undefined" ? window.innerHeight : 667;
    return { width, height, /* breakpoints */ };
  }
};
```

## 🎨 Brand Colors (Web Compatible)

All brand colors work consistently across platforms:

```css
:root {
  --color-primary: #6FC935;    /* C59 M0 Y100 K0 / R111 G201 B53 */
  --color-secondary: #003366;  /* C100 M80 Y0 K20 / R0 G51 B102 */
  --color-tertiary: #000000;   /* C0 M0 Y0 K100 / R0 G0 B0 */
  --color-white: #FFFFFF;
}
```

## 🔤 Font Weights (Web Compatible)

All Montserrat weights are available on both platforms:

| Weight | Mobile Font | Web Font | CSS Weight |
|--------|-------------|----------|------------|
| Light | Montserrat-Light | Montserrat | 300 |
| Regular | Montserrat-Regular | Montserrat | 400 |
| Medium | Montserrat-Medium | Montserrat | 500 |
| SemiBold | Montserrat-SemiBold | Montserrat | 600 |
| Bold | Montserrat-Bold | Montserrat | 700 |
| ExtraBold | Montserrat-ExtraBold | Montserrat | 800 |

## 🚀 Usage Examples

### Basic Text Component
```jsx
import Text from '../components/typography/Text';

// Works on both web and mobile
<Text weight="semibold" color="primary.500">
  Brand Text
</Text>
```

### Theme Usage
```jsx
import { useTheme } from '../context/ThemeContext';

const { theme } = useTheme();

// Cross-platform styles
const styles = {
  container: {
    backgroundColor: theme.colors.primary[500],
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.lg,
  }
};
```

## 🔧 Setup Instructions

### 1. Web Font Loading
Add to your web entry point:
```javascript
import { initializeWebConfig } from '../shared/utils/webConfig';

// Initialize web configuration
await initializeWebConfig();
```

### 2. CSS Import (Optional)
For additional web styling:
```html
<link rel="stylesheet" href="./src/shared/styles/webFonts.css">
```

### 3. Theme Context
Use the theme context as normal:
```jsx
import { ThemeProvider } from '../shared/context/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>
```

## ✅ Compatibility Checklist

- [x] **Font Loading**: Works on web and mobile
- [x] **Screen Dimensions**: Safe for SSR and web
- [x] **Brand Colors**: Consistent across platforms
- [x] **Typography**: All weights available
- [x] **Theme Context**: Platform agnostic
- [x] **Responsive Design**: Breakpoints work on web
- [x] **Fallbacks**: Graceful degradation
- [x] **Performance**: Optimized font loading

## 🐛 Troubleshooting

### Fonts Not Loading on Web
1. Check network tab for Google Fonts requests
2. Verify CSS is properly injected
3. Check console for font loading errors

### Screen Dimensions Issues
1. Ensure proper fallbacks are in place
2. Check if running in SSR environment
3. Verify window object availability

### Theme Not Applied
1. Confirm ThemeProvider wraps your app
2. Check theme context is properly imported
3. Verify component is using theme tokens

## 📱 Platform-Specific Notes

### Web
- Fonts loaded via Google Fonts CDN
- CSS custom properties for brand colors
- Window-based screen dimensions
- Automatic font smoothing

### Mobile
- Fonts loaded via Expo Font
- Native font families
- Dimensions API for screen size
- Platform-specific optimizations

This implementation ensures 100% compatibility across web and mobile platforms while maintaining the exact brand guidelines and design system consistency.
