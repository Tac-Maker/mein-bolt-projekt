import { CameraScan } from '@/components/CameraScan';
import type { ScanTarget } from '@/types';

interface ScanStepProps {
  onComplete: () => void;
  scanTarget: ScanTarget;
}

export function ScanStep({ onComplete, scanTarget }: ScanStepProps) {
  return (
    <CameraScan
      onComplete={onComplete}
      scanType={scanTarget === 'sole' ? 'sohle' : 'fuss'}
    />
  );
}
