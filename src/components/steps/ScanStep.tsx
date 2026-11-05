import { CameraScan } from '@/components/CameraScan';

interface ScanStepProps {
  onComplete: () => void;
}

export function ScanStep({ onComplete }: ScanStepProps) {
  return <CameraScan onComplete={onComplete} />;
}
