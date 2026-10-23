export interface NetworkingStepReadItem {
  term: string;
  explanation: string;
}

export interface NetworkingStep {
  group: string; // "Idea 1 of 5 · The connection"
  title: string; // "The cable: the physical link"
  what: string;
  why?: string;
  pic?: string; // canvas description text
  read: [string, string][]; // [Term / Key, Plain explanation]
  rem: string; // The core takeaway callout
  task: string;
  cmd: string | null; // Null for recap
}

export interface NetworkingModule {
  id: string; // "net-01"
  dayNumber: number; // 1
  title: string; // "Day 1 · The First Link & Hardware Identity"
  shortTitle: string;
  steps: NetworkingStep[];
  staticResponses: Record<string, string>;
  initialDevices?: Record<string, unknown>;
}

export interface RoadmapDay {
  dayNumber: number;
  id: string;
  title: string;
}

export interface RoadmapStage {
  name: string;
  days: RoadmapDay[];
}
