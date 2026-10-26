export function Equalizer({ className = '' }: { className?: string }) {
  return (
    <span className={`eq ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
