import { DollarSign } from 'lucide-react';
import type { SVGProps } from 'react';

interface CurrencyIconProps extends SVGProps<SVGSVGElement> {
  currency: string;
}

/**
 * Uses a familiar dollar glyph by default and the Rupiah symbol for IDR.
 * Rupiah path design: Mary Akveo (public domain).
 */
export const CurrencyIcon = ({ currency, ...props }: CurrencyIconProps) => {
  if (currency !== 'IDR') {
    return <DollarSign {...props} />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 13.5a2.5 2.5 0 0 0-2.5-2.5H16v5h2.5a2.5 2.5 0 0 0 0-5ZM16 16v4" />
      <path d="M8 12H3V4h5a4 4 0 0 1 0 8ZM3 10v8m8 0-3-6" />
    </svg>
  );
};
