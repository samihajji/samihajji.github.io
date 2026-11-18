/**
 * The growth trajectory. Dated milestones come from the CV and from git
 * history; `state` decides how each is drawn:
 *   done -> ink, now -> pencil, next -> dotted pencil.
 * This is a story of direction, not a measure of proficiency.
 */

export type State = 'done' | 'now' | 'next';

export interface Milestone {
  date: string;
  label: string;
  state: State;
}

export interface Chapter {
  name: string;
  period: string;
  text: string;
  state: State;
}

export const milestones: Milestone[] = [
  { date: 'Jul 2025', label: 'B.E. Computer Engineering', state: 'done' },
  { date: 'Oct 2025', label: 'Introduction to Linux (LFS101)', state: 'done' },
  { date: 'Dec 2025', label: 'AWS infrastructure across three repos', state: 'done' },
  { date: 'May 2026', label: 'Kubernetes course, Boot.dev', state: 'done' },
  { date: 'Jun 2026', label: 'DevOps internship starts', state: 'done' },
  { date: 'Aug 2026', label: 'Argo CD app-of-apps platform', state: 'done' },
  { date: 'Sep 2026', label: 'CKA preparation course completed', state: 'done' },
  { date: 'Nov 2026', label: 'Cilium and eBPF on private AKS', state: 'done' },
  { date: 'Next', label: 'Platform cluster on AKS', state: 'now' },
  { date: 'Later', label: 'Platform APIs, Crossplane', state: 'next' },
];

export const chapters: Chapter[] = [
  {
    name: 'Systems foundations',
    period: '2025',
    text: 'Computer networks, operating systems and distributed systems at university, then Linux on my own. Everything later stands on this.',
    state: 'done',
  },
  {
    name: 'Cloud and infrastructure as code',
    period: 'Dec 2025 – Jan 2026',
    text: 'Terraform modules with versions, review-gated pipelines, and OIDC instead of stored cloud keys, on AWS.',
    state: 'done',
  },
  {
    name: 'Kubernetes engineering',
    period: '2026',
    text: 'Boot.dev, then four months running clusters as a DevOps intern: Helm, node-level debugging, storage, DNS and control-plane failures.',
    state: 'done',
  },
  {
    name: 'Platform delivery',
    period: 'Summer 2026',
    text: 'GitOps with Argo CD: sync waves, an internal PKI, Gateway API, secrets kept in Git and monitoring delivered the same way.',
    state: 'done',
  },
  {
    name: 'Current direction',
    period: 'Now',
    text: 'Azure platform engineering, Cilium and eBPF, workload identity and OpenTelemetry. Preparing for the CKA exam, which I haven’t taken yet.',
    state: 'now',
  },
  {
    name: 'Still exploring',
    period: 'Later',
    text: 'Platform APIs, Crossplane and deeper cloud-native networking.',
    state: 'next',
  },
];
