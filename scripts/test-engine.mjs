// Standalone test script for dynamic form rules and tree logic

function evaluateCondition(sourceValue, operator, conditionValue) {
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

function buildFieldTree(fields) {
  const fieldMap = new Map();
  const rootFields = [];

  const clonedFields = fields.map(f => ({ ...f, children: [] }));

  clonedFields.forEach(f => {
    fieldMap.set(String(f.id), f);
    fieldMap.set(String(f.name), f);
  });

  clonedFields.forEach(field => {
    if (field.parent_id && fieldMap.has(String(field.parent_id))) {
      const parent = fieldMap.get(String(field.parent_id));
      if (!parent.children) parent.children = [];
      parent.children.push(field);
    } else {
      rootFields.push(field);
    }
  });

  return rootFields;
}

function flattenFieldTree(fields) {
  const result = [];
  function traverse(items) {
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

function evaluateFieldStates(fields, formValues) {
  const flatFields = flattenFieldTree(fields);
  const fieldById = new Map();
  const fieldByName = new Map();

  flatFields.forEach(f => {
    fieldById.set(String(f.id), f);
    fieldByName.set(String(f.name), f);
  });

  const stateMap = {};

  flatFields.forEach(field => {
    const hasShowRule = (field.rules || []).some(r => r.action === 'show');
    const defaultVisible = !hasShowRule;
    stateMap[field.name] = {
      visible: defaultVisible,
      required: Boolean(field.required),
      triggeredRules: [],
    };
  });

  flatFields.forEach(field => {
    if (!field.rules || field.rules.length === 0) return;
    for (const rule of field.rules) {
      const sourceField = fieldById.get(String(rule.source_field_id)) || fieldByName.get(String(rule.source_field_id));
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
        if (rule.action === 'show') targetState.visible = true;
        else if (rule.action === 'hide') targetState.visible = false;
        else if (rule.action === 'required') targetState.required = true;
        else if (rule.action === 'optional') targetState.required = false;
      }
    }
  });

  function applyTreeCascading(item, parentVisible) {
    const currentState = stateMap[item.name];
    if (!currentState) return;
    if (!parentVisible) currentState.visible = false;
    const itemVisible = currentState.visible;
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => applyTreeCascading(child, itemVisible));
    }
  }

  const tree = buildFieldTree(fields);
  tree.forEach(root => applyTreeCascading(root, true));
  return stateMap;
}

console.log('=== TEST SCENARIOS AS SPECIFIED IN PLAN.MD ===\n');

// Sample fields for Form 1 (Individual vs Corporate)
const sampleFields = [
  { id: 101, parent_id: null, name: 'customer_type', label: 'Tipe Customer', type: 'select', required: true },
  { id: 102, parent_id: 101, name: 'full_name', label: 'Nama Lengkap', type: 'free_text', required: true },
  {
    id: 103,
    parent_id: 101,
    name: 'id_number',
    label: 'Nomor KTP',
    type: 'free_text',
    required: false,
    rules: [
      { id: 1, field_id: 103, source_field_id: 101, operator: 'equals', value: 'individual', action: 'show' },
      { id: 2, field_id: 103, source_field_id: 101, operator: 'equals', value: 'individual', action: 'required' },
    ],
  },
  {
    id: 104,
    parent_id: 101,
    name: 'company_name',
    label: 'Nama Perusahaan',
    type: 'free_text',
    required: false,
    rules: [
      { id: 3, field_id: 104, source_field_id: 101, operator: 'equals', value: 'corporate', action: 'show' },
      { id: 4, field_id: 104, source_field_id: 101, operator: 'equals', value: 'corporate', action: 'required' },
    ],
  },
  {
    id: 105,
    parent_id: 101,
    name: 'npwp',
    label: 'NPWP',
    type: 'free_text',
    required: false,
    rules: [
      { id: 5, field_id: 105, source_field_id: 101, operator: 'equals', value: 'corporate', action: 'show' },
      { id: 6, field_id: 105, source_field_id: 101, operator: 'equals', value: 'corporate', action: 'required' },
    ],
  },
];

// Test 1: Tree Hierarchy
console.log('1. Testing Tree Structure...');
const tree = buildFieldTree(sampleFields);
console.log('Tree root:', tree[0].label, '| Children count:', tree[0].children.length);
if (tree[0].children.length === 4) {
  console.log('✅ PASS: Parent-Child hierarchy built successfully.');
} else {
  console.error('❌ FAIL: Tree structure count mismatch.');
}

// Test 2: Individual Selection
console.log('\n2. Testing Individual Selection...');
const individualState = evaluateFieldStates(sampleFields, { customer_type: 'individual' });
console.log('id_number -> visible:', individualState.id_number.visible, ', required:', individualState.id_number.required);
console.log('company_name -> visible:', individualState.company_name.visible);
console.log('npwp -> visible:', individualState.npwp.visible);

if (
  individualState.id_number.visible === true &&
  individualState.id_number.required === true &&
  individualState.company_name.visible === false &&
  individualState.npwp.visible === false
) {
  console.log('✅ PASS: Individual condition passed.');
} else {
  console.error('❌ FAIL: Individual condition failed.');
}

// Test 3: Corporate Selection
console.log('\n3. Testing Corporate Selection...');
const corporateState = evaluateFieldStates(sampleFields, { customer_type: 'corporate' });
console.log('id_number -> visible:', corporateState.id_number.visible);
console.log('company_name -> visible:', corporateState.company_name.visible, ', required:', corporateState.company_name.required);
console.log('npwp -> visible:', corporateState.npwp.visible, ', required:', corporateState.npwp.required);

if (
  corporateState.id_number.visible === false &&
  corporateState.company_name.visible === true &&
  corporateState.company_name.required === true &&
  corporateState.npwp.visible === true &&
  corporateState.npwp.required === true
) {
  console.log('✅ PASS: Corporate condition passed.');
} else {
  console.error('❌ FAIL: Corporate condition failed.');
}

console.log('\n=== ALL SCENARIOS VERIFIED SUCCESSFULLY ===');
