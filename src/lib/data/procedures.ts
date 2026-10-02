// ===========================================
// SentinelOps - Procedure Data
// ===========================================

import type { Procedure } from '@/lib/types';

export const procedures: Procedure[] = [
  {
    slug: 'payment-processing',
    name: 'Payment Processing',
    description: 'Handles transaction processing, payment gateway communication, and settlement operations for all financial transactions.',
    status: 'active',
    lastExecution: new Date(Date.now() - 3600000).toISOString(),
    executionCount: 15847,
    successRate: 99.7,
    category: 'Financial',
  },
  {
    slug: 'user-verification',
    name: 'User Verification',
    description: 'Manages identity verification workflows including KYC, document validation, and biometric authentication processes.',
    status: 'active',
    lastExecution: new Date(Date.now() - 7200000).toISOString(),
    executionCount: 8432,
    successRate: 98.9,
    category: 'Security',
  },
  {
    slug: 'document-processing',
    name: 'Document Processing',
    description: 'Processes document uploads, OCR extraction, format conversion, and archival workflows for compliance documents.',
    status: 'idle',
    lastExecution: new Date(Date.now() - 14400000).toISOString(),
    executionCount: 4291,
    successRate: 97.5,
    category: 'Operations',
  },
  {
    slug: 'data-synchronization',
    name: 'Data Synchronization',
    description: 'Synchronizes data across distributed systems, ensures consistency between services, and handles conflict resolution.',
    status: 'active',
    lastExecution: new Date(Date.now() - 1800000).toISOString(),
    executionCount: 23156,
    successRate: 99.2,
    category: 'Infrastructure',
  },
];

export function getProcedureBySlug(slug: string): Procedure | undefined {
  return procedures.find((p) => p.slug === slug);
}
