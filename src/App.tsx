import { useCallback } from 'react';
import { IPhoneFrame } from '@/components/IPhoneFrame';
import { StepIndicator } from '@/components/StepIndicator';
import { SplashStep } from '@/components/steps/SplashStep';
import { OnboardingStep } from '@/components/steps/OnboardingStep';
import { ScanStep } from '@/components/steps/ScanStep';
import { MetricsStep } from '@/components/steps/MetricsStep';
import { CustomizerStep } from '@/components/steps/CustomizerStep';
import { PrintabilityStep } from '@/components/steps/PrintabilityStep';
import { SlicerStep } from '@/components/steps/SlicerStep';
import { ExportStep } from '@/components/steps/ExportStep';
import { useAppMachine } from '@/useAppMachine';
import type { HardwareProfile, PrinterType, CustomizerState, ScanMethod, ScanMode } from '@/types';

function App() {
  const [state, dispatch] = useAppMachine();

  const next = useCallback(() => dispatch({ type: 'NEXT' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);
  const start = useCallback((method: ScanMethod) => dispatch({ type: 'START', scanMethod: method }), [dispatch]);
  const startSoleScan = useCallback(() => dispatch({ type: 'START_SOLE_SCAN' }), [dispatch]);
  const setHardware = useCallback((h: HardwareProfile) => dispatch({ type: 'SET_HARDWARE', hardware: h }), [dispatch]);
  const setPrinter = useCallback((p: PrinterType) => dispatch({ type: 'SET_PRINTER', printer: p }), [dispatch]);
  const setScanMode = useCallback((m: ScanMode) => dispatch({ type: 'SET_SCAN_MODE', scanMode: m }), [dispatch]);
  const setCustomizer = useCallback((patch: Partial<CustomizerState>) => dispatch({ type: 'SET_CUSTOMIZER', patch }), [dispatch]);
  const afterMetrics = useCallback(
    () => dispatch({ type: 'GOTO', step: state.scanTarget === 'sole' ? 4 : 3 }),
    [dispatch, state.scanTarget],
  );

  if (!state.started) {
    return (
      <IPhoneFrame>
        <SplashStep onStart={start} />
      </IPhoneFrame>
    );
  }

  return (
    <IPhoneFrame>
      <StepIndicator step={state.step} />
      {state.step === 0 && (
        <OnboardingStep
          state={state}
          setHardware={setHardware}
          setPrinter={setPrinter}
          setScanMode={setScanMode}
          onNext={next}
          onSoleScan={startSoleScan}
        />
      )}
      {state.step === 1 && <ScanStep onComplete={next} scanTarget={state.scanTarget} />}
      {state.step === 2 && <MetricsStep state={state} onNext={afterMetrics} />}
      {state.step === 3 && (
        <CustomizerStep state={state} setCustomizer={setCustomizer} onNext={next} />
      )}
      {state.step === 4 && <PrintabilityStep state={state} onNext={next} />}
      {state.step === 5 && <SlicerStep onNext={next} scanTarget={state.scanTarget} />}
      {state.step === 6 && <ExportStep state={state} onReset={reset} />}
    </IPhoneFrame>
  );
}

export default App;
