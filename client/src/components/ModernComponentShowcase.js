import React, { useState } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Input, 
  InputGroup,
  Badge, 
  SentimentBadge, 
  StatusBadge,
  Progress,
  SentimentProgress,
  Skeleton,
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonText
} from './ui'
import { Heart, Download, Settings, Search, Bell, User } from 'lucide-react'

const ModernComponentShowcase = () => {
  const [inputValue, setInputValue] = useState('')
  const [showSkeletons, setShowSkeletons] = useState(false)

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Modern Component Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Enhanced shadcn/ui components for RageRadar
          </p>
        </div>

        {/* Button Variants */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>
              Enhanced buttons with modern styling and animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Buttons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Variants
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="gradient">Gradient</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sizes
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Heart className="h-4 w-4" /></Button>
                <Button size="icon-sm"><Settings className="h-3 w-3" /></Button>
                <Button size="icon-lg"><Download className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Buttons with Icons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                With Icons
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Enhanced inputs with validation states and focus styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InputGroup 
                  label="Default Input"
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                
                <InputGroup 
                  label="Success State"
                  placeholder="Valid input"
                  success="This looks good!"
                />
                
                <InputGroup 
                  label="Error State"
                  placeholder="Invalid input"
                  error="This field is required"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <Input placeholder="Small input" size="sm" />
                <Input placeholder="Default input" />
                <Input placeholder="Large input" size="lg" />
                <Input placeholder="Ghost variant" variant="ghost" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
            <CardDescription>
              Status indicators and sentiment badges for RageRadar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Standard Badges */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Standard Variants
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="gradient">Gradient</Badge>
              </div>
            </div>

            {/* Sentiment Badges */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sentiment Badges
              </h4>
              <div className="flex flex-wrap gap-2">
                <SentimentBadge sentiment="positive" score={0.85} />
                <SentimentBadge sentiment="negative" score={0.72} />
                <SentimentBadge sentiment="neutral" score={0.45} />
                <SentimentBadge sentiment="positive" showScore={false} />
              </div>
            </div>

            {/* Status Badges */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Status Badges
              </h4>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="online" />
                <StatusBadge status="warning" count={3} />
                <StatusBadge status="error" count={12} />
                <StatusBadge status="info" showCount={false} />
              </div>
            </div>

            {/* Badge Sizes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sizes
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge>Default</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress Components</CardTitle>
            <CardDescription>
              Progress bars and sentiment distribution indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Standard Progress */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Standard Progress
              </h4>
              <div className="space-y-3">
                <Progress value={33} showValue />
                <Progress value={66} variant="success" showValue />
                <Progress value={88} variant="warning" showValue />
                <Progress value={45} variant="error" showValue />
                <Progress value={75} variant="gradient" animated showValue />
              </div>
            </div>

            {/* Sentiment Progress */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sentiment Distribution
              </h4>
              <SentimentProgress 
                positive={45} 
                negative={20} 
                neutral={35} 
              />
              <SentimentProgress 
                positive={70} 
                negative={10} 
                neutral={20} 
                showLabels={false}
              />
            </div>

            {/* Progress Sizes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sizes
              </h4>
              <div className="space-y-3">
                <Progress value={60} size="sm" />
                <Progress value={60} />
                <Progress value={60} size="lg" />
                <Progress value={60} size="xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a default card with standard styling.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with enhanced shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has elevated styling with more prominent shadows.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Gradient Card</CardTitle>
              <CardDescription>Card with gradient background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card features a subtle gradient background.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="ghost">Action</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Skeleton Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Skeleton Components
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSkeletons(!showSkeletons)}
              >
                {showSkeletons ? 'Hide' : 'Show'} Skeletons
              </Button>
            </CardTitle>
            <CardDescription>
              Loading states and skeleton components
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSkeletons ? (
              <div className="space-y-8">
                {/* Skeleton Card */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Card Skeleton
                  </h4>
                  <div className="border rounded-xl">
                    <SkeletonCard />
                  </div>
                </div>

                {/* Skeleton Chart */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Chart Skeleton
                  </h4>
                  <SkeletonChart />
                </div>

                {/* Skeleton Table */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Table Skeleton
                  </h4>
                  <SkeletonTable rows={3} columns={4} />
                </div>

                {/* Other Skeletons */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Other Skeletons
                  </h4>
                  <div className="flex items-center space-x-4">
                    <SkeletonAvatar />
                    <div className="flex-1">
                      <SkeletonText lines={2} />
                    </div>
                  </div>
                </div>

                {/* Skeleton Variants */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Skeleton Variants
                  </h4>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton variant="shimmer" className="h-4 w-3/4" />
                    <Skeleton variant="pulse" className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Click "Show Skeletons" to see loading states
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-12 pb-6">
          <p className="text-sm text-muted-foreground">
            Modern Component Library for RageRadar • Built with shadcn/ui
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModernComponentShowcase