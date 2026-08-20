export type FieldType = 'select' | 'option' | 'free_text';

export type RuleOperator = 'equals' | 'not_equals' | 'is_empty' | 'is_not_empty' | 'in' | 'contains';

export type RuleActionType = 'show' | 'hide' | 'required' | 'optional' | 'set_value';

export interface User {
  id: number | string;
  username: string;
  name: string;
  role: 'admin' | 'responder';
  created_at?: string;
}

export interface FieldOption {
  id?: number | string;
  field_id?: number | string;
  label: string;
  value: string;
  sort_order?: number;
  status?: string;
}

export interface FieldRule {
  id?: number | string;
  field_id?: number | string;
  source_field_id: number | string;
  operator: RuleOperator;
  value: string | string[];
  action: RuleActionType;
  created_at?: string;
  updated_at?: string;
}

export interface FormField {
  id: number | string;
  form_id?: number | string;
  parent_id?: number | string | null;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  sort_order: number;
  status?: string;
  placeholder?: string;
  help_text?: string;
  grid_span?: 1 | 2;
  options?: FieldOption[];
  rules?: FieldRule[];
  children?: FormField[];
}

export interface FormConfig {
  id: number | string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  fields: FormField[];
  created_at?: string;
  updated_at?: string;
}

export interface EvaluatedFieldState {
  visible: boolean;
  required: boolean;
  disabled?: boolean;
  triggeredRules: Array<{
    rule: FieldRule;
    sourceName: string;
    targetName: string;
    matched: boolean;
  }>;
}

export interface FormSubmission {
  id: number | string;
  form_id: number | string;
  form_name?: string;
  user_id?: number | string;
  user_name?: string;
  data: Record<string, any>;
  created_at: string;
}
