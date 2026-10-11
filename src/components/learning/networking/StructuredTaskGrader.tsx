'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

export interface StructuredFieldDef {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'select' | 'radio';
  options?: { label: string; value: string }[];
  expected: string | number;
  normalize?: (val: string) => string;
  misconceptions?: {
    test: (val: string) => boolean;
    feedback: string;
  }[];
  helperText?: string;
}

export interface StructuredTaskGraderProps {
  title?: string;
  description?: string;
  fields: StructuredFieldDef[];
  isPassed?: boolean;
  onGrade: (passed: boolean, details: { values: Record<string, string>; feedback: string }) => void;
  reflectionPrompt?: string;
  modelExplanation?: string;
  submitButtonLabel?: string;
}

export const StructuredTaskGrader: React.FC<StructuredTaskGraderProps> = ({
  title = 'Structured Calculation & Engineering Verification',
  description,
  fields,
  isPassed = false,
  onGrade,
  reflectionPrompt,
  modelExplanation,
  submitButtonLabel = 'Verify Calculation',
}) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.id] = '';
    });
    return initial;
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(isPassed);
  const [overallFeedback, setOverallFeedback] = useState<string | null>(null);
  const [reflectionAnswer, setReflectionAnswer] = useState<string>('');
  const [showModelExplanation, setShowModelExplanation] = useState<boolean>(isPassed);

  const handleChange = (fieldId: string, val: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
    // Clear error for that field
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleEvaluate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const errors: Record<string, string> = {};
    let firstMisconception: string | null = null;
    let allValid = true;

    fields.forEach((field) => {
      const rawVal = (values[field.id] || '').trim();
      const normVal = field.normalize ? field.normalize(rawVal) : rawVal;
      const expectedStr = String(field.expected).trim();

      if (!rawVal) {
        errors[field.id] = 'Field is required.';
        allValid = false;
        return;
      }

      // Check for targeted misconceptions
      if (field.misconceptions) {
        for (const misc of field.misconceptions) {
          if (misc.test(normVal)) {
            errors[field.id] = misc.feedback;
            if (!firstMisconception) firstMisconception = misc.feedback;
            allValid = false;
            return;
          }
        }
      }

      // Exact match check (case-insensitive for text)
      if (normVal.toLowerCase() !== expectedStr.toLowerCase()) {
        errors[field.id] = `Incorrect value. Check your arithmetic for ${field.label}.`;
        allValid = false;
      }
    });

    setFieldErrors(errors);
    setSubmitted(true);

    if (allValid) {
      setOverallFeedback('All calculations verified! Excellent technical accuracy.');
      setShowModelExplanation(true);
      onGrade(true, {
        values,
        feedback: 'Calculations verified! Excellent technical accuracy.',
      });
    } else {
      const feedback =
        firstMisconception ||
        'One or more values did not match the expected network parameters. Review the highlighted fields and retry.';
      setOverallFeedback(feedback);
      onGrade(false, { values, feedback });
    }
  };

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-5 sm:p-6 shadow-lg space-y-5 text-text"
      data-testid="structured-task-grader"
    >
      <div>
        <h3 className="font-mono text-base font-bold text-text flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-func" />
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-text-dim mt-1 font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <form onSubmit={handleEvaluate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const hasError = Boolean(fieldErrors[field.id]);
            const isCorrect = submitted && !hasError && Boolean(values[field.id]);

            return (
              <div
                key={field.id}
                className="space-y-1.5 p-3 rounded-xl border border-border-soft bg-surface-2/40"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <label
                    htmlFor={`field-${field.id}`}
                    className="font-semibold text-text flex items-center gap-1.5"
                  >
                    {field.label}
                  </label>
                  {isCorrect && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  )}
                </div>

                {field.type === 'select' && field.options ? (
                  <select
                    id={`field-${field.id}`}
                    value={values[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-surface-3 border font-mono text-xs sm:text-sm text-text focus:outline-none focus:ring-1 ${
                      hasError
                        ? 'border-rose-500/80 focus:ring-rose-500'
                        : isCorrect
                        ? 'border-emerald-500/60 focus:ring-emerald-500'
                        : 'border-border focus:ring-func'
                    }`}
                    data-testid={`field-input-${field.id}`}
                  >
                    <option value="">Select option...</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'radio' && field.options ? (
                  <div className="space-y-2 pt-1" data-testid={`field-radio-group-${field.id}`}>
                    {field.options.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                          values[field.id] === opt.value
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                            : 'bg-surface-3/50 border-border-soft text-text-dim hover:text-text'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`radio-${field.id}`}
                          value={opt.value}
                          checked={values[field.id] === opt.value}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="accent-blue-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    id={`field-${field.id}`}
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder || 'Enter value...'}
                    value={values[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-surface-3 border font-mono text-xs sm:text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 ${
                      hasError
                        ? 'border-rose-500/80 focus:ring-rose-500'
                        : isCorrect
                        ? 'border-emerald-500/60 focus:ring-emerald-500'
                        : 'border-border focus:ring-func'
                    }`}
                    data-testid={`field-input-${field.id}`}
                  />
                )}

                {/* Field-level error / misconception message */}
                {hasError && (
                  <div
                    className="text-[11px] font-mono text-rose-400 flex items-start gap-1 pt-0.5 leading-snug"
                    data-testid={`field-error-${field.id}`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{fieldErrors[field.id]}</span>
                  </div>
                )}

                {/* Helper text if available and no error */}
                {field.helperText && !hasError && (
                  <div className="text-[10px] font-mono text-text-muted">
                    {field.helperText}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {overallFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-mono leading-relaxed ${
                Object.keys(fieldErrors).length === 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
              data-testid="grader-feedback-banner"
            >
              {Object.keys(fieldErrors).length === 0 ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              )}
              <div>{overallFeedback}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-func hover:bg-func/90 text-white font-mono text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          data-testid="submit-structured-grader"
        >
          <span>{submitButtonLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Optional Ungraded Reflection & Model Explanation */}
      {reflectionPrompt && (
        <div className="pt-4 border-t border-border-soft space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-text-dim">
            <HelpCircle className="w-3.5 h-3.5 text-func" />
            <span className="font-bold uppercase tracking-wider">Engineering Reflection (Ungraded)</span>
          </div>
          <p className="text-xs text-text-dim font-sans">{reflectionPrompt}</p>
          <textarea
            value={reflectionAnswer}
            onChange={(e) => setReflectionAnswer(e.target.value)}
            placeholder="Write your explanation or reasoning in your own words..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-surface-3 border border-border font-mono text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-func"
            data-testid="reflection-input"
          />

          {showModelExplanation && modelExplanation && (
            <div className="p-3.5 rounded-xl bg-surface-2 border border-border-soft space-y-1 text-xs font-mono">
              <span className="text-[11px] font-bold text-func uppercase tracking-wider block">
                Expert Reference Model:
              </span>
              <p className="text-text-dim leading-relaxed font-sans">{modelExplanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
