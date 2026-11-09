import { useReducer } from 'react';
import type { AppState, StepIndex, ScanMethod, ScanTarget, ScanMode } from '@/types';

type Action =
  | { type: 'GOTO'; step: StepIndex }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'RESET' }
  | { type: 'START'; scanMethod: ScanMethod }
  | { type: 'START_SOLE_SCAN' }
  | { type: 'SET_HARDWARE'; hardware: AppState['hardware'] }
  | { type: 'SET_PRINTER'; printer: AppState['printer'] }
  | { type: 'SET_SCAN_MODE'; scanMode: ScanMode }
  | { type: 'SET_CUSTOMIZER'; patch: Partial<AppState['customizer']> };

const initialState: AppState = {
  step: 0,
  started: false,
  scanMethod: null,
  scanTarget: 'foot' as ScanTarget,
  scanMode: 'pure' as ScanMode,
  hardware: 'maker',
  printer: 'Bambu Lab X1C',
  metrics: {
    lengthMm: 284,
    forefootWidthMm: 106,
    instepHeightMm: 72,
    toleranceMm: 1.5,
    deltaMm: 1.2,
  },
  customizer: {
    model: 'UrbanFlow',
    outsoleColor: '#18181B',
    midsoleColor: '#DC2626',
    laceColor: '#18181B',
    tread: 'HexaGrip',
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GOTO':
      return { ...state, step: action.step };
    case 'NEXT':
      return { ...state, step: Math.min(6, state.step + 1) as StepIndex };
    case 'PREV':
      return { ...state, step: Math.max(0, state.step - 1) as StepIndex };
    case 'RESET':
      return { ...initialState };
    case 'START':
      return { ...state, started: true, scanMethod: action.scanMethod, scanTarget: 'foot' };
    case 'START_SOLE_SCAN':
      return { ...state, scanTarget: 'sole', step: 1 };
    case 'SET_HARDWARE':
      return { ...state, hardware: action.hardware };
    case 'SET_PRINTER':
      return { ...state, printer: action.printer };
    case 'SET_SCAN_MODE':
      return { ...state, scanMode: action.scanMode };
    case 'SET_CUSTOMIZER':
      return { ...state, customizer: { ...state.customizer, ...action.patch } };
    default:
      return state;
  }
}

export function useAppMachine() {
  return useReducer(reducer, initialState);
}
