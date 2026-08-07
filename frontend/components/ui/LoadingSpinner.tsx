export default function LoadingSpinner({ size = 24, color = '#6366f1' }: { size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '32px 0' }}>
      <div
        className="animate-spin"
        style={{
          width: size, height: size,
          border: `2.5px solid ${color}22`,
          borderTop: `2.5px solid ${color}`,
          borderRadius: '50%',
        }}
      />
    </div>
  )
}
