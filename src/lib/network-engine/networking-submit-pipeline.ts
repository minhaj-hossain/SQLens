/**
 * Networking Submit & Grading Pipeline — Gate 3.
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure grader for Layer 2 switching prediction tasks and causal defense questions.
 * Evaluates predictions, port selections, and judgment options without invoking
 * SQL or TypeScript compilers.
 *
 * Guarantees:
 *  - Explicit Misconception Remediation (e.g. Destination MAC learning confusion).
 *  - 100% pure deterministic execution with zero side-effects.
 *  - Compatible with `submitForTask` outcome contract.
 */

import type { PracticeTask } from '../../types/curriculum';
import type { GradingStage } from '../grading-telemetry';

export interface NetworkingSubmitOutcome {
  passed: boolean;
  feedback?: string;
  stage: GradingStage;
  isMisconception?: boolean;
}

export function isNetworkingTask(task: PracticeTask): boolean {
  if (!task) return false;
  return Boolean(
    task.networking ||
    task.subnetting ||
    task.arp ||
    task.packetInspection ||
    task.terminal ||
    task.ethernetFrame ||
    task.ipv6Ndp ||
    task.dhcp ||
    task.dns ||
    task.tcpLadder ||
    task.httpTls ||
    task.firewall ||
    task.vlanDijkstra ||
    task.id?.startsWith('net-') ||
    /^net\d+/i.test(task.id || '') ||
    task.solutionSql === 'NETWORKING_JUDGMENT_TASK' ||
    task.solutionSql?.startsWith('PREDICT_'),
  );
}

export interface NetworkingSubmitOptions {
  task: PracticeTask;
  judgmentAnswers?: (number | null)[];
  selectedOptionIndex?: number;
  selectedPorts?: number[];
}

export function gradeNetworkingSubmission(options: NetworkingSubmitOptions): NetworkingSubmitOutcome {
  const { task, judgmentAnswers, selectedOptionIndex, selectedPorts } = options;

  // 1. If explicit selectedOptionIndex is passed and task.networking has options
  if (
    selectedOptionIndex !== undefined &&
    selectedOptionIndex !== null &&
    task.networking?.options &&
    task.networking.options.length > 0
  ) {
    if (selectedOptionIndex !== task.networking.correctOptionIndex) {
      const chosenOpt = task.networking.options[selectedOptionIndex];
      const targetedRemediation =
        chosenOpt?.misconceptionExplanation ||
        task.networking.misconceptionRemediation?.[selectedOptionIndex] ||
        'Your prediction does not match switch CAM table learning and forwarding rules. Review which ports forward or flood.';

      return {
        passed: false,
        feedback: targetedRemediation,
        stage: 'validation',
        isMisconception: true,
      };
    }
  }

  // 2. Evaluate all judgment questions declared in task.validation.judgment
  const judgments = task.validation.judgment ?? [];
  if (judgments.length > 0) {
    for (let ji = 0; ji < judgments.length; ji++) {
      const jq = judgments[ji];
      const answer = judgmentAnswers?.[ji];

      if (answer === null || answer === undefined) {
        return {
          passed: false,
          feedback: `Please answer question ${ji + 1} before submitting: "${jq.prompt}"`,
          stage: 'validation',
        };
      }

      if (answer !== jq.correctIndex) {
        return {
          passed: false,
          feedback: `Question ${ji + 1} is not correct: "${jq.prompt}" — ${jq.explanation}`,
          stage: 'validation',
          isMisconception: true,
        };
      }
    }
  } else if (
    (selectedOptionIndex === undefined || selectedOptionIndex === null) &&
    task.networking?.options &&
    task.networking.options.length > 0
  ) {
    return {
      passed: false,
      feedback: 'Please select an answer to predict the switch forwarding behavior before checking.',
      stage: 'validation',
    };
  }

  // 3. Port match verification if specified in task.networking
  if (
    task.networking &&
    selectedPorts &&
    selectedPorts.length > 0 &&
    task.networking.expectedEgressPorts
  ) {
    const expected = [...task.networking.expectedEgressPorts].sort((a, b) => a - b);
    const actual = [...selectedPorts].sort((a, b) => a - b);
    const match =
      expected.length === actual.length && expected.every((val, idx) => val === actual[idx]);

    if (!match) {
      return {
        passed: false,
        feedback: `Selected egress ports [${actual.join(', ')}] do not match expected forwarding [${expected.join(', ')}].`,
        stage: 'validation',
      };
    }
  }

  return {
    passed: true,
    feedback: task.successMessage || 'Prediction verified! The switch behaved exactly according to Layer 2 rules.',
    stage: 'validation',
  };
}
