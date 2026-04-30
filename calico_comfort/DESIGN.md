---
name: Calico Comfort
colors:
  surface: '#fff8f4'
  surface-dim: '#dfd9d5'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ee'
  surface-container: '#f3ede9'
  surface-container-high: '#eee7e3'
  surface-container-highest: '#e8e1dd'
  on-surface: '#1d1b19'
  on-surface-variant: '#534437'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f6efeb'
  outline: '#867466'
  outline-variant: '#d9c2b2'
  surface-tint: '#8e4e00'
  primary: '#8e4e00'
  on-primary: '#ffffff'
  primary-container: '#f6a04d'
  on-primary-container: '#6a3900'
  inverse-primary: '#ffb878'
  secondary: '#864e5a'
  on-secondary: '#ffffff'
  secondary-container: '#feb6c4'
  on-secondary-container: '#7a4450'
  tertiary: '#5e5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#b4b3b3'
  on-tertiary-container: '#454545'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc1'
  primary-fixed-dim: '#ffb878'
  on-primary-fixed: '#2e1500'
  on-primary-fixed-variant: '#6c3a00'
  secondary-fixed: '#ffd9df'
  secondary-fixed-dim: '#fbb3c1'
  on-secondary-fixed: '#360c19'
  on-secondary-fixed-variant: '#6b3743'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#fff8f4'
  on-background: '#1d1b19'
  surface-variant: '#e8e1dd'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is built to evoke a sense of warmth, coziness, and community. It targets cat lovers and casual visitors who seek a low-stress, joyful experience. The brand personality is "The Gentle Host"—welcoming, soft-spoken, and charmingly playful without being cluttered or overstimulating.

The visual style leverages **Minimalism** blended with **Tactile** elements. We use generous whitespace and a restricted palette to maintain a clean aesthetic, while employing soft shadows and highly rounded corners to create an approachable, "squishy" feel that mirrors the physical comfort of a cat cafe. All imagery must be vector-based, utilizing clean lines and flat or limited-gradient illustrations to maintain a modern, professional edge.

## Colors

The "Calico" palette is the foundation of this design system. 
- **Surfaces:** Use the warm cream (#FFF8F4) for all primary backgrounds to provide a softer look than pure white.
- **Accents:** Soft orange (#F6A04D) is used for secondary interactive elements, active states, and highlights.
- **Actions:** The "Kitty Nose" pink (#FFB7C5) is strictly reserved for the primary action button to ensure it stands out as the most important element on the page. Do not use this pink for any other UI elements or decorative accents.
- **Typography:** Charcoal gray (#4A4A4A) provides high legibility while remaining softer and more organic than pure black.

## Typography

This design system utilizes **Plus Jakarta Sans** for its inherently rounded terminals and friendly, optimistic geometry. 

- **Headlines:** Use Bold weights with slight negative letter-spacing for a tight, modern look.
- **Body Text:** Use Regular weight with generous line-height to ensure readability against the cream background.
- **Labels:** Use SemiBold or Bold weights in smaller sizes for clear categorization.
- **Hierarchy:** Maintain a clear vertical rhythm by using the defined scale. All type should be set in Charcoal Gray, except for inverted buttons or specific disabled states.

## Layout & Spacing

This design system follows a **Fixed Grid** model for desktop (12-column) and a **Fluid Grid** for mobile devices. 

- **Base Unit:** An 8px spatial grid governs all padding and margins.
- **Rhythm:** Use "Lush" spacing (larger margins) to reinforce the relaxed atmosphere of a cafe. Content should never feel cramped.
- **Alignment:** Center-alignment is preferred for hero sections and landing pages to enhance the friendly, approachable aesthetic. Standard functional views should follow a left-aligned layout with 24px internal gutters.

## Elevation & Depth

To maintain the "clean and approachable" style, this design system uses **Ambient Shadows** and **Tonal Layering**.

- **Surface Strategy:** Use subtle shifts in color (slightly darker cream or white overlays) to define containers.
- **Shadows:** Use extremely soft, diffused shadows with a slight orange-tinted hue (#F6A04D at 5-10% opacity) instead of neutral grays. This keeps the interface feeling "warm."
- **Interaction:** Upon hover, cards should lift slightly using a larger blur radius and a subtle scale increase (1.02x) to mimic a tactile, responsive surface.

## Shapes

The shape language is defined by significant **Roundedness**. 

- **Standard Components:** Buttons and input fields use a 0.5rem radius.
- **Large Components:** Cards and modals use a 1.5rem (rounded-xl) radius to appear soft and inviting.
- **Icons:** Icons must feature rounded ends and soft corners; avoid sharp points or harsh angles.

## Components

### Buttons
- **Primary Action:** "Kitty Nose" pink (#FFB7C5) with white text. This is the only place this pink appears. It should have a soft, pill-like presence.
- **Secondary Action:** Ghost style with an orange (#F6A04D) border and text.

### Rating System
- Replace stars with **Cat-Head Vector Icons**.
- **Empty State:** Charcoal gray outline.
- **Filled State:** Soft orange (#F6A04D) fill.
- The icons should be simple, geometric line-art silhouettes of a cat's head with ears.

### Cards
- Use a white background (#FFFFFF) to pop against the warm cream (#FFF8F4) page surface.
- Apply a 1.5rem corner radius and a warm ambient shadow.

### Inputs & Selection
- **Fields:** Light cream fill with a 1px soft border. Focus state uses a 2px orange border.
- **Checkboxes:** Use rounded squares; radio buttons are standard circles. Both use orange for the active state.

### Navigation
- Use simple text links with an orange underline appearing only on hover. Keep the top-level navigation airy with at least 32px of horizontal spacing between items.