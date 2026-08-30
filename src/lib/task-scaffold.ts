/**
 * Task editor scaffold (P9.7).
 *
 * Task `initialSql` strings lead with `--` instruction comments that, until now,
 * sat inside the editor as if the learner had typed them. The instruction text
 * belongs in the editor PLACEHOLDER (dim, disappears on first keystroke, comes
 * back when cleared); only the real code scaffolding belongs in the editor.
 */
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