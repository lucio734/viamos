---
name: Víamos Design System
colors:
  surface: '#fbf9fb'
  surface-dim: '#dbd9db'
  surface-bright: '#fbf9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f5'
  surface-container: '#efedef'
  surface-container-high: '#e9e7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1c1d'
  on-surface-variant: '#43474d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f2f0f2'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4c6078'
  primary: '#03192e'
  on-primary: '#ffffff'
  primary-container: '#1a2e44'
  on-primary-container: '#8296b0'
  inverse-primary: '#b4c8e4'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#241500'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d2907'
  on-tertiary-container: '#ae8f64'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b4c8e4'
  on-primary-fixed: '#061d32'
  on-primary-fixed-variant: '#35485f'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffddb0'
  tertiary-fixed-dim: '#e3c193'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#5a431f'
  background: '#fbf9fb'
  on-background: '#1b1c1d'
  surface-variant: '#e4e2e4'
  status-online: '#2D6A4F'
  status-alert: '#D90429'
  background-alt: '#F8FAFC'
  pro-verification: '#FFB703'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mobile-headline:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 48px
  touch-target: 44px
---

## Brand & Style

The design system is built to bridge the communication gap between the Deaf community and sign language interpreters. The brand personality is **Empathetic, Professional, and Highly Functional**. It balances the clinical precision required for legal compliance with the warmth of human connection.

The visual style follows a **Corporate / Modern** aesthetic with a strong emphasis on **Accessibility**. It utilizes high-contrast interfaces, generous touch targets, and a systematic layout to ensure that users—regardless of their level of hearing—can navigate the service with total autonomy. The focus is on clarity, reducing cognitive load during critical communication moments.

## Colors

The color palette is anchored by a deep navy blue (`#1A2E44`), establishing a foundation of trust and professional reliability. This primary color is contrasted against pure white surfaces to maximize legibility and meet high accessibility standards.

- **Primary:** Navy Blue is used for key actions, branding, and structural headers.
- **Secondary:** White is used for main surfaces to maintain a "clean" and "airy" feel.
- **Semantic Colors:** 
    - **Status Online:** A forest green used for the availability map and active professional status.
    - **Status Alert:** A high-visibility red for the "Validador" alerts, signaling blocks or conflicts.
    - **Pro Verification:** A warm gold used exclusively for "Prolibras" and other professional certifications to denote verified quality.

## Typography

This design system uses **Inter** exclusively. As a systematic sans-serif, Inter provides exceptional legibility on small screens and high-density dashboards. 

The type scale is designed with a "text-first" approach. Body text never drops below 16px to ensure readability. Labels and helper text use slightly increased letter spacing and semi-bold weights to remain clear despite their smaller size. For mobile views, headlines are scaled down to prevent excessive wrapping while maintaining a strong visual hierarchy.

## Layout & Spacing

The design system utilizes an **8px grid system** to maintain vertical rhythm and consistent density. 

- **Fluid Grid:** Content stretches to fill mobile screens with a 20px safe margin. On desktop, the "Hub do Intérprete" uses a fluid-width sidebar with a centered content area.
- **Accessibility Margins:** Spacing between interactive elements (like the status toggles and map markers) is strictly maintained to prevent accidental taps.
- **Form Layout:** Multi-field registration forms use a 24px vertical gap between input groups to clearly separate data categories (Personal, Professional, Business).

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** Main content cards sit on a light gray background (`#F8FAFC`) with a subtle white background to indicate elevation.
- **Shadows:** Only used for "floating" elements like the "Ficar Online" switch and Map Markers. These shadows are extra-diffused (0% spread, 12% opacity) to feel modern and light.
- **Validator Alerts:** Use a semi-transparent overlay to dim the background, bringing critical conflicts to the immediate foreground.

## Shapes

The shape language is **Soft and Precise**. 

- **Base Radius:** 0.25rem (4px) is applied to standard input fields and small buttons.
- **Component Radius:** Larger cards and "Action Hubs" use 0.5rem (8px) to soften the interface without appearing overly "bubbly" or informal.
- **Interactive Icons:** Icons for Libras (Sign Language) and map pins are enclosed in circular containers to differentiate them from functional UI buttons.

## Components

### Buttons
- **Primary:** Solid `#1A2E44` with white text. Used for "Aceitar Solicitação" and "Entrar".
- **Secondary:** White background with a 1px border of `#1A2E44`. Used for "Voltar".
- **Status Toggle:** A large, accessible switch that changes from neutral gray to `status-online` green.

### Input Fields
- Text boxes feature a clear 1px stroke. Labels are always visible above the field (not as floating placeholders) to assist with cognitive accessibility.

### Cards
- **Service Request Card:** High-contrast layout showing the event name, location, and a prominent "Check-in" button. 
- **Professional Badge:** A specific card variation that includes the "Verified" icon for Prolibras certifications.

### Iconography
- **Libras Icons:** Custom-drawn, intuitive hand-shape icons are used for video-chat triggers and accessibility confirmations. They must maintain a consistent stroke weight with the typography.

### Map Elements
- Custom markers for "Local do Evento" use the brand's navy blue with a white interior icon to ensure they stand out against standard map tiles.