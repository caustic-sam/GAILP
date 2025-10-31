# Design System

World Papers uses a dark-first design system with shades of blue, crisp typography, and a newspaper-meets-modern-lab aesthetic.

## Color Palette

### Primary (Blue)

```css
--primary-50: #EFF6FF
--primary-100: #DBEAFE
--primary-200: #BFDBFE
--primary-300: #93C5FD
--primary-400: #60A5FA
--primary-500: #3B82F6
--primary-600: #2563EB  /* Main brand color */
--primary-700: #1D4ED8  /* Hover states */
--primary-800: #1E40AF
--primary-900: #1E3A8A
--primary-950: #172554
```

### Accent (Sky)

```css
--accent-400: #38BDF8  /* Highlights */
--accent-500: #0EA5E9
--accent-600: #0284C7
```

### Backgrounds (Dark Mode - Default)

```css
--bg-base: #0B1220       /* Page background */
--bg-surface: #111827    /* Card surfaces */
--bg-elevated: #1F2937   /* Elevated elements */
--bg-hover: #374151      /* Hover state */
```

### Text (Dark Mode)

```css
--text-primary: #E5E7EB    /* Main text */
--text-secondary: #D1D5DB  /* Secondary text */
--text-muted: #9CA3AF      /* Muted text */
--text-disabled: #6B7280   /* Disabled state */
```

### Semantic Colors

```css
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

### Status Badge Colors

- **Draft**: Yellow (#F59E0B / 20% opacity bg)
- **Adopted**: Blue (#3B82F6 / 20% opacity bg)
- **In Force**: Green (#10B981 / 20% opacity bg)
- **Repealed**: Gray (#6B7280 / 20% opacity bg)

## Typography

### Font Family

Primary: **Inter** (variable, self-hosted)

```css
font-family: 'Inter var', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

### Font Sizes & Line Heights

```css
/* Text sizes */
text-xs: 0.75rem / 1rem      /* 12px / 16px */
text-sm: 0.875rem / 1.25rem  /* 14px / 20px */
text-base: 1rem / 1.5rem     /* 16px / 24px */
text-lg: 1.125rem / 1.75rem  /* 18px / 28px */
text-xl: 1.25rem / 1.75rem   /* 20px / 28px */
text-2xl: 1.5rem / 2rem      /* 24px / 32px */
text-3xl: 1.875rem / 2.25rem /* 30px / 36px */
text-4xl: 2.25rem / 2.5rem   /* 36px / 40px */
text-5xl: 3rem / 1           /* 48px / 48px */
```

### Font Weights

```css
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Line Length

- **Body text**: 66-78 characters (max-w-prose)
- **Headlines**: No max width
- **Sidebar text**: 45-55 characters

## Spacing

### Base Unit: 4px (0.25rem)

```css
spacing-1: 0.25rem   /* 4px */
spacing-2: 0.5rem    /* 8px */
spacing-3: 0.75rem   /* 12px */
spacing-4: 1rem      /* 16px */
spacing-6: 1.5rem    /* 24px */
spacing-8: 2rem      /* 32px */
spacing-12: 3rem     /* 48px */
spacing-16: 4rem     /* 64px */
spacing-24: 6rem     /* 96px */
```

### Layout Spacing

- **Section gaps**: 4rem (64px) desktop, 3rem (48px) mobile
- **Card padding**: 1.5rem (24px) desktop, 1rem (16px) mobile
- **Grid gaps**: 1.5rem (24px) desktop, 1rem (16px) mobile

## Border Radius

```css
rounded-sm: 0.125rem   /* 2px */
rounded: 0.25rem       /* 4px */
rounded-md: 0.375rem   /* 6px */
rounded-lg: 0.5rem     /* 8px */
rounded-xl: 0.75rem    /* 12px */
rounded-2xl: 1rem      /* 16px */
```

## Elevation / Shadows

```css
/* No shadows by default - use borders instead */
border: 1px solid rgb(var(--border) / 0.2)

/* Elevated elements */
border: 1px solid rgb(var(--border) / 0.3)
background: rgb(var(--bg-elevated))
```

## Components

### Buttons

#### Primary Button
```css
bg: --primary-600
hover: --primary-700
text: white
padding: 0.5rem 1rem (sm) | 0.75rem 1.5rem (md) | 1rem 2rem (lg)
border-radius: 0.5rem
```

#### Secondary Button
```css
bg: --bg-elevated
hover: --bg-hover
text: --text-primary
border: 1px solid --border
```

#### Ghost Button
```css
bg: transparent
hover: --bg-surface
text: --text-secondary
```

### Cards

```css
background: --bg-surface
border: 1px solid --border (opacity 20%)
border-radius: 0.5rem
padding: 1.5rem
hover: border-color --primary-600 (opacity 50%)
```

### Input Fields

```css
background: --bg-surface
border: 1px solid --border
border-radius: 0.5rem
padding: 0.5rem 0.75rem
focus: ring-2 ring-primary-600
```

### Tag Chips

```css
background: --primary-600 (10% opacity)
text: --primary-400
border: 1px solid --primary-600 (20% opacity)
padding: 0.125rem 0.5rem
border-radius: 0.25rem
font-size: text-sm
```

### Status Badges

```css
display: inline-flex
align-items: center
gap: 0.25rem
padding: 0.25rem 0.5rem
border-radius: 0.25rem
font-size: text-xs
font-weight: medium
```

## Icons

**Library**: lucide-react (v0.400.0)

**Size Guidelines**:
- Small UI: 16px (w-4 h-4)
- Standard: 20px (w-5 h-5)
- Large: 24px (w-6 h-6)
- Hero: 32px (w-8 h-8)

## Grid System

### Container

```css
max-width: 1280px (7xl)
padding: 2rem (desktop) | 1rem (mobile)
margin: 0 auto
```

### Column Grid

```css
/* 3-column layout (desktop) */
grid-template-columns: repeat(3, 1fr)
gap: 1.5rem

/* 2-column layout (tablet) */
grid-template-columns: repeat(2, 1fr)
gap: 1rem

/* 1-column layout (mobile) */
grid-template-columns: 1fr
gap: 1rem
```

## Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Accessibility

### Focus States

All interactive elements must have visible focus indicators:

```css
*:focus-visible {
  outline: none;
  ring: 2px solid --primary-600;
  ring-offset: 2px;
}
```

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

All color combinations in this design system meet WCAG 2.2 AA standards.

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows visual flow
- Skip links provided for main content
- Modal traps focus correctly

## Motion

### Transition Duration

```css
duration-fast: 150ms
duration-base: 200ms
duration-slow: 300ms
```

### Easing

```css
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
ease-out: cubic-bezier(0, 0, 0.2, 1)
ease-in: cubic-bezier(0.4, 0, 1, 1)
```

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Dark Mode (Default)

The site is dark-first with optional light mode support.

### Toggling Modes

```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</button>
```

## Print Styles

Optimized for printing Policy and Article pages:

```css
@media print {
  /* Remove navigation, footers */
  .no-print { display: none; }
  
  /* Black text on white */
  body { color: black; background: white; }
  
  /* Show link URLs */
  a[href]:after { content: " (" attr(href) ")"; }
  
  /* Page breaks */
  .print-page-break { page-break-before: always; }
}
```

## Component Library

See `components/ui/` for shadcn/ui component implementations:

- Accordion
- Alert Dialog
- Button
- Card
- Dialog
- Dropdown Menu
- Input
- Label
- Select
- Separator
- Tabs
- Toast

All components follow this design system and are fully accessible.

## Usage Examples

### Creating a New Card Component

```tsx
import { Card } from '@/components/ui/card'

<Card className="p-6 space-y-4">
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-gray-400">Card content goes here</p>
</Card>
```

### Using Status Badges

```tsx
<span className="status-badge status-in-force">
  <CheckCircle className="w-3 h-3" />
  In Force
</span>
```

### Creating Tag Chips

```tsx
<span className="tag-chip tag-chip-small">
  Privacy
</span>
```

## Design Tokens Export

All design tokens are available in `styles/tokens.json` for use in external tools and design software.

---

*Last Updated: 2024-10-30*
