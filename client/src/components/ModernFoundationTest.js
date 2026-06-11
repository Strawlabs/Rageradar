import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Skeleton } from './ui/skeleton'
import { motionPresets } from '../lib/motion'
import { useTheme } from './theme-provider'

const ModernFoundationTest = () => {
  const { theme, setTheme } = useTheme()

  return (
    <motion.div 
      className="p-8 space-y-6 max-w-4xl mx-auto"
      {...motionPresets.fadeIn}
    >
      <motion.div {...motionPresets.fadeInUp}>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Modern Foundation Test
        </h1>
        <p className="text-muted-foreground">
          Testing shadcn/ui components, Framer Motion, and theme system
        </p>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div 
        className="flex gap-2"
        {...motionPresets.fadeInUp}
      >
        <Button 
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
        >
          Light
        </Button>
        <Button 
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
        >
          Dark
        </Button>
        <Button 
          variant={theme === 'system' ? 'default' : 'outline'}
          onClick={() => setTheme('system')}
        >
          System
        </Button>
      </motion.div>

      {/* Button Variants */}
      <motion.div 
        className="space-y-4"
        {...motionPresets.staggerContainer}
      >
        <motion.h2 
          className="text-xl font-semibold"
          {...motionPresets.staggerItem}
        >
          Button Components
        </motion.h2>
        <motion.div 
          className="flex flex-wrap gap-2"
          {...motionPresets.staggerItem}
        >
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </motion.div>
      </motion.div>

      {/* Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        {...motionPresets.staggerContainer}
      >
        <motion.div {...motionPresets.staggerItem}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Sentiment Analysis
                <Badge variant="positive">+15%</Badge>
              </CardTitle>
              <CardDescription>
                Real-time sentiment tracking for your brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Positive</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...motionPresets.staggerItem}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Loading State
                <Badge variant="neutral">Processing</Badge>
              </CardTitle>
              <CardDescription>
                Skeleton components for loading states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Badge Variants */}
      <motion.div 
        className="space-y-4"
        {...motionPresets.fadeInUp}
      >
        <h2 className="text-xl font-semibold">Badge Components</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="positive">Positive</Badge>
          <Badge variant="negative">Negative</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </motion.div>

      {/* Animation Test */}
      <motion.div 
        className="space-y-4"
        {...motionPresets.fadeInUp}
      >
        <h2 className="text-xl font-semibold">Animation Test</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            className="p-4 bg-primary/10 rounded-lg text-center cursor-pointer"
            {...motionPresets.hoverLift}
          >
            Hover Lift
          </motion.div>
          <motion.div
            className="p-4 bg-secondary/10 rounded-lg text-center cursor-pointer"
            {...motionPresets.hoverScale}
          >
            Hover Scale
          </motion.div>
          <motion.div
            className="p-4 bg-positive-100 rounded-lg text-center"
            {...motionPresets.pulse}
          >
            Pulse
          </motion.div>
          <motion.div
            className="p-4 bg-muted rounded-lg text-center"
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            Rotate
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ModernFoundationTest