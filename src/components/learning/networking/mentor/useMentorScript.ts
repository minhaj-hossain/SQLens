import { useReducer, useMemo, useCallback } from 'react';
import type {
  MentorScript,
  MentorBeat,
  MentorReactions,
} from '../../../../types/networking-curriculum';

export interface MentorState {
  beatIndex: number;
  revealedParts: Set<string>;
  currentSpotlight: string | null;
  bubbles: string[];
  reactionBubbles: string[];
  isWaitingForAction: boolean;
  isPredictionResolved: boolean;
  isWhyResolved: boolean;
  selectedOptionIndex: number | null;
  selectedWhyIndex: number | null;
  fillValues: Record<string, string>;
  isFillResolved: boolean;
  attempts: number;
  hintVisible: boolean;
  isCompleted: boolean;
}

export type MentorEvent =
  | { type: 'NEXT' }
  | { type: 'ACTION_DONE'; action: { type: string; payload?: unknown } }
  | { type: 'SELECT_PREDICTION'; optionIndex: number }
  | { type: 'SELECT_WHY'; whyIndex: number }
  | { type: 'SUBMIT_FILL'; values: Record<string, string> }
  | { type: 'TICKET_RESOLVED' }
  | { type: 'REPLAY_BEAT' };

export function buildCumulativeReveals(beats: MentorBeat[], upToIndex: number): Set<string> {
  const parts = new Set<string>();
  for (let i = 0; i <= upToIndex && i < beats.length; i++) {
    const beat = beats[i];
    if (beat.reveal) {
      for (const p of beat.reveal) {
        parts.add(p);
      }
    }
  }
  return parts;
}

export function getBeatBubbles(beat?: MentorBeat): string[] {
  if (!beat) return [];
  if (beat.say && beat.say.length > 0) return beat.say;
  if (beat.text) return [beat.text];
  return [];
}

export function initMentorState(script: MentorScript): MentorState {
  const firstBeat = script.beats[0];
  if (!firstBeat) {
    return {
      beatIndex: 0,
      revealedParts: new Set(),
      currentSpotlight: null,
      bubbles: [],
      reactionBubbles: [],
      isWaitingForAction: false,
      isPredictionResolved: true,
      isWhyResolved: true,
      selectedOptionIndex: null,
      selectedWhyIndex: null,
      fillValues: {},
      isFillResolved: true,
      attempts: 0,
      hintVisible: false,
      isCompleted: true,
    };
  }

  const revealed = buildCumulativeReveals(script.beats, 0);

  return {
    beatIndex: 0,
    revealedParts: revealed,
    currentSpotlight: firstBeat.spotlight ?? null,
    bubbles: getBeatBubbles(firstBeat),
    reactionBubbles: [],
    isWaitingForAction: firstBeat.kind === 'do',
    isPredictionResolved: firstBeat.kind !== 'predict',
    isWhyResolved: !(firstBeat.kind === 'predict' && 'whyPrompt' in firstBeat && firstBeat.whyPrompt),
    selectedOptionIndex: null,
    selectedWhyIndex: null,
    fillValues: {},
    isFillResolved: firstBeat.kind !== 'fill',
    attempts: 0,
    hintVisible: false,
    isCompleted: false,
  };
}

export function mentorScriptReducer(
  state: MentorState,
  event: MentorEvent,
  script: MentorScript,
): MentorState {
  const currentBeat = script.beats[state.beatIndex];
  if (!currentBeat) return state;

  switch (event.type) {
    case 'NEXT': {
      // Gate check: cannot advance if blocked by an unresolved task
      if (currentBeat.kind === 'do' && state.isWaitingForAction) {
        return state;
      }
      if (currentBeat.kind === 'predict' && (!state.isPredictionResolved || !state.isWhyResolved)) {
        return state;
      }
      if (currentBeat.kind === 'fill' && !state.isFillResolved) {
        return state;
      }

      const nextIndex = state.beatIndex + 1;
      if (nextIndex >= script.beats.length) {
        return {
          ...state,
          isCompleted: true,
        };
      }

      const nextBeat = script.beats[nextIndex];
      const nextRevealed = new Set(state.revealedParts);
      if (nextBeat.reveal) {
        for (const p of nextBeat.reveal) {
          nextRevealed.add(p);
        }
      }

      return {
        ...state,
        beatIndex: nextIndex,
        revealedParts: nextRevealed,
        currentSpotlight: nextBeat.spotlight ?? null,
        bubbles: getBeatBubbles(nextBeat),
        reactionBubbles: [],
        isWaitingForAction: nextBeat.kind === 'do',
        isPredictionResolved: nextBeat.kind !== 'predict',
        isWhyResolved: !(nextBeat.kind === 'predict' && 'whyPrompt' in nextBeat && nextBeat.whyPrompt),
        selectedOptionIndex: null,
        selectedWhyIndex: null,
        fillValues: {},
        isFillResolved: nextBeat.kind !== 'fill',
        attempts: 0,
        hintVisible: false,
      };
    }

    case 'ACTION_DONE': {
      if (currentBeat.kind !== 'do') return state;
      const expected = currentBeat.expect;
      if (!expected || event.action.type === expected || expected === '*') {
        return {
          ...state,
          isWaitingForAction: false,
        };
      }
      return state;
    }

    case 'SELECT_PREDICTION': {
      if (currentBeat.kind !== 'predict') return state;
      const option = currentBeat.options[event.optionIndex];
      if (!option) return state;

      const reactions: MentorReactions = currentBeat.reactions ?? {};
      const hintThreshold = reactions.hintAfter ?? 2;

      if (option.isCorrect) {
        const correctFeedback =
          reactions.correct && reactions.correct.length > 0
            ? reactions.correct
            : option.feedback
              ? [option.feedback]
              : ['Exactly right.'];

        return {
          ...state,
          selectedOptionIndex: event.optionIndex,
          isPredictionResolved: true,
          reactionBubbles: correctFeedback,
        };
      } else {
        const nextAttempts = state.attempts + 1;
        const wrongReaction =
          reactions.wrong?.[event.optionIndex] ??
          (option.feedback ? [option.feedback] : reactions.fallback ?? ['Not quite. Look closely at the highlighted element.']);

        return {
          ...state,
          selectedOptionIndex: event.optionIndex,
          isPredictionResolved: false,
          attempts: nextAttempts,
          reactionBubbles: wrongReaction,
          hintVisible: nextAttempts >= hintThreshold,
        };
      }
    }

    case 'SELECT_WHY': {
      if (currentBeat.kind !== 'predict' || !('whyOptions' in currentBeat) || !currentBeat.whyOptions) {
        return state;
      }
      const whyOption = currentBeat.whyOptions[event.whyIndex];
      if (!whyOption) return state;

      if (whyOption.isCorrect) {
        return {
          ...state,
          selectedWhyIndex: event.whyIndex,
          isWhyResolved: true,
          reactionBubbles: whyOption.feedback ? [whyOption.feedback] : ['Correct causal explanation.'],
        };
      } else {
        return {
          ...state,
          selectedWhyIndex: event.whyIndex,
          isWhyResolved: false,
          reactionBubbles: whyOption.feedback ? [whyOption.feedback] : ['Review the causal rule and try again.'],
        };
      }
    }

    case 'SUBMIT_FILL': {
      if (currentBeat.kind !== 'fill') return state;
      const allPassed = currentBeat.fields.every(
        (field) => (event.values[field.id] ?? '').trim().toLowerCase() === field.expected.trim().toLowerCase(),
      );

      const reactions: MentorReactions = currentBeat.reactions ?? {};
      const hintThreshold = reactions.hintAfter ?? 2;

      if (allPassed) {
        return {
          ...state,
          fillValues: event.values,
          isFillResolved: true,
          reactionBubbles: reactions.correct ?? ['All field values verified correctly.'],
        };
      } else {
        const nextAttempts = state.attempts + 1;
        return {
          ...state,
          fillValues: event.values,
          isFillResolved: false,
          attempts: nextAttempts,
          reactionBubbles: reactions.fallback ?? ['Some values do not match expected network calculation. Review and re-verify.'],
          hintVisible: nextAttempts >= hintThreshold,
        };
      }
    }

    case 'TICKET_RESOLVED': {
      if (currentBeat.kind !== 'ticket') return state;
      return {
        ...state,
        reactionBubbles: ['Ticket resolved. Verification telemetry confirmed.'],
      };
    }

    case 'REPLAY_BEAT': {
      const nextRevealed = buildCumulativeReveals(script.beats, state.beatIndex);
      return {
        ...state,
        revealedParts: nextRevealed,
        currentSpotlight: currentBeat.spotlight ?? null,
        bubbles: getBeatBubbles(currentBeat),
        reactionBubbles: [],
        isWaitingForAction: currentBeat.kind === 'do',
        isPredictionResolved: currentBeat.kind !== 'predict',
        isWhyResolved: !(currentBeat.kind === 'predict' && 'whyPrompt' in currentBeat && currentBeat.whyPrompt),
        selectedOptionIndex: null,
        selectedWhyIndex: null,
        fillValues: {},
        isFillResolved: currentBeat.kind !== 'fill',
        attempts: 0,
        hintVisible: false,
      };
    }

    default:
      return state;
  }
}

export function useMentorScript(script: MentorScript) {
  const [state, dispatch] = useReducer(
    (s: MentorState, e: MentorEvent) => mentorScriptReducer(s, e, script),
    script,
    initMentorState,
  );

  const currentBeat = useMemo(() => script.beats[state.beatIndex] ?? null, [script, state.beatIndex]);

  const handleNext = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const handleActionDone = useCallback(
    (action: { type: string; payload?: unknown }) => dispatch({ type: 'ACTION_DONE', action }),
    [],
  );
  const handleSelectPrediction = useCallback(
    (optionIndex: number) => dispatch({ type: 'SELECT_PREDICTION', optionIndex }),
    [],
  );
  const handleSelectWhy = useCallback(
    (whyIndex: number) => dispatch({ type: 'SELECT_WHY', whyIndex }),
    [],
  );
  const handleSubmitFill = useCallback(
    (values: Record<string, string>) => dispatch({ type: 'SUBMIT_FILL', values }),
    [],
  );
  const handleTicketResolved = useCallback(() => dispatch({ type: 'TICKET_RESOLVED' }), []);
  const handleReplay = useCallback(() => dispatch({ type: 'REPLAY_BEAT' }), []);

  return {
    state,
    currentBeat,
    handleNext,
    handleActionDone,
    handleSelectPrediction,
    handleSelectWhy,
    handleSubmitFill,
    handleTicketResolved,
    handleReplay,
    dispatch,
  };
}
