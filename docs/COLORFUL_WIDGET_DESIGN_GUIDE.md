# Colorful Widget Design Guide

## Overview
This guide defines the colorful widget design system for RageRadar KPI cards and shared components.

## Design Principles
- Vibrant gradient backgrounds
- Clean white text and icons
- Rounded corners (12px border radius)
- Consistent padding and spacing
- Icon + number + label layout

## Color Palette

### Primary Colors (Solid)
- **Blue**: `bg-blue-500` with `bg-blue-600` icon background
- **Purple**: `bg-purple-500` with `bg-purple-600` icon background  
- **Green**: `bg-green-500` with `bg-green-600` icon background
- **Red**: `bg-red-500` with `bg-red-600` icon background
- **Orange**: `bg-orange-500` with `bg-orange-600` icon background
- **Teal**: `bg-teal-500` with `bg-teal-600` icon background

### Hover States
- Each color has a corresponding hover state (e.g., `hover:bg-blue-600`)
- Smooth transitions with `transition-all duration-300`

## Component Structure

### KPI Card Layout
```
┌─────────────────────────┐
│ 🔵 [Icon]    [Number]   │
│              [Label]    │
└─────────────────────────┘
```

### Specifications
- **Width**: Flexible (min 200px)
- **Height**: 80-100px
- **Padding**: 16px
- **Border Radius**: 12px
- **Shadow**: `0 4px 15px rgba(0, 0, 0, 0.1)`

## Usage Examples

### AI Insights Card
- **Color**: Blue (`color="blue"`)
- **Icon**: Brain/AI icon (SVG)
- **Number**: Count of insights
- **Label**: "AI Insights"

### Predictions Card
- **Color**: Purple (`color="purple"`)
- **Icon**: Trending up (SVG)
- **Number**: Count of predictions
- **Label**: "Predictions"

### Recommendations Card
- **Color**: Green (`color="green"`)
- **Icon**: Lightbulb (SVG)
- **Number**: Count of recommendations
- **Label**: "Recommendations"

### Alerts Card
- **Color**: Red (`color="red"`)
- **Icon**: Warning triangle (SVG)
- **Number**: Count of active alerts
- **Label**: "Active Alerts"

## Page Headers
- **Background**: Same as page background (no gradient)
- **Icons**: SVG icons with colored backgrounds
- **Text**: Dark text for light mode, white for dark mode
- **Icon container**: Light gray background with colored icon

## Implementation Notes
- Use Tailwind CSS classes for solid color implementation
- Ensure text contrast meets accessibility standards (white text on colored backgrounds)
- Icons should be SVG, 20px size with white color on widgets
- Page header icons should be 24px SVG with theme colors
- Numbers should be bold, 24-28px font size
- Labels should be 14px, medium weight
- Icon backgrounds are slightly darker than the main background for depth
- Hover effects scale the card slightly and darken the background