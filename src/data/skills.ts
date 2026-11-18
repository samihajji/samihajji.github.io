/**
 * The "bill of materials": technologies I can discuss in an engineering
 * interview, each tied to where I actually used it. No levels, no scores.
 *
 * `where` keys refer to `sources` below; each renders as a link to the
 * evidence (a project on this page, or the internship entry in the log).
 */

export const sources = {
  internship: { label: 'Internship', href: '#log-internship' },
  gitops: { label: 'GitOps platform', href: '#project-gitops-platform' },
  aws: { label: 'AWS image processor', href: '#project-aws-image-processor' },
  cilium: { label: 'Cilium on AKS', href: '#project-cilium-aks' },
  azure: { label: 'Azure platform', href: '#project-azure-platform' },
} as const;

export type SourceKey = keyof typeof sources;

export interface Part {
  name: string;
  detail: string;
  where: SourceKey[];
  /** Marks something I'm still learning, drawn in pencil rather than ink. */
  learning?: boolean;
}

export interface PartGroup {
  name: string;
  parts: Part[];
}

export const skills: PartGroup[] = [
  {
    name: 'Kubernetes and platform engineering',
    parts: [
      {
        name: 'Kubernetes operations',
        detail:
          'Multi-node clusters; troubleshooting kubelet, container, storage, DNS and control-plane failures; cordon/drain, taints, affinity.',
        where: ['internship', 'gitops', 'cilium'],
      },
      {
        name: 'Helm',
        detail:
          'Writing reusable charts with helpers and per-environment values; auditing third-party charts with helm show values.',
        where: ['internship', 'gitops', 'cilium'],
      },
      {
        name: 'Gateway API, Envoy Gateway',
        detail: 'Shared Gateways with HTTPS listeners, HTTPRoutes and TLS terminated at the Gateway.',
        where: ['internship', 'gitops'],
      },
      {
        name: 'Cilium, eBPF, Hubble',
        detail:
          'Upstream install on BYOCNI, VXLAN datapath, BPF maps, kube-proxy replacement, flow observability.',
        where: ['cilium'],
      },
    ],
  },
  {
    name: 'Cloud and infrastructure as code',
    parts: [
      {
        name: 'Terraform',
        detail:
          'azurerm, AzAPI and AWS providers; versioned modules pinned by tag; remote state; applying reviewed saved plans.',
        where: ['aws', 'cilium'],
      },
      {
        name: 'Microsoft Azure',
        detail: 'Private AKS, Entra ID with Azure RBAC, VNets, NSGs, Blob Storage, resource locks, quotas and budgets.',
        where: ['cilium', 'azure'],
      },
      {
        name: 'Amazon Web Services',
        detail: 'S3, CloudFront with OAC, API Gateway, Lambda, IAM, CloudWatch Logs.',
        where: ['aws'],
      },
    ],
  },
  {
    name: 'Networking and security',
    parts: [
      {
        name: 'Linux networking',
        detail: 'Network namespaces, veth pairs, VXLAN, iptables and nftables, captures with tcpdump.',
        where: ['internship', 'cilium'],
      },
      {
        name: 'Network policy',
        detail: 'Kubernetes NetworkPolicy and CiliumNetworkPolicy, including DNS-aware FQDN and L7 HTTP rules.',
        where: ['cilium'],
      },
      {
        name: 'TLS, PKI, cert-manager',
        detail: 'Certificate issuance from an internal CA, ClusterIssuers, certificates for Gateway listeners.',
        where: ['internship', 'gitops'],
      },
      {
        name: 'Secrets and identity',
        detail:
          'Sealed Secrets in Git, GitHub OIDC federation to AWS, Entra-only access, least-privilege role assignments.',
        where: ['internship', 'gitops', 'aws', 'cilium'],
      },
    ],
  },
  {
    name: 'GitOps and CI/CD',
    parts: [
      {
        name: 'Argo CD',
        detail: 'App-of-apps, sync waves, pruning and self-heal, ignoreDifferences, Server-Side Apply.',
        where: ['internship', 'gitops'],
      },
      {
        name: 'GitHub Actions',
        detail: 'Artifact-driven pipelines, cross-repository promotion by commit, Helm lint, render and schema checks.',
        where: ['gitops', 'aws'],
      },
      {
        name: 'Policy and security scanning',
        detail: 'Checkov, tfsec and TFLint in pull requests; Gitleaks before every commit.',
        where: ['aws', 'cilium'],
      },
    ],
  },
  {
    name: 'Observability',
    parts: [
      {
        name: 'Prometheus, Grafana',
        detail: 'kube-prometheus-stack delivered by Argo CD, sized after Grafana was OOM-killed.',
        where: ['internship', 'gitops'],
      },
      {
        name: 'Hubble',
        detail: 'Flow verdicts, drop reasons and L7 visibility through the CLI, Relay and UI.',
        where: ['cilium'],
      },
      {
        name: 'OpenTelemetry',
        detail: 'Planned for the Azure platform, starting from the workload’s own instrumentation.',
        where: ['azure'],
        learning: true,
      },
    ],
  },
  {
    name: 'Programming and automation',
    parts: [
      {
        name: 'Bash, HCL, YAML',
        detail: 'Day-to-day automation, Terraform and Kubernetes configuration.',
        where: ['aws', 'gitops', 'cilium'],
      },
      {
        name: 'Python, TypeScript, Go',
        detail:
          'A Python Lambda image handler, a TypeScript webhook pipeline (API, worker, migrations), Go back-end coursework.',
        where: ['aws', 'gitops'],
      },
    ],
  },
];
