import React, { createContext, useContext, useState, useCallback } from "react";
import { demoScenarios, type DemoScenario, type DemoStep } from "./scenarios";

interface DemoState {
  active: boolean;
  scenario: DemoScenario | null;
  stepIndex: number;
  currentStep: DemoStep | null;
}

interface DemoContextType {
  state: DemoState;
  startScenario: (scenarioId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  stop: () => void;
  launcherOpen: boolean;
  setLauncherOpen: (open: boolean) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoMode() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoProvider");
  return ctx;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>({ active: false, scenario: null, stepIndex: 0, currentStep: null });
  const [launcherOpen, setLauncherOpen] = useState(false);

  const startScenario = useCallback((scenarioId: string) => {
    const scenario = demoScenarios.find(s => s.id === scenarioId);
    if (!scenario || scenario.steps.length === 0) return;
    setState({ active: true, scenario, stepIndex: 0, currentStep: scenario.steps[0] });
    setLauncherOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.scenario) return prev;
      const next = prev.stepIndex + 1;
      if (next >= prev.scenario.steps.length) {
        return { active: false, scenario: null, stepIndex: 0, currentStep: null };
      }
      return { ...prev, stepIndex: next, currentStep: prev.scenario.steps[next] };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      if (!prev.scenario || prev.stepIndex === 0) return prev;
      const next = prev.stepIndex - 1;
      return { ...prev, stepIndex: next, currentStep: prev.scenario.steps[next] };
    });
  }, []);

  const stop = useCallback(() => {
    setState({ active: false, scenario: null, stepIndex: 0, currentStep: null });
  }, []);

  return (
    <DemoContext.Provider value={{ state, startScenario, nextStep, prevStep, stop, launcherOpen, setLauncherOpen }}>
      {children}
    </DemoContext.Provider>
  );
}
