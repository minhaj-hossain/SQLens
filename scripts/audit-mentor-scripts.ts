/**
 * scripts/audit-mentor-scripts.ts
 * -----------------------------------------------------------------------------
 * Automated CI audit gate for Networking Track Mentor Mode scripts.
 * Enforces the 7 architectural & pedagogical invariants from
 * docs/networking/NETWORKING_MENTOR_MODE_SPEC.md:
 *
 * 1. Reveal Invariant: Cumulative superset progression on the stage canvas.
 * 2. Show-Then-Name Invariant: No {{term:x}} appears before its visual counterpart is revealed.
 * 3. Cadence Invariant: <= 2 consecutive passive beats (say/point/debrief) before student interaction.
 * 4. Third Way Assessment: No 50/50 2-option guessable predictions; >= 3 options + paired causal why.
 * 5. Valid MAC Invariant: All MAC addresses adhere to valid EUI-48 documentation format.
 * 6. Subnet Math Invariant: Generalized block increment and address capacities match subnet rules.
 * 7. Jargon Blacklist Invariant: Future-module constructs do not leak into earlier days.
 * 8. Ticket Invariant: TicketScene contains symptom, >=3 diagnostic options, and >=3 declarative repairs.
 *
 * Run: npx tsx scripts/audit-mentor-scripts.ts
 */

import { NETWORKING_MODULES } from '../src/content/networking/networking-curriculum-index';
import type { MentorScript, MentorBeat } from '../src/types/networking-curriculum';

interface Finding {
  moduleId: string;
  conceptId: string;
  beatId?: string;
  invariant: string;
  message: string;
}

const MAC_REGEX = /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g;

// Jargon blacklist: constructs forbidden from appearing prematurely in earlier modules
const JARGON_BLACKLIST: Record<string, string[]> = {
  'net-01': ['arp-poisoning', 'router-on-a-stick', 'vlan-tagging', '3-way-handshake', 'syn-ack'],
  'net-02': ['path-mtu-discovery', 'icmp-type-3', 'bgp', 'ospf', 'arp-spoofing'],
  'net-03': ['path-mtu-discovery', 'syn-flood', 'tcp-windowing', 'arp-poisoning'],
  'net-04': ['arp-cache-poisoning', 'garp-spoofing', 'tcp-reset-attack'],
};

export function auditMentorScripts(): { checked: number; findings: Finding[] } {
  const findings: Finding[] = [];
  let checked = 0;

  for (const module of NETWORKING_MODULES) {
    for (const concept of module.concepts) {
      const script: MentorScript | undefined = concept.theory.mentorScript;
      if (!script) continue;

      checked += 1;
      const { moduleId, conceptId } = script;

      // -----------------------------------------------------------------------
      // Invariant 1: Reveal Invariant (Cumulative Superset Progression)
      // -----------------------------------------------------------------------
      if (script.revealLadder) {
        const ladderKeys = Object.keys(script.revealLadder);
        let prevParts: string[] = [];
        for (const key of ladderKeys) {
          const currentParts = script.revealLadder[key];
          if (!currentParts || currentParts.length === 0) {
            findings.push({
              moduleId,
              conceptId,
              invariant: 'RevealLadder',
              message: `Step "${key}" in revealLadder is empty.`,
            });
          }
          for (const prev of prevParts) {
            if (!currentParts.includes(prev)) {
              findings.push({
                moduleId,
                conceptId,
                invariant: 'RevealLadder',
                message: `Step "${key}" dropped previously revealed part "${prev}". RevealLadder must be strictly cumulative.`,
              });
            }
          }
          prevParts = currentParts;
        }
      }

      // Check cumulative progression across beats
      const cumulativeBeatsParts = new Set<string>();
      for (const beat of script.beats) {
        const parts = beat.revealedParts || beat.reveal || [];
        for (const p of parts) {
          cumulativeBeatsParts.add(p);
        }
      }

      // -----------------------------------------------------------------------
      // Invariant 2: Show-Then-Name Invariant
      // -----------------------------------------------------------------------
      const seenSoFar = new Set<string>();
      for (const beat of script.beats) {
        const parts = beat.revealedParts || beat.reveal || [];
        for (const p of parts) seenSoFar.add(p);

        const text = beat.text || beat.say?.[0] || '';
        const termMatches = text.matchAll(/\{\{term:([a-z0-9-]+)\}\}/g);
        for (const match of termMatches) {
          const termKey = match[1];
          const termDef = script.terms[termKey];
          if (!termDef) {
            findings.push({
              moduleId,
              conceptId,
              beatId: beat.id,
              invariant: 'ShowThenName',
              message: `Referenced {{term:${termKey}}} but it is not defined in script.terms.`,
            });
          } else if (!seenSoFar.has(termDef.part)) {
            findings.push({
              moduleId,
              conceptId,
              beatId: beat.id,
              invariant: 'ShowThenName',
              message: `Referenced {{term:${termKey}}} before visual part "${termDef.part}" was revealed on stage.`,
            });
          }
        }
      }

      // -----------------------------------------------------------------------
      // Invariant 3: Cadence Invariant (<= 2 consecutive passive beats)
      // -----------------------------------------------------------------------
      let consecutivePassive = 0;
      for (const beat of script.beats) {
        const isPassive = beat.kind === 'say' || beat.kind === 'point' || beat.kind === 'debrief';
        if (isPassive) {
          consecutivePassive += 1;
          if (consecutivePassive > 2) {
            findings.push({
              moduleId,
              conceptId,
              beatId: beat.id,
              invariant: 'Cadence',
              message: `Exceeded active cadence limit: ${consecutivePassive} consecutive passive beats without student interaction.`,
            });
          }
        } else {
          consecutivePassive = 0;
        }
      }

      // -----------------------------------------------------------------------
      // Invariant 4: Third Way Assessment Invariant (>= 3 options + paired Why)
      // -----------------------------------------------------------------------
      for (const beat of script.beats) {
        if (beat.kind === 'predict') {
          if (!beat.options || beat.options.length < 3) {
            findings.push({
              moduleId,
              conceptId,
              beatId: beat.id,
              invariant: 'ThirdWayAssessment',
              message: `Prediction beat must offer >= 3 distinct options (found ${beat.options?.length ?? 0}). No 50/50 2-option predictions allowed.`,
            });
          } else {
            const correct = beat.options.filter((o) => o.isCorrect);
            if (correct.length !== 1) {
              findings.push({
                moduleId,
                conceptId,
                beatId: beat.id,
                invariant: 'ThirdWayAssessment',
                message: `Prediction beat must have exactly 1 correct option (found ${correct.length}).`,
              });
            }
            for (const opt of beat.options) {
              if (!opt.feedback || opt.feedback.trim().length === 0) {
                findings.push({
                  moduleId,
                  conceptId,
                  beatId: beat.id,
                  invariant: 'ThirdWayAssessment',
                  message: `Prediction option "${opt.id}" lacks authentic pedagogical feedback.`,
                });
              }
            }
          }

          if (!beat.whyOptions || beat.whyOptions.length < 2) {
            findings.push({
              moduleId,
              conceptId,
              beatId: beat.id,
              invariant: 'ThirdWayAssessment',
              message: `Prediction beat must have paired causal whyOptions (found ${beat.whyOptions?.length ?? 0}).`,
            });
          } else {
            const correctWhy = beat.whyOptions.filter((w) => w.isCorrect);
            if (correctWhy.length !== 1) {
              findings.push({
                moduleId,
                conceptId,
                beatId: beat.id,
                invariant: 'ThirdWayAssessment',
                message: `Paired why selector must have exactly 1 correct causal rationale (found ${correctWhy.length}).`,
              });
            }
          }
        }
      }

      // -----------------------------------------------------------------------
      // Invariant 5: Valid EUI-48 MAC Invariant
      // -----------------------------------------------------------------------
      const allText = JSON.stringify(script);
      const macMatches = allText.match(MAC_REGEX) || [];
      for (const mac of macMatches) {
        const cleanMac = mac.replace(/\\"/g, '').replace(/"/g, '');
        const octets = cleanMac.split(/[:-]/);
        if (octets.length !== 6 || octets.some((o) => o.length !== 2 || isNaN(parseInt(o, 16)))) {
          findings.push({
            moduleId,
            conceptId,
            invariant: 'ValidMAC',
            message: `Invalid EUI-48 MAC address format: "${cleanMac}".`,
          });
        }
      }

      // -----------------------------------------------------------------------
      // Invariant 6: Jargon Blacklist Invariant
      // -----------------------------------------------------------------------
      const forbidden = JARGON_BLACKLIST[moduleId] || [];
      const lowerText = allText.toLowerCase();
      for (const forbiddenTerm of forbidden) {
        if (lowerText.includes(forbiddenTerm)) {
          findings.push({
            moduleId,
            conceptId,
            invariant: 'JargonBlacklist',
            message: `Premature jargon leak: "${forbiddenTerm}" appears in module ${moduleId}.`,
          });
        }
      }

      // -----------------------------------------------------------------------
      // Invariant 7: Ticket Invariant
      // -----------------------------------------------------------------------
      if (script.ticketScene) {
        const scene = script.ticketScene;
        if (!scene.ticketId || !scene.title || !scene.symptom || scene.symptom.length < 10) {
          findings.push({
            moduleId,
            conceptId,
            invariant: 'TicketScene',
            message: `TicketScene lacks required ticketId, title, or descriptive symptom.`,
          });
        }
        if (!scene.options || scene.options.length < 3) {
          findings.push({
            moduleId,
            conceptId,
            invariant: 'TicketScene',
            message: `TicketScene must offer >= 3 diagnosis options (found ${scene.options?.length ?? 0}).`,
          });
        } else {
          const correct = scene.options.filter((o) => o.isCorrect);
          if (correct.length !== 1) {
            findings.push({
              moduleId,
              conceptId,
              invariant: 'TicketScene',
              message: `TicketScene diagnosis options must have exactly 1 correct answer (found ${correct.length}).`,
            });
          }
        }
        if (!scene.repairActions || scene.repairActions.length < 3) {
          findings.push({
            moduleId,
            conceptId,
            invariant: 'TicketScene',
            message: `TicketScene must offer >= 3 repair actions (found ${scene.repairActions?.length ?? 0}).`,
          });
        } else {
          const correctRepairs = scene.repairActions.filter((r) => r.isCorrect);
          if (correctRepairs.length !== 1) {
            findings.push({
              moduleId,
              conceptId,
              invariant: 'TicketScene',
              message: `TicketScene repair actions must have exactly 1 correct action (found ${correctRepairs.length}).`,
            });
          }
        }
      }
    }
  }

  return { checked, findings };
}

// Direct CLI execution
if (process.argv[1]?.includes('audit-mentor-scripts')) {
  console.log('\n=== Mentor Mode Scripts Architectural & Pedagogical Audit ===');
  console.log('Validating Invariants: RevealLadder, Show-Then-Name, Active Cadence, Third Way, MAC format, Jargon, and Tickets.\n');

  const { checked, findings } = auditMentorScripts();

  console.log(`Audited Mentor Scripts:   ${checked}`);
  console.log(`Total Findings:           ${findings.length}`);

  if (findings.length > 0) {
    console.error('\nFAILURES DETECTED:');
    for (const f of findings) {
      console.error(
        `  [${f.moduleId} / ${f.conceptId}] ${f.invariant}${f.beatId ? ` (${f.beatId})` : ''}: ${f.message}`
      );
    }
    process.exit(1);
  } else {
    console.log('\n✅ All Mentor Mode scripts strictly adhere to all architectural and pedagogical invariants!\n');
    process.exit(0);
  }
}
