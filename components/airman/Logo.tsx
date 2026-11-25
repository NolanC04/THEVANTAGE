export function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="AAPEX shield">
      <path d="M32 4 L56 12 V30 C56 45 45 55 32 60 C19 55 8 45 8 30 V12 Z" fill="none" stroke="#1F3A2E" strokeWidth="3" strokeLinejoin="round" />
      <path d="M17 42 L28 26 L33 33 L39 22 L48 42 Z" fill="#1F3A2E" />
    </svg>
  );
}
export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <div>
      <div className="wordmark" style={{ fontSize: small ? 18 : 34 }}>AAPEX</div>
    </div>
  );
}
