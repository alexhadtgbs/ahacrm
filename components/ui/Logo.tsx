import Image from 'next/image'
import { getLogoConfig } from '@/lib/config'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  showBackground?: boolean
  backgroundColor?: string
}

export function Logo({ 
  className = '', 
  width, 
  height, 
  showBackground,
  backgroundColor
}: LogoProps) {
  const config = getLogoConfig()
  
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={showBackground ?? config.showBackground ? { backgroundColor: backgroundColor ?? config.backgroundColor } : {}}
    >
      <Image
        src={config.src}
        alt={config.alt}
        width={width ?? config.defaultWidth}
        height={height ?? config.defaultHeight}
        className="object-contain"
        priority
      />
    </div>
  )
} 