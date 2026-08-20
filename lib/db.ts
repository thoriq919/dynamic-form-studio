import mysql from 'mysql2/promise';
import { FormConfig, FormField, FieldOption, FieldRule, FormSubmission, User } from '@/types/form';
import crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

declare global {
  var __globalMysqlPool: mysql.Pool | undefined;
}

export async function initMySQL() {
  if (global.__globalMysqlPool) {
    return global.__globalMysqlPool;
  }

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const database = process.env.DB_NAME || 'dynamic_form_db';
  const port = Number(process.env.DB_PORT) || 3306;

  try {
    const pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 3,
      idleTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      queueLimit: 0,
    });

    try {
      await pool.query('SELECT 1');
    } catch (err: any) {
      if (err.code === 'ER_BAD_DB_ERROR') {
        const rootConn = await mysql.createConnection({ host, user, password, port });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await rootConn.end();
      } else {
        throw err;
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'responder',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS form_fields (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        form_id BIGINT NOT NULL,
        parent_id BIGINT NULL,
        name VARCHAR(100) NOT NULL,
        label VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        required BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        placeholder VARCHAR(255) NULL,
        help_text TEXT NULL,
        grid_span INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_form_id (form_id),
        INDEX idx_parent_id (parent_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS field_options (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        field_id BIGINT NOT NULL,
        label VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        INDEX idx_field_id (field_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS field_rules (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        field_id BIGINT NOT NULL,
        source_field_id VARCHAR(100) NOT NULL,
        operator VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_field_id (field_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        form_id BIGINT NOT NULL,
        user_id BIGINT NULL,
        user_name VARCHAR(255) NULL,
        data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_form_id (form_id)
      );
    `);

    const hashedDefaultAdmin = hashPassword('admindf1773');
    const [userRows]: any = await pool.query('SELECT id, password FROM users WHERE username = ?', ['admin']);
    if (userRows.length === 0) {
      await pool.query(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedDefaultAdmin, 'Administrator', 'admin']
      );
    } else if (userRows[0].password === 'admindf1773') {
      await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedDefaultAdmin, 'admin']);
    }

    global.__globalMysqlPool = pool;
    return pool;
  } catch (err: any) {
    console.error('[MySQL Error]:', err.message);
    global.__globalMysqlPool = undefined;
    return null;
  }
}

initMySQL().catch(() => {});

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();
  const hashed = hashPassword(cleanPassword);

  const pool = await initMySQL();
  if (!pool) {
    throw new Error('Tidak dapat terhubung ke database MySQL. Silakan restart dev server.');
  }

  let [rows]: any = await pool.query(
    'SELECT id, username, password, name, role, created_at FROM users WHERE LOWER(username) = ?',
    [cleanUsername]
  );

  if (rows.length === 0 && cleanUsername === 'admin') {
    const defaultHash = hashPassword('admindf1773');
    const [insertRes]: any = await pool.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin', defaultHash, 'Administrator', 'admin']
    );
    [rows] = await pool.query(
      'SELECT id, username, password, name, role, created_at FROM users WHERE id = ?',
      [insertRes.insertId]
    );
  }

  if (rows.length > 0) {
    const userRow = rows[0];
    if (userRow.password === hashed || userRow.password === cleanPassword) {
      if (userRow.password === cleanPassword) {
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userRow.id]);
      }
      return {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        role: userRow.role as 'admin' | 'responder',
        created_at: userRow.created_at,
      };
    }
  }

  return null;
}

export async function registerUser(
  username: string,
  password: string,
  name: string,
  role: 'admin' | 'responder' = 'responder'
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanName = name.trim() || cleanUsername;
  const hashedPassword = hashPassword(cleanPassword);

  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'Username and password are required' };
  }

  const pool = await initMySQL();
  if (!pool) {
    return { success: false, error: 'Database connection is unavailable' };
  }

  try {
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = ?',
      [cleanUsername]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Username is already in use' };
    }

    const [totalRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const assignedRole = totalRows[0].cnt === 0 ? 'admin' : role;

    const [insertRes]: any = await pool.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [cleanUsername, hashedPassword, cleanName, assignedRole]
    );

    const newUser: User = {
      id: insertRes.insertId,
      username: cleanUsername,
      name: cleanName,
      role: assignedRole,
      created_at: new Date().toISOString(),
    };

    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'Database registration error' };
  }
}

export async function getAllUsers(): Promise<User[]> {
  const pool = await initMySQL();
  if (!pool) return [];

  try {
    const [rows]: any = await pool.query(
      'SELECT id, username, name, role, created_at FROM users ORDER BY id DESC'
    );
    return rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      name: r.name,
      role: r.role,
      created_at: r.created_at,
    }));
  } catch (err) {
    return [];
  }
}

export async function deleteUser(id: number | string): Promise<{ success: boolean; error?: string }> {
  const pool = await initMySQL();
  if (!pool) {
    return { success: false, error: 'Database connection is unavailable' };
  }

  try {
    const [rows]: any = await pool.query('SELECT username FROM users WHERE id = ?', [Number(id)]);
    if (rows.length > 0 && rows[0].username === 'admin') {
      return { success: false, error: 'Primary admin account cannot be deleted' };
    }
    await pool.query('DELETE FROM users WHERE id = ?', [Number(id)]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete user' };
  }
}

export async function getAllForms(): Promise<FormConfig[]> {
  const pool = await initMySQL();
  if (!pool) return [];

  try {
    const [rows]: any = await pool.query('SELECT * FROM forms ORDER BY id DESC');
    const forms: FormConfig[] = [];
    for (const r of rows) {
      const fullForm = await getFormById(r.id);
      if (fullForm) forms.push(fullForm);
    }
    return forms;
  } catch (err) {
    return [];
  }
}

export async function getFormById(id: number | string): Promise<FormConfig | null> {
  const numericId = Number(id);
  const pool = await initMySQL();
  if (!pool) return null;

  try {
    const [formRows]: any = await pool.query('SELECT * FROM forms WHERE id = ?', [numericId]);
    if (formRows.length === 0) return null;
    const form = formRows[0];

    const [fieldsRows]: any = await pool.query(
      'SELECT * FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC',
      [numericId]
    );

    const fields: FormField[] = [];
    for (const f of fieldsRows) {
      const [optRows]: any = await pool.query(
        'SELECT * FROM field_options WHERE field_id = ? ORDER BY sort_order ASC',
        [f.id]
      );
      const [ruleRows]: any = await pool.query(
        'SELECT * FROM field_rules WHERE field_id = ?',
        [f.id]
      );

      fields.push({
        id: f.id,
        form_id: f.form_id,
        parent_id: f.parent_id,
        name: f.name,
        label: f.label,
        type: f.type,
        required: Boolean(f.required),
        sort_order: f.sort_order,
        placeholder: f.placeholder,
        help_text: f.help_text,
        grid_span: f.grid_span,
        status: f.status,
        options: optRows.map((o: any) => ({
          id: o.id,
          field_id: o.field_id,
          label: o.label,
          value: o.value,
          sort_order: o.sort_order,
        })),
        rules: ruleRows.map((r: any) => ({
          id: r.id,
          field_id: r.field_id,
          source_field_id: r.source_field_id,
          operator: r.operator,
          value: r.value,
          action: r.action,
        })),
      });
    }

    return {
      id: form.id,
      name: form.name,
      description: form.description,
      status: form.status,
      created_at: form.created_at,
      updated_at: form.updated_at,
      fields,
    };
  } catch (err) {
    return null;
  }
}

export async function saveForm(formData: Partial<FormConfig>): Promise<FormConfig> {
  const pool = await initMySQL();
  const id = formData.id || Date.now();
  const newForm: FormConfig = {
    id,
    name: formData.name || 'Untitled Form',
    description: formData.description || '',
    status: formData.status || 'active',
    created_at: formData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fields: formData.fields || [],
  };

  if (!pool) return newForm;

  try {
    const [existingForms]: any = await pool.query('SELECT id FROM forms WHERE id = ?', [newForm.id]);

    let dbFormId = newForm.id;
    if (existingForms.length > 0) {
      await pool.query(
        'UPDATE forms SET name = ?, description = ?, status = ? WHERE id = ?',
        [newForm.name, newForm.description, newForm.status, newForm.id]
      );

      const [existingFields]: any = await pool.query(
        'SELECT id FROM form_fields WHERE form_id = ?',
        [newForm.id]
      );
      for (const ef of existingFields) {
        await pool.query('DELETE FROM field_options WHERE field_id = ?', [ef.id]);
        await pool.query('DELETE FROM field_rules WHERE field_id = ?', [ef.id]);
      }
      await pool.query('DELETE FROM form_fields WHERE form_id = ?', [newForm.id]);
    } else {
      const [res]: any = await pool.query(
        'INSERT INTO forms (name, description, status) VALUES (?, ?, ?)',
        [newForm.name, newForm.description, newForm.status]
      );
      dbFormId = res.insertId;
      newForm.id = dbFormId;
    }

    const idMap = new Map<string, number | string>();

    for (const field of newForm.fields) {
      const [fieldRes]: any = await pool.query(
        `INSERT INTO form_fields (form_id, parent_id, name, label, type, required, sort_order, placeholder, help_text, grid_span, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dbFormId,
          field.parent_id ? (idMap.get(String(field.parent_id)) || field.parent_id) : null,
          field.name,
          field.label,
          field.type,
          field.required ? 1 : 0,
          field.sort_order || 0,
          field.placeholder || null,
          field.help_text || null,
          field.grid_span || 1,
          field.status || 'active',
        ]
      );
      const newFieldId = fieldRes.insertId;
      idMap.set(String(field.id), newFieldId);

      if (field.options && field.options.length > 0) {
        for (const opt of field.options) {
          await pool.query(
            'INSERT INTO field_options (field_id, label, value, sort_order, status) VALUES (?, ?, ?, ?, ?)',
            [newFieldId, opt.label, opt.value, opt.sort_order || 0, opt.status || 'active']
          );
        }
      }

      if (field.rules && field.rules.length > 0) {
        for (const rule of field.rules) {
          const mappedSourceId = idMap.get(String(rule.source_field_id)) || rule.source_field_id;
          await pool.query(
            'INSERT INTO field_rules (field_id, source_field_id, operator, value, action) VALUES (?, ?, ?, ?, ?)',
            [
              newFieldId,
              mappedSourceId,
              rule.operator,
              typeof rule.value === 'string' ? rule.value : JSON.stringify(rule.value),
              rule.action,
            ]
          );
        }
      }
    }
  } catch (err) {}

  return newForm;
}

export async function deleteForm(id: number | string): Promise<boolean> {
  const formIdNum = Number(id);
  const pool = await initMySQL();
  if (!pool) return false;

  try {
    const [fields]: any = await pool.query(
      'SELECT id FROM form_fields WHERE form_id = ?',
      [formIdNum]
    );
    for (const f of fields) {
      await pool.query('DELETE FROM field_options WHERE field_id = ?', [f.id]);
      await pool.query('DELETE FROM field_rules WHERE field_id = ?', [f.id]);
    }
    await pool.query('DELETE FROM form_fields WHERE form_id = ?', [formIdNum]);
    await pool.query('DELETE FROM form_submissions WHERE form_id = ?', [formIdNum]);
    await pool.query('DELETE FROM forms WHERE id = ?', [formIdNum]);
    return true;
  } catch (err) {
    return false;
  }
}

export async function saveFormSubmission(
  formId: number | string,
  data: Record<string, any>,
  user?: { id?: number | string; name?: string }
): Promise<FormSubmission> {
  const form = await getFormById(formId);
  const submission: FormSubmission = {
    id: Date.now(),
    form_id: formId,
    form_name: form ? form.name : `Form #${formId}`,
    user_id: user?.id,
    user_name: user?.name,
    data,
    created_at: new Date().toISOString(),
  };

  const pool = await initMySQL();
  if (pool) {
    try {
      const [res]: any = await pool.query(
        'INSERT INTO form_submissions (form_id, user_id, user_name, data) VALUES (?, ?, ?, ?)',
        [
          Number(formId) || null,
          user?.id ? Number(user.id) : null,
          user?.name || null,
          JSON.stringify(data),
        ]
      );
      submission.id = res.insertId;
    } catch (err) {}
  }

  return submission;
}

export async function getFormSubmissions(formId?: number | string): Promise<FormSubmission[]> {
  const pool = await initMySQL();
  if (!pool) return [];

  try {
    let query = `
      SELECT fs.id, fs.form_id, fs.user_id, fs.user_name, fs.data, fs.created_at, f.name as form_name
      FROM form_submissions fs
      LEFT JOIN forms f ON fs.form_id = f.id
    `;
    const params: any[] = [];
    if (formId) {
      query += ` WHERE fs.form_id = ?`;
      params.push(Number(formId));
    }
    query += ` ORDER BY fs.id DESC`;

    const [rows]: any = await pool.query(query, params);
    return rows.map((r: any) => ({
      id: r.id,
      form_id: r.form_id,
      form_name: r.form_name || `Form #${r.form_id}`,
      user_id: r.user_id,
      user_name: r.user_name,
      data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
      created_at: r.created_at,
    }));
  } catch (err) {
    return [];
  }
}

export const getAllSubmissions = getFormSubmissions;
