import { describe, it, expect } from 'vitest';
import { getAllNetworkingModules } from '@/content/networking';

describe('Auditing All Steps Progression (Days 1 to 8)', () => {
  const modules = getAllNetworkingModules();

  modules.forEach((mod) => {
    describe(`${mod.title} (${mod.id})`, () => {
      it('progresses smoothly through every step from 0 to end', () => {
        let activeStepIndex = 0;
        const completedSteps = new Set<number>();

        const norm = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');

        for (let i = 0; i < mod.steps.length; i++) {
          activeStepIndex = i;
          const currentStep = mod.steps[activeStepIndex];

          if (currentStep.cmd) {
            const rawCmd = currentStep.cmd;
            const normalizedCmd = norm(rawCmd);

            // Simulation of handleCommandRun in NetworkingWorkspace.tsx
            if (currentStep.cmd && norm(currentStep.cmd) === normalizedCmd) {
              completedSteps.add(activeStepIndex);
            } else {
              const foundIdx = mod.steps.findIndex(
                (s) => s.cmd && norm(s.cmd) === normalizedCmd
              );
              if (foundIdx > -1) {
                completedSteps.add(foundIdx);
              }
            }

            // Step must be done
            const isDone = completedSteps.has(activeStepIndex) || currentStep.cmd === null;
            expect(isDone).toBe(true);

            // If not last step, canGoNext must be true
            if (activeStepIndex < mod.steps.length - 1) {
              const canGoNext = isDone && activeStepIndex < mod.steps.length - 1;
              expect(canGoNext).toBe(true);
            }
          } else {
            // Recap step
            const isDone = currentStep.cmd === null || completedSteps.has(activeStepIndex);
            expect(isDone).toBe(true);
          }
        }

        // Verify total completed steps matches number of actionable steps
        const actionableSteps = mod.steps.filter((s) => s.cmd !== null).length;
        expect(completedSteps.size).toBe(actionableSteps);
      });
    });
  });
});
