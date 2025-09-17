import { FC } from 'react'
import YouTubeMusicPlayer from './YouTubeMusicPlayer'

interface MusicCardProps {
  className?: string
}

const MusicCard: FC<MusicCardProps> = ({ className = '' }) => {
  return (
    <div className={`music-card-section ${className}`}>
      <YouTubeMusicPlayer />
    </div>
  )
}

export default MusicCard