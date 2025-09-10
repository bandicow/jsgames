import { FC } from 'react'
import { motion } from 'framer-motion'

interface BaseCardProps {
  id: number
  type: string
  title: string
  content: string
}

const BaseCard: FC<BaseCardProps> = ({ title, content }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
    >
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {content}
      </p>
      
      <button className="mt-4 glass-button text-sm">
        자세히 보기 →
      </button>
    </motion.div>
  )
}

export default BaseCard