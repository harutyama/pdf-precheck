type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 32 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="2" width="20" height="26" rx="3" fill="#0F6B5C" />
      <path d="M23 8h6l-6-6v6Z" fill="#0B5348" />
      <rect x="7" y="9" width="12" height="1.6" rx="0.8" fill="#D7F3EC" />
      <rect x="7" y="13" width="9" height="1.6" rx="0.8" fill="#D7F3EC" />
      <circle cx="23" cy="23" r="7" fill="#F4F1EA" />
      <path
        d="M20.2 23.1 22.1 25l3.8-4.3"
        stroke="#0F6B5C"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
