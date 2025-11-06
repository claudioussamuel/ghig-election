# Responsive Design Guide - Vote Project

## Quick Reference: Tailwind Breakpoints

```
Mobile:   < 640px   (default, no prefix)
Tablet:   ≥ 640px   (sm:)
Desktop:  ≥ 768px   (md:)
Large:    ≥ 1024px  (lg:)
XL:       ≥ 1280px  (xl:)
```

## Common Responsive Patterns Used

### 1. Typography Scale
```tsx
// Mobile → Tablet → Desktop
text-xl sm:text-2xl md:text-3xl     // Headings
text-sm sm:text-base                 // Body text
text-xs sm:text-sm                   // Small text
```

### 2. Spacing Scale
```tsx
// Padding
p-3 sm:p-4                          // Card padding
p-4 sm:p-6                          // Section padding
px-3 sm:px-4                        // Horizontal padding

// Margins
mb-4 sm:mb-6                        // Bottom margin
gap-2 sm:gap-4                      // Grid/flex gaps
space-y-3 sm:space-y-4              // Vertical spacing
```

### 3. Layout Patterns
```tsx
// Stack on mobile, row on desktop
flex flex-col sm:flex-row

// Full width on mobile, auto on desktop
w-full sm:w-auto

// Single column on mobile, grid on desktop
grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3

// Hide on mobile, show on desktop
hidden sm:inline
hidden sm:block

// Show on mobile, hide on desktop
sm:hidden
```

### 4. Button Patterns
```tsx
// Responsive button sizing
px-3 sm:px-4 py-2 text-sm sm:text-base

// Conditional button text
<span className="hidden sm:inline">Full Text</span>
<span className="sm:hidden">Short</span>
```

### 5. Size Adjustments
```tsx
// Icons and circles
w-8 h-8 sm:w-10 sm:h-10            // Position indicators
w-12 h-12 sm:w-14 sm:h-14          // Feature icons

// Minimum heights
min-h-[300px] sm:min-h-[500px]     // Content areas
```

## Page-Specific Breakpoints

### Main Page (app/page.tsx)
- **Mobile**: Stacked navigation, full-width buttons
- **Tablet**: Horizontal navigation, auto-width buttons
- **Desktop**: Full layout with optimal spacing

### Voting Stepper (components/voting-stepper.tsx)
- **Mobile**: 1 column candidate cards, compact indicators
- **Tablet**: 2 column candidate cards
- **Desktop**: 3 column candidate cards, full spacing

### Dashboard (components/dashboard.tsx)
- **Mobile**: 2 column summary, 1 column results
- **Tablet**: 2 column results
- **Desktop**: 3 column results

### Admin Page (app/admin/page.tsx)
- **Mobile**: Single column sections, compact forms
- **Desktop**: 2 column layout (positions | candidates)

## Testing Checklist

### Mobile (< 640px)
- [ ] All text is readable without zooming
- [ ] Buttons are at least 44x44px (touch-friendly)
- [ ] No horizontal scrolling
- [ ] Forms are easy to fill out
- [ ] Navigation is accessible
- [ ] Images scale properly

### Tablet (640px - 1024px)
- [ ] Layout transitions smoothly
- [ ] Grid columns adjust appropriately
- [ ] Text sizes are comfortable
- [ ] Spacing feels balanced

### Desktop (> 1024px)
- [ ] Full layout is utilized
- [ ] Content doesn't stretch too wide
- [ ] Hover states work properly
- [ ] All features are accessible

## Performance Tips

1. **Images**: Use responsive images with proper sizing
2. **Fonts**: System fonts load faster (using Geist)
3. **CSS**: Tailwind purges unused styles in production
4. **Viewport**: Meta tag ensures proper scaling

## Accessibility Notes

- Touch targets are minimum 44x44px on mobile
- Text contrast meets WCAG AA standards
- Focus states are visible
- Semantic HTML structure maintained
- Keyboard navigation works across all sizes

## Browser DevTools Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test these presets:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Responsive (custom sizes)

### Firefox Responsive Design Mode
1. Open DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. Test various device sizes

## Common Issues & Solutions

### Issue: Text too small on mobile
**Solution**: Add responsive text classes
```tsx
text-sm sm:text-base
```

### Issue: Buttons too close together
**Solution**: Add responsive gaps
```tsx
gap-2 sm:gap-4
```

### Issue: Layout breaks on small screens
**Solution**: Use flex-col on mobile
```tsx
flex flex-col sm:flex-row
```

### Issue: Content overflows
**Solution**: Add truncate or line-clamp
```tsx
truncate
line-clamp-2
```

## Future Enhancements

Consider adding:
- [ ] Swipe gestures for mobile voting
- [ ] Pull-to-refresh on results page
- [ ] Bottom sheet modals on mobile
- [ ] Optimized images with next/image
- [ ] Progressive Web App (PWA) features
- [ ] Dark mode toggle (already supported in CSS)

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design Principles](https://www.nngroup.com/articles/mobile-first-not-mobile-only/)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
