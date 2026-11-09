export type StepId = 'onboarding' | 'scan' | 'metrics' | 'customizer' | 'printability' | 'slicer' | 'export';

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HardwareProfile = 'maker' | 'access';

export type ScanMethod = 'iphone' | 'android';

export type ScanTarget = 'foot' | 'sole';

export type ScanMode = 'pure' | 'hybrid';

export type PrinterType = 'Bambu Lab X1C' | 'Bambu Lab P1S' | 'Prusa MK4' | 'Ender 3';

export type ShoeModel = 'PureSlide' | 'UrbanFlow';

export type TreadProfile = 'HexaGrip' | 'WaveTrail';

export interface FootMetrics {
  lengthMm: number;
  forefootWidthMm: number;
  instepHeightMm: number;
  toleranceMm: number;
  deltaMm: number;
}

export interface CustomizerState {
  model: ShoeModel;
  outsoleColor: string;
  midsoleColor: string;
  laceColor: string;
  tread: TreadProfile;
}

export interface AppState {
  step: StepIndex;
  started: boolean;
  scanMethod: ScanMethod | null;
  scanTarget: ScanTarget;
  scanMode: ScanMode;
  hardware: HardwareProfile;
  printer: PrinterType;
  metrics: FootMetrics;
  customizer: CustomizerState;
}

export const STEP_IDS: StepId[] = [
  'onboarding',
  'scan',
  'metrics',
  'customizer',
  'printability',
  'slicer',
  'export',
];

export const STEP_LABELS: string[] = [
  'Setup',
  'Scan',
  'Metriken',
  'Konfigurator',
  'Druckbarkeit',
  'Slicer',
  'Export',
];

export const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: 'Stealth Black', hex: '#18181B' },
  { name: 'Signal Red', hex: '#DC2626' },
  { name: 'Forest Green', hex: '#15803D' },
];

export const SOLE_SWATCHES: { name: string; hex: string }[] = [
  { name: 'Stealth Black', hex: '#18181B' },
  { name: 'Bone White', hex: '#F4F4F5' },
];

export const LACE_SWATCHES: { name: string; hex: string }[] = [
  { name: 'Bone White', hex: '#F4F4F5' },
  { name: 'Signal Red', hex: '#DC2626' },
  { name: 'Forest Green', hex: '#15803D' },
];

export const PRINTER_OPTIONS: PrinterType[] = [
  'Bambu Lab X1C',
  'Bambu Lab P1S',
  'Prusa MK4',
  'Ender 3',
];

export const PRINTER_VOLUMES: Record<PrinterType, string> = {
  'Bambu Lab X1C': '256x256x256 mm',
  'Bambu Lab P1S': '256x256x256 mm',
  'Prusa MK4': '250x210x220 mm',
  'Ender 3': '220x220x250 mm',
};
