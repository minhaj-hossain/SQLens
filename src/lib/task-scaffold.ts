/**
 * Task editor scaffold (P9.7).
 *
 * Task `initialSql` strings lead with `--` instruction comments that, until now,
 * sat inside the editor as if the learner had typed them. The instruction text
 * belongs in the editor PLACEHOLDER (dim, disappears on first keystroke, comes
 * back when cleared); only the real code scaffolding belongs in the editor.
 */
import type { PracticeTask } from '../types/curriculum';

export interface TaskScaffold {
  /** Leading full-line `--` comments (the task guidance), for the placeholder. */
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
 * Dynamic editor placeholder built from the task's own metadata.
 *
 * The instruction text must never sit inside the editor as typed-in comments —
 * it renders in the placeholder instead (dim, vanishes on first keystroke,
 * returns when the editor is cleared). Built live from title/description/
 * instructions so content edits in the curriculum flow through automatically.
 */
export function buildEditorPlaceholder(
  task: Pick<PracticeTask, 'title' | 'description' | 'instructions'>,
): string {
  const lines: string[] = [];
  const title = task.title?.trim() ?? '';
  if (title) lines.push(`-- ${title}`);
  const description = task.description?.trim() ?? '';
  if (description && description !== title) lines.push(`-- ${description}`);
  for (const instruction of task.instructions ?? []) {
    const text = instruction.trim();
    if (text) lines.push(`-- ${text}`);
  }
  if (lines.length === 0) return '-- Write your SQL query here\n';
  return lines.join('\n') + '\n';
}