import { describe, it, expect } from 'vitest';
import {
  initMentorState,
  mentorScriptReducer,
  buildCumulativeReveals,
} from '../../src/components/learning/networking/mentor/useMentorScript';
import type { MentorScript } from '../../src/types/networking-curriculum';

describe('Mentor Mode: useMentorScript Reducer', () => {
  const mockScript: MentorScript = {
    moduleId: 'net-03',
    conceptId: 'mac-table-and-forwarding',
    tier: 'shadow',
    allowedTerms: ['switch', 'mac', 'port', 'flooding'],
    terms: {
      switch: { label: 'Switch', part: 'switch' },
      mac: { label: 'MAC Address', part: 'mac-table' },
    },
    beats: [
      {
        id: 'beat-1',
        kind: 'say',
        say: ['Welcome to the switch lab.'],
        reveal: ['hosts'],
        spotlight: 'hosts',
      },
      {
        id: 'beat-2',
        kind: 'point',
        say: ['Notice the 4 physical ports.'],
        reveal: ['switch', 'ports'],
        spotlight: 'ports',
      },
      {
        id: 'beat-3',
        kind: 'do',
        say: ['Click Transmit to send a frame from Host A.'],
        reveal: ['controls'],
        spotlight: 'controls',
        expect: 'transmit',
      },
      {
        id: 'beat-4',
        kind: 'predict',
        say: ['Where does the switch forward this frame?'],
        reveal: ['egress-ports'],
        spotlight: 'ports',
        options: [
          {
            id: 'opt-1',
            label: 'Out Port 2 only',
            isCorrect: false,
            feedback: 'The switch does not know where Host B is yet.',
          },
          {
            id: 'opt-2',
            label: 'Floods out Ports 2, 3, 4',
            isCorrect: true,
            feedback: 'Correct! An unknown destination triggers a flood.',
            egressPorts: [2, 3, 4],
          },
          {
            id: 'opt-3',
            label: 'Drops the frame',
            isCorrect: false,
            feedback: 'Switches never drop frames just because the destination is unknown.',
          },
        ],
        whyPrompt: 'Why does the switch flood?',
        whyOptions: [
          {
            id: 'why-1',
            label: 'Because the CAM table has no entry for Destination B',
            isCorrect: true,
            feedback: 'Exactly. Unknown unicast flooding ensures the frame reaches B.',
          },
          {
            id: 'why-2',
            label: 'Because Port 1 is broken',
            isCorrect: false,
            feedback: 'Port 1 received the frame normally.',
          },
        ],
        reactions: {
          correct: ['Boom! Exactly right.'],
          wrong: {
            0: ['Check the table first. Is B in the table?'],
            2: ['Switches do not drop unknown frames; they flood.'],
          },
          fallback: ['Not quite. Think about how a switch learns.'],
          hintAfter: 2,
        },
      },
      {
        id: 'beat-5',
        kind: 'fill',
        say: ['Enter the learned MAC and Port.'],
        fields: [
          { id: 'port', label: 'Port', expected: '1' },
          { id: 'mac', label: 'MAC', expected: 'AA:AA:AA:AA:AA:AA' },
        ],
        reactions: {
          correct: ['Both fields match CAM state!'],
          fallback: ['Check the arrival port and source MAC.'],
          hintAfter: 2,
        },
      },
      {
        id: 'beat-6',
        kind: 'debrief',
        say: ['Field secret: flooding is normal on cold start.'],
      },
    ],
  };

  it('initializes state correctly on beat 0 with cumulative reveals', () => {
    const state = initMentorState(mockScript);
    expect(state.beatIndex).toBe(0);
    expect(state.revealedParts.has('hosts')).toBe(true);
    expect(state.revealedParts.has('switch')).toBe(false);
    expect(state.currentSpotlight).toBe('hosts');
    expect(state.bubbles).toEqual(['Welcome to the switch lab.']);
    expect(state.isWaitingForAction).toBe(false);
    expect(state.isCompleted).toBe(false);
  });

  it('advances on NEXT and strictly accumulates revealed parts', () => {
    let state = initMentorState(mockScript);
    expect(state.beatIndex).toBe(0);

    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    expect(state.beatIndex).toBe(1);
    expect(state.revealedParts.has('hosts')).toBe(true);
    expect(state.revealedParts.has('switch')).toBe(true);
    expect(state.revealedParts.has('ports')).toBe(true);
    expect(state.currentSpotlight).toBe('ports');
  });

  it('blocks NEXT on a "do" beat until ACTION_DONE is fired with the expected action', () => {
    let state = initMentorState(mockScript);
    // Advance to beat 1
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    // Advance to beat 2 (kind: 'do', expect: 'transmit')
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    expect(state.beatIndex).toBe(2);
    expect(state.isWaitingForAction).toBe(true);

    // Attempting NEXT while waiting must do nothing
    const blockedState = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    expect(blockedState.beatIndex).toBe(2);

    // Irrelevant action does not unlock
    const wrongActionState = mentorScriptReducer(
      state,
      { type: 'ACTION_DONE', action: { type: 'step' } },
      mockScript,
    );
    expect(wrongActionState.isWaitingForAction).toBe(true);

    // Matching action unlocks
    const unlockedState = mentorScriptReducer(
      state,
      { type: 'ACTION_DONE', action: { type: 'transmit' } },
      mockScript,
    );
    expect(unlockedState.isWaitingForAction).toBe(false);

    // Now NEXT advances to beat 3
    const nextState = mentorScriptReducer(unlockedState, { type: 'NEXT' }, mockScript);
    expect(nextState.beatIndex).toBe(3);
  });

  it('handles predict beats with targeted wrong reactions, attempt counter, and hint threshold', () => {
    let state = initMentorState(mockScript);
    // Advance to beat 3 (predict)
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript); // beat 1
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript); // beat 2
    state = mentorScriptReducer(
      state,
      { type: 'ACTION_DONE', action: { type: 'transmit' } },
      mockScript,
    ); // unlock beat 2
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript); // beat 3
    expect(state.beatIndex).toBe(3);
    expect(state.isPredictionResolved).toBe(false);

    // NEXT must be blocked
    expect(mentorScriptReducer(state, { type: 'NEXT' }, mockScript).beatIndex).toBe(3);

    // Select wrong option 0 (Out Port 2 only)
    state = mentorScriptReducer(state, { type: 'SELECT_PREDICTION', optionIndex: 0 }, mockScript);
    expect(state.isPredictionResolved).toBe(false);
    expect(state.attempts).toBe(1);
    expect(state.hintVisible).toBe(false);
    expect(state.reactionBubbles).toEqual(['Check the table first. Is B in the table?']);

    // Select wrong option 2 (Drops the frame) -> attempts reaches 2 (hintAfter = 2)
    state = mentorScriptReducer(state, { type: 'SELECT_PREDICTION', optionIndex: 2 }, mockScript);
    expect(state.attempts).toBe(2);
    expect(state.hintVisible).toBe(true);
    expect(state.reactionBubbles).toEqual(['Switches do not drop unknown frames; they flood.']);

    // Select correct option 1 (Floods)
    state = mentorScriptReducer(state, { type: 'SELECT_PREDICTION', optionIndex: 1 }, mockScript);
    expect(state.isPredictionResolved).toBe(true);
    expect(state.reactionBubbles).toEqual(['Boom! Exactly right.']);

    // But beat has whyOptions, so isWhyResolved must still block NEXT
    expect(state.isWhyResolved).toBe(false);
    expect(mentorScriptReducer(state, { type: 'NEXT' }, mockScript).beatIndex).toBe(3);

    // Select correct why option 0
    state = mentorScriptReducer(state, { type: 'SELECT_WHY', whyIndex: 0 }, mockScript);
    expect(state.isWhyResolved).toBe(true);

    // Now NEXT successfully advances to beat 4 (fill)
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    expect(state.beatIndex).toBe(4);
  });

  it('validates fill beats case-insensitively and triggers correct reaction', () => {
    let state = initMentorState(mockScript);
    // Jump manually to beat 4
    state = {
      ...state,
      beatIndex: 4,
      isFillResolved: false,
    };

    // Submitting wrong values fails
    state = mentorScriptReducer(
      state,
      { type: 'SUBMIT_FILL', values: { port: '2', mac: 'AA:AA:AA:AA:AA:AA' } },
      mockScript,
    );
    expect(state.isFillResolved).toBe(false);
    expect(state.attempts).toBe(1);

    // Submitting correct values (with whitespace or lowercase) passes
    state = mentorScriptReducer(
      state,
      { type: 'SUBMIT_FILL', values: { port: '1', mac: 'aa:aa:aa:aa:aa:aa ' } },
      mockScript,
    );
    expect(state.isFillResolved).toBe(true);
    expect(state.reactionBubbles).toEqual(['Both fields match CAM state!']);

    // Advance to final debrief beat
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    expect(state.beatIndex).toBe(5);

    // Final NEXT completes the script
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript);
    expect(state.isCompleted).toBe(true);
  });

  it('replays a beat cleanly resetting reactions, attempts and selections', () => {
    let state = initMentorState(mockScript);
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript); // beat 1
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript); // beat 2
    state = mentorScriptReducer(
      state,
      { type: 'ACTION_DONE', action: { type: 'transmit' } },
      mockScript,
    );
    state = mentorScriptReducer(state, { type: 'NEXT' }, mockScript); // beat 3 (predict)

    // Make an attempt
    state = mentorScriptReducer(state, { type: 'SELECT_PREDICTION', optionIndex: 0 }, mockScript);
    expect(state.attempts).toBe(1);
    expect(state.reactionBubbles.length).toBeGreaterThan(0);

    // REPLAY_BEAT resets attempts and reactions
    state = mentorScriptReducer(state, { type: 'REPLAY_BEAT' }, mockScript);
    expect(state.attempts).toBe(0);
    expect(state.reactionBubbles).toEqual([]);
    expect(state.selectedOptionIndex).toBe(null);
    expect(state.isPredictionResolved).toBe(false);
    expect(state.revealedParts.has('egress-ports')).toBe(true);
  });

  it('buildCumulativeReveals never drops previously revealed elements', () => {
    const revealed0 = buildCumulativeReveals(mockScript.beats, 0);
    const revealed2 = buildCumulativeReveals(mockScript.beats, 2);
    const revealed4 = buildCumulativeReveals(mockScript.beats, 4);

    expect(revealed0.size).toBeLessThan(revealed2.size);
    expect(revealed2.size).toBeLessThan(revealed4.size);

    for (const item of revealed0) {
      expect(revealed2.has(item)).toBe(true);
      expect(revealed4.has(item)).toBe(true);
    }
  });
});
