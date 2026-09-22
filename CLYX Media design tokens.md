# CLYX Media design tokens

## Direction
CLYX is a performance creative studio: bold, direct, editorial, and data-driven. Layouts should feel asymmetric and intentional rather than like a generic SaaS template.

## Color
| Token | Value | Use |
|---|---|---|
| CLYX blue | `#003AA3` | Brand action, emphasis, proof bands |
| CLYX yellow | `#FFDE59` | Accent, CTA, highlights |
| Ink | `#050505` | Dark canvas, footer, hero |
| White | `#FFFFFF` | Reversed text and light canvas |

No additional hues should be introduced without a deliberate brand decision.

## Type
Space Grotesk is the display face at 500/600/700. Inter is the body face at 400/500/600. Display copy uses tight tracking (`-.065em`) and compact line-height (`.93`). Suggested scale: hero `clamp(4.2rem, 10vw, 9.6rem)`, section title `3rem–7rem`, body `1rem–1.5rem`.

## Spacing
Use a 4px base grid. Standard section padding is `80px` mobile and `112px` desktop. Container max width is `1280px` with `24px` mobile and `40px` desktop gutters.

## Components
Every section owns its structure and state in a separate file under `components/sections`. Content lives under `data`. Layout owns Header/Footer and ui owns small primitives. Use motion sparingly: short reveal transitions, responsive hover states, and Lenis for smooth scrolling. Respect reduced-motion preferences.
