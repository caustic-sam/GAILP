# Banner Customization Guide

**Quick reference for customizing the homepage hero banner**

---

## 🎨 Globe Animation Settings

**Location:** `app/page.tsx` line ~149

### Current Settings
```tsx
<div className="transform scale-[2.5] opacity-40 ml-[468px]">
  <AnimatedGlobe />
</div>
```

### Customizable Properties

| Property | Current Value | What It Does | Examples |
|----------|---------------|--------------|----------|
| `scale-[X]` | `2.5` | Size of globe | `2.0` (smaller), `3.0` (larger) |
| `opacity-X` | `40` | Transparency (0-100) | `30` (more transparent), `50` (less transparent) |
| `ml-[Xpx]` | `468px` | Left margin (position) | `200px` (more left), `600px` (more right) |

### Quick Adjustments

**Make globe bigger:**
```tsx
<div className="transform scale-[3.0] opacity-40 ml-[468px]">
```

**Make globe more transparent:**
```tsx
<div className="transform scale-[2.5] opacity-30 ml-[468px]">
```

**Move globe further right:**
```tsx
<div className="transform scale-[2.5] opacity-40 ml-[600px]">
```

**Move globe further left:**
```tsx
<div className="transform scale-[2.5] opacity-40 ml-[300px]">
```

---

## 🎯 Banner Background Colors

**Location:** `app/page.tsx` line ~146

### Current Gradient
```tsx
<section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] ...">
```

### Color Customization

| Element | Current Color | Change To |
|---------|---------------|-----------|
| Start color | `#1e3a5f` (dark blue) | Any hex color |
| End color | `#2d5a8f` (lighter blue) | Any hex color |
| Gradient direction | `gradient-to-br` (bottom-right) | See options below |

### Gradient Direction Options

```tsx
bg-gradient-to-r   // Left to right
bg-gradient-to-l   // Right to left
bg-gradient-to-b   // Top to bottom
bg-gradient-to-t   // Bottom to top
bg-gradient-to-br  // Top-left to bottom-right (current)
bg-gradient-to-bl  // Top-right to bottom-left
bg-gradient-to-tr  // Bottom-left to top-right
bg-gradient-to-tl  // Bottom-right to top-left
```

### Example Color Schemes

**Purple Theme:**
```tsx
<section className="bg-gradient-to-br from-[#6B46C1] to-[#9333EA] ...">
```

**Green Theme:**
```tsx
<section className="bg-gradient-to-br from-[#047857] to-[#10B981] ...">
```

**Dark Theme:**
```tsx
<section className="bg-gradient-to-br from-[#111827] to-[#1F2937] ...">
```

---

## 📝 Banner Text

**Location:** `app/page.tsx` lines ~158-163

### Headline
```tsx
<h1 className="text-4xl md:text-5xl font-bold mb-4 ...">
  Navigate the Future of<br />Digital Policy
</h1>
```

**Sizes:**
- `text-4xl` = Desktop size
- `md:text-5xl` = Larger on medium screens
- Options: `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`

### Subheadline
```tsx
<p className="text-lg text-blue-100 mb-8 max-w-2xl">
  Your trusted source for...
</p>
```

**Text Colors:**
- `text-blue-100` = Light blue
- Options: `text-white`, `text-gray-100`, `text-blue-50`, `text-blue-200`

---

## 🔘 Button Customization

**Location:** `app/page.tsx` lines ~165-174

### Button Sizes
```tsx
<Button size="lg" variant="primary">Explore Insights</Button>
```

**Size options:** `sm`, `md`, `lg`

### Button Variants
- `primary` - Blue button
- `secondary` - White/outline button

### Button Text
Just change the text between the tags:
```tsx
<Button size="lg" variant="primary">Your Custom Text</Button>
```

---

## 📐 Banner Height & Spacing

**Location:** `app/page.tsx` line ~154

### Current Padding
```tsx
<div className="max-w-7xl mx-auto px-6 py-16">
```

**Adjust height:**
- `py-8` = Shorter banner
- `py-16` = Current height
- `py-24` = Taller banner
- `py-32` = Very tall banner

---

## 🖼️ Additional Elements

### Breach Counter (Right Side)

**Show/Hide:**
```tsx
{/* Current - shown on large screens */}
<div className="hidden lg:block relative z-10">
  <BreachCounter />
</div>

{/* To show on all screens */}
<div className="block relative z-10">
  <BreachCounter />
</div>

{/* To hide completely */}
{/* Just comment out or delete the entire div */}
```

---

## ⚡ Quick Recipes

### Subtle Globe
```tsx
<div className="transform scale-[2.0] opacity-20 ml-[400px]">
  <AnimatedGlobe />
</div>
```

### Prominent Globe
```tsx
<div className="transform scale-[3.5] opacity-60 ml-[500px]">
  <AnimatedGlobe />
</div>
```

### Centered Globe
```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <div className="transform scale-[2.5] opacity-40">
    <AnimatedGlobe />
  </div>
</div>
```

### Dark Banner with White Text
```tsx
<section className="bg-gradient-to-br from-[#111827] to-[#1F2937] text-white ...">
  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
    Your Headline
  </h1>
  <p className="text-lg text-gray-300 mb-8 max-w-2xl">
    Your description
  </p>
</section>
```

---

## 🎨 Color Reference

### Blue Shades (Current)
```
#1e3a5f - Dark navy blue
#2d5a8f - Medium blue
#3b82f6 - Bright blue
```

### Suggested Alternatives

**Professional Blues:**
```
#0f172a - Very dark blue
#1e40af - Royal blue
#2563eb - Vibrant blue
```

**Greens:**
```
#064e3b - Dark green
#059669 - Emerald
#10b981 - Light green
```

**Purples:**
```
#4c1d95 - Dark purple
#7c3aed - Purple
#a78bfa - Light purple
```

---

## 💡 Pro Tips

1. **Test on mobile** - Check responsive breakpoints
2. **Contrast is key** - Ensure text is readable
3. **Less is more** - Don't overcomplicate the design
4. **Save original** - Comment out old code before changing
5. **Hot reload** - Changes appear immediately in dev mode

---

## 🔧 Development Workflow

```bash
# 1. Start dev server
pnpm dev

# 2. Edit app/page.tsx
# Make your changes

# 3. Check browser (auto-refreshes)
# Open http://localhost:3000

# 4. Iterate until satisfied
```

---

## 📱 Responsive Breakpoints

Tailwind CSS breakpoints used:

```
sm: 640px   (small screens)
md: 768px   (tablets)
lg: 1024px  (laptops)
xl: 1280px  (desktops)
2xl: 1536px (large desktops)
```

Example responsive class:
```tsx
className="text-4xl md:text-5xl lg:text-6xl"
// 4xl on mobile, 5xl on tablet+, 6xl on laptop+
```

---

## 🚨 Common Issues

**Globe not showing:**
- Check `opacity` is not 0
- Ensure `pointer-events-none` is present
- Verify `AnimatedGlobe` component is imported

**Globe too far off screen:**
- Reduce `ml-[Xpx]` value
- Try negative margin: `ml-[-100px]`

**Text hard to read:**
- Increase text-white brightness
- Add text shadow: `drop-shadow-lg`
- Reduce globe opacity

**Changes not appearing:**
- Check dev server is running
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache if needed

---

**Last Updated:** November 2, 2025
**File:** `app/page.tsx`
**Lines:** 146-183
