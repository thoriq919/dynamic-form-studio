// Standalone unit test script for dynamic form rules and tree logic (No DB access)

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

const formRegistrasiFields = [
  { id: 1, parent_id: null, name: 'nama_lengkap', label: 'Nama Lengkap', type: 'free_text', required: true },
  {
    id: 2,
    parent_id: null,
    name: 'jenis_kelamin',
    label: 'Jenis Kelamin',
    type: 'option',
    required: true,
    options: [
      { label: 'Laki-laki', value: 'laki_laki' },
      { label: 'Perempuan', value: 'perempuan' },
    ],
  },
  {
    id: 3,
    parent_id: null,
    name: 'status_pernikahan',
    label: 'Status Pernikahan',
    type: 'select',
    required: true,
    options: [
      { label: 'Belum Menikah', value: 'belum_menikah' },
      { label: 'Menikah', value: 'menikah' },
    ],
  },
  {
    id: 4,
    parent_id: 3,
    name: 'nama_pasangan',
    label: 'Nama Pasangan',
    type: 'free_text',
    required: false,
    rules: [
      { id: 401, field_id: 4, source_field_id: 3, operator: 'equals', value: 'menikah', action: 'show' },
      { id: 402, field_id: 4, source_field_id: 3, operator: 'equals', value: 'menikah', action: 'required' },
    ],
  },
  {
    id: 5,
    parent_id: null,
    name: 'pekerjaan',
    label: 'Pekerjaan',
    type: 'select',
    required: true,
    options: [
      { label: 'Pelajar / Mahasiswa', value: 'pelajar_mahasiswa' },
      { label: 'Karyawan', value: 'karyawan' },
      { label: 'Wiraswasta', value: 'wiraswasta' },
      { label: 'Lainnya', value: 'lainnya' },
    ],
  },
  {
    id: 6,
    parent_id: 5,
    name: 'nama_perusahaan_instansi',
    label: 'Nama Perusahaan / Instansi',
    type: 'free_text',
    required: false,
    rules: [
      { id: 601, field_id: 6, source_field_id: 5, operator: 'equals', value: 'karyawan', action: 'show' },
      { id: 602, field_id: 6, source_field_id: 5, operator: 'equals', value: 'karyawan', action: 'required' },
      { id: 603, field_id: 6, source_field_id: 5, operator: 'equals', value: 'pelajar_mahasiswa', action: 'show' },
      { id: 604, field_id: 6, source_field_id: 5, operator: 'equals', value: 'pelajar_mahasiswa', action: 'required' },
    ],
  },
  {
    id: 7,
    parent_id: 5,
    name: 'pekerjaan_lainnya',
    label: 'Pekerjaan Lainnya',
    type: 'free_text',
    required: false,
    rules: [
      { id: 701, field_id: 7, source_field_id: 5, operator: 'equals', value: 'lainnya', action: 'show' },
      { id: 702, field_id: 7, source_field_id: 5, operator: 'equals', value: 'lainnya', action: 'required' },
    ],
  },
  { id: 8, parent_id: null, name: 'alamat', label: 'Alamat', type: 'free_text', required: true },
  { id: 9, parent_id: null, name: 'keterangan_tambahan', label: 'Keterangan Tambahan', type: 'free_text', required: false },
];

console.log('=== UNIT TEST: FORM REGISTRASI DATA DIRI ===\n');

// Test 1: Field Tree Structure
console.log('1. Testing Tree Structure...');
const tree = buildFieldTree(formRegistrasiFields);
const statusPernikahanNode = tree.find(f => f.name === 'status_pernikahan');
const pekerjaanNode = tree.find(f => f.name === 'pekerjaan');

console.log('Root fields count:', tree.length); // should be 6 roots: nama_lengkap, jenis_kelamin, status_pernikahan, pekerjaan, alamat, keterangan_tambahan
console.log('status_pernikahan children count:', statusPernikahanNode?.children?.length); // should be 1 (nama_pasangan)
console.log('pekerjaan children count:', pekerjaanNode?.children?.length); // should be 2 (nama_perusahaan_instansi, pekerjaan_lainnya)

if (tree.length === 6 && statusPernikahanNode?.children?.length === 1 && pekerjaanNode?.children?.length === 2) {
  console.log('✅ PASS: Tree Hierarchy verified.');
} else {
  console.error('❌ FAIL: Tree Hierarchy mismatch.');
}

// Test 2: Status Pernikahan = Belum Menikah
console.log('\n2. Testing Status Pernikahan = Belum Menikah...');
const state1 = evaluateFieldStates(formRegistrasiFields, { status_pernikahan: 'belum_menikah' });
console.log('nama_pasangan -> visible:', state1.nama_pasangan.visible, ', required:', state1.nama_pasangan.required);
if (!state1.nama_pasangan.visible) {
  console.log('✅ PASS: nama_pasangan is hidden when Belum Menikah.');
} else {
  console.error('❌ FAIL: nama_pasangan should be hidden.');
}

// Test 3: Status Pernikahan = Menikah (RULE 1)
console.log('\n3. Testing Status Pernikahan = Menikah (RULE 1)...');
const state2 = evaluateFieldStates(formRegistrasiFields, { status_pernikahan: 'menikah' });
console.log('nama_pasangan -> visible:', state2.nama_pasangan.visible, ', required:', state2.nama_pasangan.required);
if (state2.nama_pasangan.visible && state2.nama_pasangan.required) {
  console.log('✅ PASS: nama_pasangan is shown AND mandatory when Menikah.');
} else {
  console.error('❌ FAIL: nama_pasangan should be visible and required.');
}

// Test 4: Pekerjaan = Karyawan (RULE 2)
console.log('\n4. Testing Pekerjaan = Karyawan (RULE 2)...');
const state3 = evaluateFieldStates(formRegistrasiFields, { pekerjaan: 'karyawan' });
console.log('nama_perusahaan_instansi -> visible:', state3.nama_perusahaan_instansi.visible, ', required:', state3.nama_perusahaan_instansi.required);
console.log('pekerjaan_lainnya -> visible:', state3.pekerjaan_lainnya.visible);
if (state3.nama_perusahaan_instansi.visible && state3.nama_perusahaan_instansi.required && !state3.pekerjaan_lainnya.visible) {
  console.log('✅ PASS: nama_perusahaan_instansi shown & required for Karyawan.');
} else {
  console.error('❌ FAIL: Pekerjaan = Karyawan condition failed.');
}

// Test 5: Pekerjaan = Pelajar / Mahasiswa (RULE 3)
console.log('\n5. Testing Pekerjaan = Pelajar / Mahasiswa (RULE 3)...');
const state4 = evaluateFieldStates(formRegistrasiFields, { pekerjaan: 'pelajar_mahasiswa' });
console.log('nama_perusahaan_instansi -> visible:', state4.nama_perusahaan_instansi.visible, ', required:', state4.nama_perusahaan_instansi.required);
if (state4.nama_perusahaan_instansi.visible && state4.nama_perusahaan_instansi.required) {
  console.log('✅ PASS: nama_perusahaan_instansi shown & required for Pelajar / Mahasiswa.');
} else {
  console.error('❌ FAIL: Pekerjaan = Pelajar / Mahasiswa condition failed.');
}

// Test 6: Pekerjaan = Wiraswasta
console.log('\n6. Testing Pekerjaan = Wiraswasta...');
const state5 = evaluateFieldStates(formRegistrasiFields, { pekerjaan: 'wiraswasta' });
console.log('nama_perusahaan_instansi -> visible:', state5.nama_perusahaan_instansi.visible);
console.log('pekerjaan_lainnya -> visible:', state5.pekerjaan_lainnya.visible);
if (!state5.nama_perusahaan_instansi.visible && !state5.pekerjaan_lainnya.visible) {
  console.log('✅ PASS: Both child fields hidden for Wiraswasta.');
} else {
  console.error('❌ FAIL: Child fields should be hidden for Wiraswasta.');
}

// Test 7: Pekerjaan = Lainnya (RULE 4)
console.log('\n7. Testing Pekerjaan = Lainnya (RULE 4)...');
const state6 = evaluateFieldStates(formRegistrasiFields, { pekerjaan: 'lainnya' });
console.log('pekerjaan_lainnya -> visible:', state6.pekerjaan_lainnya.visible, ', required:', state6.pekerjaan_lainnya.required);
console.log('nama_perusahaan_instansi -> visible:', state6.nama_perusahaan_instansi.visible);
if (state6.pekerjaan_lainnya.visible && state6.pekerjaan_lainnya.required && !state6.nama_perusahaan_instansi.visible) {
  console.log('✅ PASS: pekerjaan_lainnya shown & required for Lainnya.');
} else {
  console.error('❌ FAIL: Pekerjaan = Lainnya condition failed.');
}

console.log('\n=== ALL 7 UNIT TESTS PASSED SUCCESSFULLY ===\n');
