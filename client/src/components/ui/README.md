# Modern Component Library for RageRadar

This directory contains enhanced shadcn/ui components specifically designed for RageRadar's sentiment analysis dashboard. All components follow modern design patterns with improved accessibility, animations, and RageRadar-specific features.

## Components Overview

### Button Component (`button.js`)

Enhanced button component with multiple variants and sizes:

**Variants:**
- `default` - Primary brand button with shadow
- `secondary` - Secondary styling
- `outline` - Outlined button with hover effects
- `ghost` - Transparent button with hover states
- `destructive` - Red button for dangerous actions
- `gradient` - Gradient brand button with enhanced shadows
- `success` - Green button for positive actions
- `warning` - Yellow button for warning actions

**Sizes:**
- `sm` - Small button (h-8, rounded-lg)
- `default` - Standard button (h-10)
- `lg` - Large button (h-12, rounded-xl)
- `icon` - Square icon button (h-10 w-10)
- `icon-sm` - Small icon button (h-8 w-8)
- `icon-lg` - Large icon button (h-12 w-12)

**Features:**
- Smooth animations with `active:scale-95`
- Enhanced shadows on hover
- Proper focus states for accessibility
- Icon support with automatic sizing

```jsx
import { Button } from './ui'

// Basic usage
<Button>Click me</Button>

// With variants and icons
<Button variant="gradient" size="lg">
  <Download className="h-4 w-4" />
  Download Report
</Button>
```

### Card Component (`card.js`)

Modern card component with multiple variants:

**Variants:**
- `default` - Standard card with border and hover shadow
- `elevated` - Enhanced shadow without border
- `outline` - Thick border with hover effects
- `ghost` - Transparent card
- `gradient` - Subtle gradient background

**Padding Options:**
- `default` - Standard padding
- `none` - No padding
- `sm` - Small padding (p-4)
- `lg` - Large padding (p-8)

```jsx
import { Card, CardHeader, CardTitle, CardContent } from './ui'

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Sentiment Analysis</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
</Card>
```

### Input Component (`input.js`)

Enhanced input with validation states and grouping:

**Variants:**
- `default` - Standard input with focus ring
- `error` - Red border for validation errors
- `success` - Green border for valid inputs
- `ghost` - Muted background input

**Sizes:**
- `sm` - Small input (h-8, text-xs)
- `default` - Standard input (h-10)
- `lg` - Large input (h-12, text-base)

**InputGroup Features:**
- Label support with required indicators
- Error and success message display
- Helper text support

```jsx
import { Input, InputGroup } from './ui'

// Basic input
<Input placeholder="Enter brand name..." />

// Input with validation
<InputGroup 
  label="Brand Name"
  error="This field is required"
  required
  placeholder="Enter brand name..."
/>
```

### Badge Component (`badge.js`)

Comprehensive badge system with sentiment-specific variants:

**Standard Variants:**
- `default`, `secondary`, `outline`, `ghost`, `destructive`
- `success`, `warning`, `info`, `gradient`

**Sentiment Variants (RageRadar-specific):**
- `positive` - Green badge for positive sentiment
- `negative` - Red badge for negative sentiment  
- `neutral` - Gray badge for neutral sentiment

**Specialized Components:**
- `SentimentBadge` - Automatic sentiment styling with emoji and score
- `StatusBadge` - Status indicators with count support

```jsx
import { Badge, SentimentBadge, StatusBadge } from './ui'

// Standard badge
<Badge variant="success">Active</Badge>

// Sentiment badge with score
<SentimentBadge sentiment="positive" score={0.85} />

// Status badge with count
<StatusBadge status="warning" count={3} />
```

### Progress Component (`progress.js`)

Enhanced progress bars with sentiment distribution:

**Variants:**
- `default` - Standard blue progress
- `success` - Green progress bar
- `warning` - Yellow progress bar
- `error` - Red progress bar
- `gradient` - Gradient progress bar

**Features:**
- Smooth animations (duration-500)
- Optional value display
- Animated pulse effect
- Multiple sizes (sm, default, lg, xl)

**SentimentProgress:**
- Multi-colored progress showing positive/negative/neutral distribution
- Automatic percentage calculations
- Optional labels with color indicators

```jsx
import { Progress, SentimentProgress } from './ui'

// Standard progress
<Progress value={75} variant="success" showValue />

// Sentiment distribution
<SentimentProgress 
  positive={45} 
  negative={20} 
  neutral={35} 
/>
```

### Skeleton Component (`skeleton.js`)

Comprehensive loading state components:

**Variants:**
- `default` - Standard pulse animation
- `shimmer` - Shimmer effect animation
- `pulse` - Enhanced pulse animation

**Pre-built Skeletons:**
- `SkeletonCard` - Card layout skeleton
- `SkeletonChart` - Chart loading skeleton
- `SkeletonTable` - Table with configurable rows/columns
- `SkeletonAvatar` - Circular avatar skeleton
- `SkeletonText` - Multi-line text skeleton

```jsx
import { Skeleton, SkeletonCard, SkeletonChart } from './ui'

// Basic skeleton
<Skeleton className="h-4 w-full" variant="shimmer" />

// Pre-built skeletons
<SkeletonCard />
<SkeletonChart />
<SkeletonTable rows={5} columns={4} />
```

## Design System Integration

### CSS Variables
All components use CSS variables defined in `index.css` for consistent theming:

- `--primary`, `--secondary` - Brand colors
- `--positive-*`, `--negative-*`, `--neutral-*` - Sentiment colors
- `--background`, `--foreground` - Base colors
- `--border`, `--ring` - Interactive element colors

### Dark Mode Support
All components automatically support dark mode through CSS variables and the `dark:` prefix classes.

### Accessibility Features
- Proper ARIA labels and semantic markup
- Keyboard navigation support
- Screen reader compatibility
- High contrast focus indicators
- Reduced motion support

### Animation System
- Consistent transition durations (200ms standard)
- GPU-accelerated transforms
- Respects `prefers-reduced-motion`
- Smooth hover and focus states

## Usage Guidelines

### Import Pattern
```jsx
// Import specific components
import { Button, Card, Input } from './ui'

// Or import from specific files
import { Button } from './ui/button'
```

### Styling Customization
All components accept `className` prop for additional styling:

```jsx
<Button className="w-full mt-4" variant="gradient">
  Custom Styled Button
</Button>
```

### Composition
Components are designed to work together:

```jsx
<Card variant="elevated">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Sentiment Analysis</CardTitle>
      <SentimentBadge sentiment="positive" score={0.85} />
    </div>
  </CardHeader>
  <CardContent>
    <SentimentProgress positive={60} negative={15} neutral={25} />
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">
      View Details
    </Button>
  </CardFooter>
</Card>
```

## Performance Considerations

- Components use `React.forwardRef` for proper ref forwarding
- Animations are optimized for 60fps performance
- CSS-in-JS avoided in favor of Tailwind classes
- Minimal bundle size impact through tree-shaking

## Testing

Components can be tested using the `ModernComponentShowcase` component:

```jsx
import ModernComponentShowcase from './ModernComponentShowcase'

// Add to your routes for testing
<Route path="/components" element={<ModernComponentShowcase />} />
```

This provides a comprehensive view of all component variants and states for visual testing and development.