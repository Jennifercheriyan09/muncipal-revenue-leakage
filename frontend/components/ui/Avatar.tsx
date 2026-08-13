interface AvatarProps {
  name: string
  color?: string
  size?: number
}

export default function Avatar({ name, color = '#2c4ecf', size = 30 }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
      {initials}
    </div>
  )
}
