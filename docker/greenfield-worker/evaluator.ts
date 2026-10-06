/**
 * Greenfield Exam Container Evaluator CLI.
 * ─────────────────────────────────────────────────────────────────────────────
 * CLI entrypoint running inside the isolated evaluation container.
 * Reads submission JSON, executes the 4-gate runner, and writes result JSON.
 */

import fs from 'node:fs';
import path from 'node:path';
import { runGreenfieldExam } from '../../src/lib/prisma-engine/greenfield/exam-runner';
import type { GreenfieldSubmission } from '../../src/types/greenfield-exam';

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || '/sandbox/input/submission.json';
  const outputPath = args[1] || '/sandbox/output/result.json';

  if (!fs.existsSync(inputPath)) {
    console.error(`Input submission file not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf-8');
  let submission: GreenfieldSubmission;
  try {
    submission = JSON.parse(raw);
  } catch (err: any) {
    const errorResult = {
      passed: false,
      feedback: `Malformed submission JSON: ${err?.message}`,
      gateResults: [],
      totalDurationMs: 0,
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(errorResult, null, 2));
    process.exit(0);
  }

  const result = await runGreenfieldExam(submission);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Fatal evaluator crash:', err);
  process.exit(1);
});
