/**
 * The log: experience, education and training, summarised from the CV.
 * No employer-confidential details: no client names, internal hostnames,
 * private repositories or configuration.
 */

export interface LogEntry {
  id: string;
  kind: 'Work' | 'Education';
  title: string;
  org: string;
  period: string;
  place?: string;
  summary: string;
  points: string[];
}

export const log: LogEntry[] = [
  {
    id: 'log-internship',
    kind: 'Work',
    title: 'DevOps Intern',
    org: 'Foothill Technology Solutions, LLC',
    period: 'June – September 2026',
    place: 'Onsite',
    summary:
      'Selected from a Boot.dev pre-internship program of about 300 participants for an 11-person onsite engineering cohort. I was the only DevOps intern, with weekly mentorship from a senior DevOps engineer.',
    points: [
      'Built and operated multi-node Kubernetes environments for production-style applications with Helm, Argo CD, Envoy Gateway, Sealed Secrets, cert-manager and kube-prometheus-stack.',
      'Wrote reusable Helm charts with templating helpers, conditional logic and per-environment values, and audited and customised third-party charts without vendoring them.',
      'Ran GitOps delivery with Argo CD: pinned chart versions, CLI-driven diff and sync, sync waves, self-heal, pruning, ignoreDifferences and Server-Side Apply.',
      'Configured shared Gateway API infrastructure for Argo CD, Grafana and application APIs, with TLS termination, gRPC support and certificates from a trusted internal CA.',
      'Kept secrets in Git with Sealed Secrets, and backed up the controller’s private key for disaster recovery.',
      'Resolved real cluster incidents: API server availability, kubelet behaviour, container failures, PVC and filesystem permissions, resource exhaustion, DNS and service connectivity, using crictl, journalctl, debug pods and node-level inspection.',
      'Led a system design book discussion series for the other engineering interns.',
    ],
  },
  {
    id: 'log-education',
    kind: 'Education',
    title: 'B.E. Computer Engineering',
    org: 'An-Najah National University',
    period: 'Graduated July 2025',
    place: 'Nablus',
    summary: 'Overall grade: Very Good.',
    points: ['Relevant coursework: Computer Networks, Operating Systems, Distributed Systems.'],
  },
];

export interface Training {
  title: string;
  org: string;
  period: string;
  note?: string;
}

export const training: Training[] = [
  {
    title: 'Certified Kubernetes Administrator (CKA) preparation',
    org: 'Udemy',
    period: 'September 2026',
    note: 'Course and hands-on labs completed; 100%, 100% and 97% on three practice exams. I haven’t taken the CKA exam yet.',
  },
  { title: 'Introduction to Linux (LFS101)', org: 'The Linux Foundation', period: 'October – November 2025' },
  { title: 'Forward Program', org: 'McKinsey.org', period: 'October – December 2025' },
  { title: 'Cloud Computing 101', org: 'AWS Educate', period: 'July 2025' },
];

export const languages = 'Arabic (native) and English (fluent).';
