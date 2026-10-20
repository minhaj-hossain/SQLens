import { describe, it, expect } from 'vitest';
import { NET_01_MENTOR_SCRIPT } from '../../src/content/networking/modules/net-01';

describe('Networking Track — Module 1 Socratic Architecture & Quality Audits', () => {
  it('contains exactly 8 beats spanning Session A and Session B', () => {
    expect(NET_01_MENTOR_SCRIPT.beats).toHaveLength(8);
    expect(NET_01_MENTOR_SCRIPT.beats.map((b) => b.id)).toEqual([
      'beat-1',
      'beat-2',
      'beat-3',
      'beat-4',
      'beat-5',
      'beat-6',
      'beat-7',
      'beat-8',
    ]);
  });

  it('guarantees zero-spoiler in Beat 1 prompt (does not mention disconnected cable)', () => {
    const beat1 = NET_01_MENTOR_SCRIPT.beats[0];
    const text = (beat1.say || [beat1.text || '']).join(' ').toLowerCase();

    expect(text).not.toContain('disconnected cable');
    expect(text).not.toContain('unplugged');
    expect(text).not.toContain('carrier');
    expect(text).not.toContain('hardware failure');
    expect(text).toContain('test the connection');
    expect(text).toContain('ping 192.168.1.1');
  });

  it('guarantees zero-spoiler in Beat 5 prompt (does not explain ARP protocol prior to action)', () => {
    const beat5 = NET_01_MENTOR_SCRIPT.beats[4];
    const text = (beat5.say || [beat5.text || '']).join(' ').toLowerCase();

    expect(text).not.toContain('broadcast');
    expect(text).not.toContain('who has');
    expect(text).not.toContain('request reply');
    expect(text).toContain('arp -a');
  });

  it('tests new case (192.168.2.5) in Beat 4 subnet evidence question', () => {
    const beat4 = NET_01_MENTOR_SCRIPT.beats[3];
    expect(beat4.kind).toBe('predict');
    if (beat4.kind === 'predict') {
      const text = (beat4.say || [beat4.text || '']).join(' ');
      expect(text).toContain('192.168.2.5');
      const correctOpt = beat4.options.find((o) => o.isCorrect);
      expect(correctOpt).toBeDefined();
      expect(correctOpt!.label).toContain('different street');
    }
  });

  it('Beat 8 matches Destination MAC to dynamic ARP entry and distinguishes envelope packaging', () => {
    const beat8 = NET_01_MENTOR_SCRIPT.beats[7];
    expect(beat8.kind).toBe('predict');
    if (beat8.kind === 'predict') {
      const text = (beat8.say || [beat8.text || '']).join(' ');
      expect(text).toContain('00-1A-2B-3C-4D-01');
      const correctOpt = beat8.options.find((o) => o.isCorrect);
      expect(correctOpt).toBeDefined();
      expect(correctOpt!.label).toContain('dynamic ARP address book entry');
    }
  });

  it('all option chips provide immediate authored feedback', () => {
    const predictBeats = NET_01_MENTOR_SCRIPT.beats.filter((b) => b.kind === 'predict');
    expect(predictBeats.length).toBeGreaterThanOrEqual(3);

    for (const b of predictBeats) {
      if (b.kind === 'predict') {
        for (const opt of b.options) {
          expect(opt.feedback).toBeDefined();
          expect(opt.feedback.length).toBeGreaterThan(15);
        }
      }
    }
  });

  it('contains all 7 required core terms in terms dictionary with valid part targets', () => {
    const requiredTerms = ['endpoints', 'media', 'layer1', 'switch', 'arp', 'mac', 'envelope'];
    for (const key of requiredTerms) {
      expect(NET_01_MENTOR_SCRIPT.terms[key]).toBeDefined();
      expect(NET_01_MENTOR_SCRIPT.terms[key].label.length).toBeGreaterThan(0);
      expect(NET_01_MENTOR_SCRIPT.terms[key].explanation).toBeDefined();
    }
  });
});
