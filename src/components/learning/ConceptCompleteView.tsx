import React from 'react';
import { motion } from 'motion/react';
import { Concept } from '../../types/curriculum';

interface ConceptCompleteViewProps {
  concept: Concept;
  conceptIndex: number;
  totalConcepts: number;
  onContinueNextConcept: () => void;
}

export const ConceptCompleteView: React.FC<ConceptCompleteViewProps> = ({
  concept,
  conceptIndex,
  totalConcepts,
  onContinueNextConcept,
}) => {
  const isLastConcept = conceptIndex >= totalConcepts - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-xl rounded-xl border border-outline-variant/80 bg-surface-container p-6 shadow-xl space-y-5 text-center"
    >
      {/* Minimal Icon */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20 text-primary border border-primary-container/40 shadow-[0_0_12px_rgba(0,173,181,0.3)]">
        <span className="material-symbols-outlined text-[24px]">check</span>
      </div>

      <div className="space-y-1.5">
        <span className="font-label-sm text-xs text-primary uppercase tracking-wider">
          Concept {concept.order} of {totalConcepts} Complete
        </span>
        <h2 className="font-headline-sm text-xl font-bold tracking-tight text-on-surface">
          {concept.title} Mastered
        </h2>
        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed font-body-md">
          {concept.shortDescription}
        </p>
      </div>

      {/* Mastery Points Checklist */}
      <div className="rounded-lg border border-outline-variant/60 bg-surface-dim p-4 text-left space-y-2">
        <span className="font-label-sm text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
          Key Takeaways:
        </span>
        <div className="space-y-1.5">
          {concept.masteryPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-on-surface/90">
              <span className="text-primary font-mono">✓</span>
              <span className="leading-relaxed font-body-md">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Action Button */}
      <div className="pt-1">
        <button
          onClick={onContinueNextConcept}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-2.5 font-label-sm text-xs font-semibold text-on-primary-container hover:brightness-110 active:scale-95 transition cursor-pointer shadow-[0_0_8px_rgba(0,173,181,0.25)]"
        >
          <span>{isLastConcept ? 'Proceed to Independent Challenge' : 'Continue to Next Concept'}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
};
