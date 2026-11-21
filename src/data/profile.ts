/**
 * Personal details used across the page. Edit here, not in components.
 *
 * Every value below comes from the source CV or a public repository.
 * Items still awaiting the owner's approval are listed in README.md.
 */
export const profile = {
  name: 'Sami Hajji',
  title: 'DevOps / Platform Engineer',
  location: 'Nablus, Palestine',
  availability: 'Open to remote work and relocation.',
  email: 'samimassoud67@gmail.com',
  links: {
    github: 'https://github.com/samihajji',
    linkedin: 'https://www.linkedin.com/in/samihajji',
  },
  /**
   * The public CV lives in public/cv/. The source CV in reference/ is never
   * published. If the file below is missing, the build warns and the
   * "Download CV" button explains that the CV hasn't been added yet.
   */
  cv: {
    file: 'cv/sami-hajji-cv.pdf',
    downloadName: 'Sami-Hajji-CV.pdf',
  },
  updated: 'November 2026',
  lede:
    'I build and troubleshoot cloud-native platforms, with a focus on Kubernetes, GitOps and cloud infrastructure. I enjoy understanding systems from application behavior down to Linux, networking and the control plane.',
  description:
    'Sami Hajji, DevOps and cloud engineer in Nablus, Palestine. Kubernetes, GitOps, Terraform, Azure and AWS, with case studies on Cilium and eBPF networking, Argo CD delivery and secure AWS infrastructure.',
} as const;

export type Profile = typeof profile;
