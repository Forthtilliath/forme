import type { Brand } from '@forthtilliath/ts-types';

/** Miroir des records Java (dev.forthtilliath.formbuilder.form.*). */

export type FormId = Brand<string, 'FormId'>;

export const FIELD_TYPES = [
  'text',
  'textarea',
  'email',
  'number',
  'date',
  'select',
  'radio',
  'checkboxes',
  'consent',
  'rating',
  'section',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const INKS = ['vermillon', 'outremer', 'sapin', 'prune'] as const;
export type Ink = (typeof INKS)[number];

export type FormStatus = 'draft' | 'published';
export type FieldWidth = 'full' | 'half';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface FieldDefinition {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  help?: string;
  required: boolean;
  width?: FieldWidth;
  rules?: FieldRules;
  options?: FieldOption[];
}

export interface FormSummary {
  id: FormId;
  title: string;
  description?: string;
  slug: string;
  status: FormStatus;
  ink: Ink;
  fieldCount: number;
  submissionCount: number;
  updatedAt: string;
}

export interface FormDetail extends Omit<FormSummary, 'fieldCount'> {
  fields: FieldDefinition[];
  createdAt: string;
}

export interface FormRequest {
  title: string;
  description?: string;
  ink?: Ink;
  fields?: FieldDefinition[];
}

export interface PublicForm {
  slug: string;
  title: string;
  description?: string;
  ink: Ink;
  fields: FieldDefinition[];
}

export type SubmissionValue = string | number | boolean | string[];

export interface SubmissionView {
  id: string;
  data: Record<string, SubmissionValue>;
  submittedAt: string;
}

/** ProblemDetail (RFC 9457) renvoye par ApiExceptionHandler. */
export interface ApiProblem {
  status: number;
  detail?: string;
  errors?: Record<string, string>;
}

export const collectsValue = (field: FieldDefinition): boolean => field.type !== 'section';

export const hasOptions = (type: FieldType): boolean =>
  type === 'select' || type === 'radio' || type === 'checkboxes';
