import { FormField, FieldRule, RuleOperator, EvaluatedFieldState } from '@/types/form';

export function buildFieldTree(fields: FormField[]): FormField[] {
  const fieldMap = new Map<string, FormField>();
  const rootFields: FormField[] = [];

  const clonedFields: FormField[] = fields.map(f => ({
    ...f,
    children: [],
  }));

  clonedFields.forEach(f => {
    fieldMap.set(String(f.id), f);
    fieldMap.set(String(f.name), f);
  });

  clonedFields.forEach(field => {
    if (field.parent_id && fieldMap.has(String(field.parent_id))) {
      const parent = fieldMap.get(String(field.parent_id))!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(field);
    } else {
      rootFields.push(field);
    }
  });

  const sortByOrder = (items: FormField[]) => {
    items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(rootFields);
  return rootFields;
}

export function flattenFieldTree(fields: FormField[]): FormField[] {
  const result: FormField[] = [];
  function traverse(items: FormField[]) {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }
  traverse(fields);
  return result;
}

export function evaluateCondition(
  sourceValue: any,
  operator: RuleOperator,
  conditionValue: string | string[]
): boolean {
  const strSource = sourceValue !== undefined && sourceValue !== null ? String(sourceValue).trim() : '';
  const strCondition = conditionValue !== undefined && conditionValue !== null ? String(conditionValue).trim() : '';

  switch (operator) {
    case 'equals':
      return strSource.toLowerCase() === strCondition.toLowerCase();
    case 'not_equals':
      return strSource.toLowerCase() !== strCondition.toLowerCase();
    case 'is_empty':
      return strSource === '' || (Array.isArray(sourceValue) && sourceValue.length === 0);
    case 'is_not_empty':
      return strSource !== '' && (!Array.isArray(sourceValue) || sourceValue.length > 0);
    case 'contains':
      return strSource.toLowerCase().includes(strCondition.toLowerCase());
    case 'in':
      if (Array.isArray(conditionValue)) {
        return conditionValue.map(v => String(v).toLowerCase()).includes(strSource.toLowerCase());
      }
      const inList = strCondition.split(',').map(s => s.trim().toLowerCase());
      return inList.includes(strSource.toLowerCase());
    default:
      return false;
  }
}

export function evaluateFieldStates(
  fields: FormField[],
  formValues: Record<string, any>
): Record<string, EvaluatedFieldState> {
  const flatFields = flattenFieldTree(fields);
  const fieldById = new Map<string, FormField>();
  const fieldByName = new Map<string, FormField>();

  flatFields.forEach(f => {
    fieldById.set(String(f.id), f);
    fieldByName.set(String(f.name), f);
  });

  const stateMap: Record<string, EvaluatedFieldState> = {};

  flatFields.forEach(field => {
    const hasShowRule = (field.rules || []).some(r => r.action === 'show');
    const defaultVisible = field.status === 'hide' ? false : !hasShowRule;

    stateMap[field.name] = {
      visible: defaultVisible,
      required: Boolean(field.required),
      triggeredRules: [],
    };
  });

  flatFields.forEach(field => {
    if (!field.rules || field.rules.length === 0) return;

    for (const rule of field.rules) {
      const sourceField =
        fieldById.get(String(rule.source_field_id)) ||
        fieldByName.get(String(rule.source_field_id));

      if (!sourceField) continue;

      const sourceValue = formValues[sourceField.name];
      const matched = evaluateCondition(sourceValue, rule.operator, rule.value);

      const targetState = stateMap[field.name];
      if (!targetState) continue;

      targetState.triggeredRules.push({
        rule,
        sourceName: sourceField.name,
        targetName: field.name,
        matched,
      });

      if (matched) {
        if (rule.action === 'show') {
          targetState.visible = true;
        } else if (rule.action === 'hide') {
          targetState.visible = false;
        }
      }
    }
  });

  function applyTreeCascading(item: FormField, parentVisible: boolean) {
    const currentState = stateMap[item.name];
    if (!currentState) return;

    if (!parentVisible) {
      currentState.visible = false;
    }

    const itemVisible = currentState.visible;
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        applyTreeCascading(child, itemVisible);
      });
    }
  }

  const tree = buildFieldTree(fields);
  tree.forEach(root => applyTreeCascading(root, true));

  return stateMap;
}
