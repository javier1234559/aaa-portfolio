export enum ProjectPhase {
  SALES = 'Sales',
  DISCOVERY = 'Discovery',
  BUILD = 'Build',
  QA = 'QA',
  UAT = 'UAT',
  MAINTENANCE = 'Maintenance'
}

export interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
}

export interface JiraTask {
  id: string;
  title: string;
  status: string;
  stream: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  participants: string[];
}

export interface PhaseDetails {
  meetings?: Meeting[];
  commits?: Commit[];
  jiraTasks?: JiraTask[];
  notes?: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  company?: string;
}

export interface OperationalLink {
  label: string;
  url: string;
  icon: string;
}

export interface ProjectData {
  name: string;
  status: string;
  description: string;
  client: string;
  slug: string;
  engagement: string;
  currentPhase: ProjectPhase;
  health: 'On Track' | 'At Risk' | 'Delayed';
  progress: number;
  deliveryTeam: Stakeholder[];
  operationalLinks: OperationalLink[];
  phaseContent: Record<ProjectPhase, PhaseDetails>;
}
