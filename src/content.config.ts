import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects are plain YAML files in src/content/projects/.
 * Add or edit a project there; no component changes are needed unless it
 * needs a new diagram.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    /** complete -> drawn in ink, in-progress -> pencil, planned -> dotted pencil. */
    status: z.enum(['complete', 'in-progress', 'planned']),
    period: z.string(),
    /** Shown in the project's title block. */
    repository: z.string(),
    role: z.string(),
    summary: z.string(),
    objective: z.string(),
    built: z.array(z.string()).min(1),
    /** Which hand-drawn diagram to show (see src/components/diagrams/). */
    diagram: z.enum(['cilium', 'gitops', 'aws', 'azure-platform']),
    diagramCaption: z.string(),
    /** Numbered callouts ("balloons") on the diagram; ids must match the diagram's parts. */
    callouts: z.array(z.object({ id: z.string(), label: z.string(), text: z.string() })),
    decisions: z.array(z.object({ title: z.string(), text: z.string() })),
    learned: z.array(z.string()),
    /** Honest limits: what is not done, not measured or not verified. */
    caveats: z.array(z.string()).default([]),
    stack: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), href: z.url() })),
    /** The one red-pencil moment: a claim struck through and corrected. */
    correction: z.object({ struck: z.string(), note: z.string() }).optional(),
  }),
});

export const collections = { projects };
