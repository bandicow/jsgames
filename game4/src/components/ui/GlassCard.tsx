import { FC, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg'
  opacity?: 'light' | 'medium' | 'dark'
  animate?: boolean
}

const GlassCard: FC<GlassCardProps> = ({ 
  children, 
  className = '',
  blur = 'md',
  opacity = 'medium',
  animate = true
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  }

  const opacityClasses = {
    light: 'bg-white/10 dark:bg-black/10',
    medium: 'bg-white/20 dark:bg-black/20',
    dark: 'bg-white/30 dark:bg-black/30'
  }

  const cardContent = (
    <div
      className={`
        ${opacityClasses[opacity]}
        ${blurClasses[blur]}
        border border-white/20 dark:border-white/10
        rounded-2xl shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

export default GlassCard