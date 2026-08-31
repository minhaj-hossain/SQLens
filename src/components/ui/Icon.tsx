'use client';

import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Ban,
  Bolt,
  Braces,
  Bug,
  Check,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  Database,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  ListTree,
  Lock,
  LockOpen,
  LogOut,
  Map,
  Medal,
  Network,
  Palette,
  Play,
  PlayCircle,
  RotateCcw,
  Rocket,
  School,
  Settings,
  ShieldCheck,
  Table2,
  Terminal,
  TriangleAlert,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Material-Symbol name → lucide icon mapping (Phase P1).
 * Kept as a string-keyed map so legacy ternaries like
 * `{copied ? 'check' : 'content_copy'}` keep working unchanged.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  award: Award,
  badge_check: BadgeCheck,
  block: Ban,
  bolt: Bolt,
  bug_report: Bug,
  cancel: XCircle,
  check: Check,
  check_circle: CheckCircle2,
  code: Code,
  content_copy: Copy,
  database: Database,
  science: FlaskConical,
  school: GraduationCap,
  account_tree: ListTree,
  lightbulb: Lightbulb,
  lock: Lock,
  lock_open: LockOpen,
  logout: LogOut,
  map: Map,
  workspace_premium: Medal,
  play_arrow: Play,
  play_circle: PlayCircle,
  quiz: CheckCircle2,
  restart_alt: RotateCcw,
  rocket_launch: Rocket,
  schema: Network,
  settings: Settings,
  shield_person: ShieldCheck,
  table_chart: Table2,
  palette: Palette,
  terminal: Terminal,
  tips_and_updates: Lightbulb,
  warning: TriangleAlert,
  verified: BadgeCheck,
  close: X,
  schedule: Clock,
  data_object: Braces,
};

interface IconProps {
  name?: string | null;
  className?: string;
}

/**
 * Renders a lucide SVG icon by legacy name. Size is derived from any
 * Tailwind `text-[Npx]` class present in `className` so call-sites can be
 * migrated mechanically without touching surrounding layout classes.
 */
export function Icon({ name, className }: IconProps) {
  if (!name) return null;
  const Cmp = ICON_MAP[name];
  if (!Cmp) return null;
  const match = className?.match(/text-\[(\d+(?:\.\d+)?)px\]/);
  const size = match ? Number(match[1]) : 16;
  return (
    <Cmp
      className={className}
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
      strokeWidth={2}
    />
  );
}

export default Icon;
