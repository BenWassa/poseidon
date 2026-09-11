import { ArrowRight, Check, X } from 'lucide-react';
import {
  CoralAction,
  IconButton,
  PrimaryAction,
  QuietAction,
} from '../components/ui';
import { LOG_DIVE_STEPS, type LogDiveMode } from '../features/log-dive/model';
import {
  BasicsStep,
  CreaturesStep,
  MemoryStep,
  WhereStep,
} from '../features/log-dive/steps';
import { useLogDiveController } from '../features/log-dive/useLogDiveController';

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5" role="presentation">
      {LOG_DIVE_STEPS.map((label, position) => (
        <span
          key={label}
          className={`h-2 rounded-full transition-all ${position === step ? 'w-6 bg-marine' : position < step ? 'w-2 bg-marine/45' : 'w-2 bg-shallows'}`}
        />
      ))}
    </div>
  );
}

export function LogDive({ mode }: { mode: LogDiveMode }) {
  const flow = useLogDiveController(mode);
  const steps = [
    <WhereStep flow={flow} />,
    <BasicsStep flow={flow} />,
    <CreaturesStep flow={flow} />,
    <MemoryStep flow={flow} />,
  ];
  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="safe-top sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-shallows bg-surface/85 px-5 pb-3 backdrop-blur-xl">
        <IconButton
          label="Close without saving"
          tone="coral"
          onClick={flow.close}
        >
          <X size={22} aria-hidden="true" />
        </IconButton>
        <div className="flex flex-col items-center gap-1.5">
          <StepDots step={flow.step} />
          <p className="text-[10px] font-bold tracking-[0.14em] text-ocean/45 uppercase">
            Step {flow.step + 1} of {LOG_DIVE_STEPS.length}
          </p>
        </div>
        <div className="w-11" />
      </header>
      <div className="rail flex-1 overflow-y-auto px-5 pt-6 pb-40">
        <h1 className="text-[1.75rem] leading-tight font-black text-ocean">
          {mode === 'edit' ? 'Edit this dive' : LOG_DIVE_STEPS[flow.step]}
        </h1>
        {mode === 'edit' ? (
          <p className="mt-1 text-sm font-semibold text-lagoon">
            {LOG_DIVE_STEPS[flow.step]}
          </p>
        ) : null}
        {steps[flow.step]}
      </div>
      <div className="safe-bottom absolute inset-x-0 bottom-0 z-20 flex gap-3 bg-gradient-to-t from-canvas via-canvas to-transparent px-5 pt-8">
        {flow.step > 0 ? (
          <QuietAction
            type="button"
            onClick={() => flow.setStep((current) => current - 1)}
            className="flex-1"
          >
            Back
          </QuietAction>
        ) : null}
        {flow.step < LOG_DIVE_STEPS.length - 1 ? (
          <PrimaryAction
            type="button"
            onClick={() => flow.setStep((current) => current + 1)}
            disabled={!flow.stepValid}
            className="flex-[2]"
          >
            {flow.step === 1 ? 'Choose creatures' : 'Continue'}
            <ArrowRight size={20} aria-hidden="true" />
          </PrimaryAction>
        ) : (
          <CoralAction
            type="button"
            onClick={() => void flow.save()}
            disabled={flow.pending}
            className="flex-[2]"
          >
            {mode === 'edit' ? 'Save changes' : 'Save this memory'}
            <Check size={20} strokeWidth={3} aria-hidden="true" />
          </CoralAction>
        )}
      </div>
    </div>
  );
}
