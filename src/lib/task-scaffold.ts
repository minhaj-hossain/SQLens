/**
 * Task editor scaffold (P9.7).
 *
 * Task `initialSql` strings lead with `--` instruction comments. Those comments
 * are stripped out of the editor entirely — the editor starts clean with only
 * the real code scaffolding (see buildEditorPlaceholder, which intentionally
 * renders no `--` hint lines). Guidance lives in the task card instead.
 */
import type { PracticeTask } from '../types/curriculum';

export interface TaskScaffold {
  /** Leading full-line `--` comments stripped from the code (kept for reference). */
  placeholder: string;
  /** The actual starting code, with leading comments/blank lines stripped. */
  code: string;
}

export function splitTaskScaffold(initialSql: string | undefined): TaskScaffold {
  const lines = (initialSql ?? '').split('\n');
  let i = 0;
  const placeholderLines: string[] = [];
  while (i < lines.length && lines[i].trim().startsWith('--')) {
    placeholderLines.push(lines[i]);
    i++;
  }
  // Blank separator lines between the guidance and the code go with it.
  while (i < lines.length && lines[i].trim() === '') i++;
  return {
    placeholder: placeholderLines.join('\n'),
    code: lines.slice(i).join('\n'),
  };
}

/**
 * Dynamic editor placeholder — intentionally empty.
 *
 * Task guidance no longer renders as `--` comment lines inside the editor;
 * the editor starts clean. The task card (TaskInstructions) carries the
 * instructions, and any leading `--` comments in `initialSql` are already
 * split out by splitTaskScaffold so only real code lands in the editor.
 */
export function buildEditorPlaceholder(
  _task: Pick<PracticeTask, 'title' | 'description' | 'instructions'>,
): string {
  return '';
}