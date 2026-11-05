import { type ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PrimaryButton({ children, onClick, disabled, className = '' }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`no-tap-highlight w-full rounded-xl bg-carbon text-base-white py-3.5 text-[15px] font-medium tracking-tight transition-all duration-200 active:scale-[0.985] disabled:opacity-30 disabled:active:scale-100 ${className}`}
    >
      {children}
    </button>
  );
}

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SecondaryButton({ children, onClick, className = '' }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`no-tap-highlight w-full rounded-xl border border-hairline bg-base-white text-carbon py-3.5 text-[15px] font-medium tracking-tight transition-all duration-200 active:scale-[0.985] ${className}`}
    >
      {children}
    </button>
  );
}

interface TextLinkProps {
  children: ReactNode;
  onClick?: () => void;
}

export function TextLink({ children, onClick }: TextLinkProps) {
  return (
    <button
      onClick={onClick}
      className="no-tap-highlight text-technical text-[13px] font-medium tracking-tight transition-colors hover:text-carbon"
    >
      {children}
    </button>
  );
}
