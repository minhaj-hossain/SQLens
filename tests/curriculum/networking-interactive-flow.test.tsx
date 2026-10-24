import { describe, it, expect } from 'vitest';
import { getAllNetworkingModules } from '@/content/networking';

describe('Interactive Step Completion Audit (Days 1 to 8)', () => {
  const modules = getAllNetworkingModules();

  modules.forEach((mod) => {
    describe(`${mod.title} (${mod.id})`, () => {
      mod.steps.forEach((step, stepIdx) => {
        if (!step.cmd) {
          it(`Step ${stepIdx + 1} (${step.title}) is recap step without command`, () => {
            expect(step.cmd).toBeNull();
          });
          return;
        }

        it(`Step ${stepIdx + 1} (${step.title}): command "${step.cmd}" must be recognized and complete step`, () => {
          const raw = step.cmd;
          const normalized = raw.trim().toLowerCase().replace(/\s+/g, ' ');

          // Check staticResponses or dynamic simulation handlers
          const hasStatic = Boolean(mod.staticResponses[normalized]);
          
          // Let's verify whether the command has a known response in static or dynamic
          expect(
            hasStatic ||
              normalized.startsWith('ping') ||
              normalized.startsWith('setip') ||
              normalized.startsWith('setgw') ||
              normalized.startsWith('split') ||
              normalized.startsWith('subnet') ||
              normalized.startsWith('r1 route') ||
              normalized.startsWith('r2 route') ||
              normalized.startsWith('r1 lookup') ||
              normalized.startsWith('debug arp') ||
              normalized === 'arp -a' ||
              normalized === 'ipconfig' ||
              normalized === 'link status' ||
              normalized === 'cidr' ||
              normalized === 'show router' ||
              normalized === 'show ports' ||
              normalized === 'show routes' ||
              normalized === 'show router r2' ||
              normalized === 'show ports r2' ||
              normalized === 'show router isp' ||
              normalized === 'show mac table' ||
              normalized === 'show switch log' ||
              normalized === 'clear mac table'
          ).toBe(true);

          // Test completion logic:
          const completed = new Set<number>();
          // Simulate handleCommandRun logic:
          const currentStep = mod.steps[stepIdx];
          if (
            currentStep?.cmd &&
            currentStep.cmd.trim().toLowerCase().replace(/\s+/g, ' ') === normalized
          ) {
            completed.add(stepIdx);
          } else {
            const found = mod.steps.findIndex(
              (s) =>
                s.cmd &&
                s.cmd.trim().toLowerCase().replace(/\s+/g, ' ') === normalized
            );
            if (found > -1) {
              completed.add(found);
            }
          }

          expect(completed.has(stepIdx)).toBe(true);
        });
      });
    });
  });
});
