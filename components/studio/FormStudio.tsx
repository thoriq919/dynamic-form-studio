'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FormConfig, FormField, FieldType, FormSubmission, User } from '@/types/form';
import { DynamicForm } from '@/components/dynamic-form/DynamicForm';
import { SidebarNav } from './SidebarNav';
import { ComponentPalette } from './ComponentPalette';
import { FormCanvas } from './FormCanvas';
import { FieldConfigDrawer } from './FieldConfigDrawer';
import { DashboardOverview } from './DashboardOverview';
import { UserManagement } from './UserManagement';
import { AuthModal } from '@/components/auth/AuthModal';
import { ToastContainer, ToastItem, ToastType } from '@/components/ui/ToastNotification';
import {
  FileCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Database,
  Layers,
  Sliders,
  Workflow,
  Eye,
  Trash2,
  Sparkles,
  UserCheck,
  Plus,
  Loader2,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface FormStudioProps {
  initialForm?: FormConfig;
  allForms?: FormConfig[];
}

export const FormStudio: React.FC<FormStudioProps> = ({
  initialForm,
  allForms = [],
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [activeNav, setActiveNav] = useState<'overview' | 'forms' | 'builder' | 'configurations' | 'users'>('overview');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

  const [formsList, setFormsList] = useState<FormConfig[]>(allForms);
  const [submissionsList, setSubmissionsList] = useState<FormSubmission[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [form, setForm] = useState<FormConfig>(
    initialForm || {
      id: Date.now(),
      name: 'Untitled Form',
      description: 'Configure the structure and rules of this form.',
      status: 'active',
      fields: [
        {
          id: 1,
          parent_id: null,
          name: 'field_1',
          label: 'Field 1',
          type: 'free_text',
          required: true,
          sort_order: 1,
          placeholder: 'Enter value...',
        },
      ],
    }
  );

  const [selectedFieldId, setSelectedFieldId] = useState<number | string>(1);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [configTab, setConfigTab] = useState<'basic' | 'options' | 'advanced'>('basic');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDropSlot, setActiveDropSlot] = useState<string | null>(null);
  const [history, setHistory] = useState<FormConfig[]>([form]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('df_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'responder') {
          setActiveNav('forms');
        } else {
          setActiveNav('overview');
        }
      }
    } catch (err) {
    } finally {
      setTimeout(() => {
        setIsAuthChecking(false);
      }, 400);
    }

    fetchFormsAndSubmissions();
    fetchUsers();
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast('success', `Welcome, ${user.name}`, `Signed in as ${user.role}.`);
    if (user.role === 'responder') {
      setActiveNav('forms');
    } else {
      setActiveNav('overview');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('df_auth_user');
    showToast('info', 'Logged Out', 'Your session has ended.');
    setCurrentUser(null);
    setOriginalAdminUser(null);
  };

  const handleImpersonateUser = (targetUser: User) => {
    setOriginalAdminUser(currentUser);
    setCurrentUser(targetUser);
    setActiveNav('forms');
    showToast('info', 'Impersonation Mode Active', `Now viewing the app as ${targetUser.name} (${targetUser.role}).`);
  };

  const handleExitImpersonation = () => {
    if (originalAdminUser) {
      setCurrentUser(originalAdminUser);
      setOriginalAdminUser(null);
      setActiveNav('users');
      showToast('success', 'Admin Session Restored', `Returned to ${originalAdminUser.name}.`);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(data.data);
      }
    } catch (e) {
    }
  };

  const fetchFormsAndSubmissions = async () => {
    setIsLoadingData(true);
    try {
      const [resForms, resSubs] = await Promise.all([
        fetch('/api/forms').then(r => r.json()),
        fetch('/api/submissions').then(r => r.json()),
      ]);
      if (resForms.success && resForms.data) {
        setFormsList(resForms.data);
      }
      if (resSubs.success && resSubs.data) {
        setSubmissionsList(resSubs.data);
      }
    } catch (e) {
    } finally {
      setIsLoadingData(false);
    }
  };

  const pushHistory = (newForm: FormConfig) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newForm);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setForm(newForm);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setForm(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setForm(history[historyIndex + 1]);
    }
  };

  const selectedField = useMemo(() => {
    return form.fields.find(f => f.id === selectedFieldId) || form.fields[0];
  }, [form.fields, selectedFieldId]);

  const updateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedField) return;
    const updatedFields = form.fields.map(f =>
      f.id === selectedField.id ? { ...f, ...updates } : f
    );
    const newForm = { ...form, fields: updatedFields };
    pushHistory(newForm);
  };

  const handleInsertComponent = (
    type: FieldType,
    label: string,
    placeholder?: string,
    targetParentId: number | string | null = null,
    insertIndex?: number,
    initialConditionValue?: string
  ) => {
    const newId = Date.now();
    const newName =
      label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);

    const parentField = targetParentId ? form.fields.find(f => f.id === targetParentId) : null;
    const conditionVal =
      initialConditionValue ||
      (parentField && parentField.options && parentField.options.length > 0
        ? parentField.options[0].value
        : 'active');

    const newField: FormField = {
      id: newId,
      parent_id: targetParentId,
      name: newName,
      label: label,
      type: type,
      required: false,
      sort_order: (insertIndex !== undefined ? insertIndex : form.fields.length) + 1,
      placeholder: placeholder || `Enter ${label.toLowerCase()}...`,
      options:
        type === 'select' || type === 'option'
          ? [
              { id: 1, label: 'Option 1', value: 'opt_1', sort_order: 1 },
              { id: 2, label: 'Option 2', value: 'opt_2', sort_order: 2 },
            ]
          : [],
      rules:
        targetParentId && parentField
          ? [
              {
                id: Date.now() + 1,
                field_id: newId,
                source_field_id: targetParentId,
                operator: 'equals',
                value: conditionVal,
                action: 'show',
              },
            ]
          : [],
    };

    let updatedFields = [...form.fields];
    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= updatedFields.length) {
      updatedFields.splice(insertIndex, 0, newField);
    } else {
      updatedFields.push(newField);
    }

    updatedFields = updatedFields.map((f, i) => ({ ...f, sort_order: i + 1 }));

    const newForm = { ...form, fields: updatedFields };
    pushHistory(newForm);
    setSelectedFieldId(newId);
    setIsConfigOpen(true);
    showToast('info', 'Component Added', `"${label}" was placed on canvas.`);
  };

  const handleDuplicateField = (fieldId: number | string) => {
    const target = form.fields.find(f => f.id === fieldId);
    if (!target) return;

    const idMap = new Map<string, number | string>();
    const timestamp = Date.now();
    let counter = 0;

    const getNewId = () => {
      counter += 1;
      return timestamp + counter;
    };

    const findDescendants = (parentId: number | string): FormField[] => {
      const children = form.fields.filter(f => f.parent_id === parentId);
      let all: FormField[] = [];
      for (const child of children) {
        all.push(child);
        all = all.concat(findDescendants(child.id));
      }
      return all;
    };

    const descendants = findDescendants(target.id);
    const allToClone = [target, ...descendants];

    allToClone.forEach(f => {
      idMap.set(String(f.id), getNewId());
    });

    const clonedFields: FormField[] = allToClone.map(orig => {
      const newId = idMap.get(String(orig.id))!;
      const newParentId = orig.parent_id ? idMap.get(String(orig.parent_id)) || orig.parent_id : null;
      const isRoot = orig.id === target.id;
      const randomSuffix = Math.floor(Math.random() * 1000);

      const clonedRules = (orig.rules || []).map(r => {
        const mappedSourceId = idMap.get(String(r.source_field_id)) || r.source_field_id;
        return {
          ...r,
          id: getNewId(),
          field_id: newId,
          source_field_id: mappedSourceId,
        };
      });

      return {
        ...orig,
        id: newId,
        parent_id: newParentId,
        name: `${orig.name}_copy_${randomSuffix}`,
        label: isRoot ? `${orig.label} (Copy)` : orig.label,
        options: orig.options ? orig.options.map(opt => ({ ...opt, id: getNewId() })) : [],
        rules: clonedRules,
      };
    });

    const lastDescendant = descendants.length > 0 ? descendants[descendants.length - 1] : target;
    const insertAfterIndex = form.fields.findIndex(f => f.id === lastDescendant.id);

    const updated = [...form.fields];
    updated.splice(insertAfterIndex + 1, 0, ...clonedFields);
    const reindexed = updated.map((f, i) => ({ ...f, sort_order: i + 1 }));

    const newForm = { ...form, fields: reindexed };
    pushHistory(newForm);
    setSelectedFieldId(clonedFields[0].id);
    showToast('info', 'Field Duplicated', `Cloned "${target.label}" and all child branch fields.`);
  };

  const handleDeleteField = (fieldId: number | string) => {
    const target = form.fields.find(f => f.id === fieldId);
    const findDescendantIds = (parentId: number | string): Array<number | string> => {
      const children = form.fields.filter(f => f.parent_id === parentId);
      let ids: Array<number | string> = [];
      for (const child of children) {
        ids.push(child.id);
        ids = ids.concat(findDescendantIds(child.id));
      }
      return ids;
    };

    const toDeleteIds = new Set([fieldId, ...findDescendantIds(fieldId)]);
    const remaining = form.fields.filter(f => !toDeleteIds.has(f.id));
    const reindexed = remaining.map((f, i) => ({ ...f, sort_order: i + 1 }));
    const newForm = { ...form, fields: reindexed };
    pushHistory(newForm);
    if (toDeleteIds.has(selectedFieldId) && reindexed.length > 0) {
      setSelectedFieldId(reindexed[0].id);
    }
    showToast('delete', 'Field Deleted', `"${target?.label || 'Field'}" was removed from the form.`);
  };

  const handleDeleteForm = async (formId: number | string) => {
    const targetFormName = formToDelete?.name || 'Form';
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = formsList.filter(f => String(f.id) !== String(formId));
        setFormsList(remaining);
        fetchFormsAndSubmissions();
        if (String(form.id) === String(formId)) {
          if (remaining.length > 0) {
            setForm(remaining[0]);
            setHistory([remaining[0]]);
            setHistoryIndex(0);
          } else {
            const fresh: FormConfig = {
              id: Date.now(),
              name: 'New Custom Form',
              description: 'Configure the structure and rules of this form.',
              status: 'active',
              fields: [
                {
                  id: 1,
                  parent_id: null,
                  name: 'field_1',
                  label: 'Field 1',
                  type: 'free_text',
                  required: true,
                  sort_order: 1,
                  placeholder: 'Enter value...',
                },
              ],
            };
            setForm(fresh);
            setHistory([fresh]);
            setHistoryIndex(0);
          }
        }
        setFormToDelete(null);
        showToast('delete', 'Form Deleted', `"${targetFormName}" was deleted from database.`);
      }
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        fetchFormsAndSubmissions();
        showToast('success', 'Form Saved Successfully', `"${form.name}" has been synchronized with the database.`);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadForm = (targetForm: FormConfig) => {
    setForm(targetForm);
    setHistory([targetForm]);
    setHistoryIndex(0);
    if (targetForm.fields.length > 0) {
      setSelectedFieldId(targetForm.fields[0].id);
    }
    setActiveNav('builder');
  };

  const handlePaletteDragStart = (
    e: React.DragEvent,
    type: FieldType,
    label: string,
    placeholder?: string
  ) => {
    setIsDragging(true);
    const payload = JSON.stringify({ isNew: true, type, label, placeholder });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setActiveDropSlot(null);
  };

  const handleSlotDrop = (
    e: React.DragEvent,
    targetParentId: number | string | null,
    targetInsertIndex: number,
    branchConditionValue?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setActiveDropSlot(null);

    const rawData =
      e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.isNew) {
        handleInsertComponent(
          data.type,
          data.label,
          data.placeholder,
          targetParentId,
          targetInsertIndex,
          branchConditionValue
        );
      }
    } catch (err) {
    }
  };

  const handleCreateNewForm = () => {
    const newFormConfig: FormConfig = {
      id: Date.now(),
      name: 'Untitled Form',
      description: 'Configure structure and rules dynamically.',
      status: 'active',
      fields: [
        {
          id: Date.now() + 1,
          parent_id: null,
          name: 'field_1',
          label: 'Field 1',
          type: 'free_text',
          required: true,
          sort_order: 1,
          placeholder: 'Enter value...',
        },
      ],
    };
    setForm(newFormConfig);
    setHistory([newFormConfig]);
    setHistoryIndex(0);
    setSelectedFieldId(newFormConfig.fields[0].id);
    setActiveNav('builder');
    showToast('info', 'New Form Prepared', 'Blank canvas ready for designing.');
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border-2 border-indigo-600 border-t-transparent animate-spin" />
          <div className="absolute w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md animate-pulse">
            D
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Dynamic Form Studio</h3>
          <p className="text-xs text-slate-400 font-medium animate-pulse">
            Loading workspace and database configurations...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onSuccess={handleAuthSuccess} />;
  }

  const isResponderOnly = currentUser.role === 'responder';

  return (
    <div
      onDragEnd={handleDragEnd}
      className="flex flex-col h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden antialiased select-none"
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {originalAdminUser && (
        <div className="h-10 bg-indigo-600 text-white px-6 flex items-center justify-between text-xs font-bold shadow-md z-50 flex-shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>
              Impersonation Mode: You are logged in as <u>{currentUser.name}</u> ({currentUser.role})
            </span>
          </div>
          <button
            type="button"
            onClick={handleExitImpersonation}
            className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-indigo-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return to Admin Account ({originalAdminUser.name})</span>
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <SidebarNav
          currentUser={currentUser}
          onLogout={handleLogout}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          isNavCollapsed={isNavCollapsed}
          setIsNavCollapsed={setIsNavCollapsed}
          formsCount={formsList.length}
          submissionsCount={submissionsList.length}
          usersCount={usersList.length}
          onNewForm={handleCreateNewForm}
        />

        {isResponderOnly && (
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto p-8 space-y-6 animate-fadeIn">
            <div className="max-w-4xl w-full mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Responder Portal ({currentUser.name})</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Available Forms to Fill
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a form below and submit your responses according to the questions listed.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">
                    {formsList.length} Forms Ready
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {submissionsList.length} Responses Saved
                  </span>
                </div>
              </div>

              {isLoadingData && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              )}

              {formsList.length === 0 && !isLoadingData ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No active forms yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    The administrator has not published any forms yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {formsList.map(f => (
                    <div
                      key={f.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Form #{f.id}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Ready to Fill
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {f.name}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {f.description || 'Please fill out the questions in this form.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {f.fields?.length || 0} Questions
                        </span>

                        <button
                          onClick={() => {
                            setForm(f);
                            setIsPreviewOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                        >
                          <span>Start Form</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {submissionsList.length > 0 && (
                <div className="pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Recent Submissions History
                  </h3>
                  <div className="space-y-3">
                    {submissionsList.slice(0, 5).map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">
                              {sub.form_name || `Form #${sub.form_id}`}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              Submitted: {new Date(sub.created_at).toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {Object.keys(sub.data).length} Answers
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isResponderOnly && activeNav === 'overview' && (
          <DashboardOverview
            currentUser={currentUser}
            forms={formsList}
            submissions={submissionsList}
            onCreateNewForm={handleCreateNewForm}
            onEditForm={handleLoadForm}
            onPreviewForm={f => {
              setForm(f);
              setIsPreviewOpen(true);
            }}
            onViewAllForms={() => setActiveNav('forms')}
            onViewUsers={() => setActiveNav('users')}
            onViewSubmissions={() => setActiveNav('configurations')}
          />
        )}

        {!isResponderOnly && activeNav === 'users' && (
          <UserManagement
            currentUser={currentUser}
            users={usersList}
            onRefreshUsers={fetchUsers}
            onImpersonateUser={handleImpersonateUser}
            showToast={showToast}
          />
        )}

        {!isResponderOnly && activeNav === 'forms' && (
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto p-8 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  All Configured Forms
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse, edit structure, manage rules, run live forms, or delete forms.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveNav('builder');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Form</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {formsList.map(f => (
                <div
                  key={f.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                        ID #{f.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                        <button
                          onClick={() => setFormToDelete(f)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Form"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{f.name}</h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {f.description || 'Configured via LogicFlow Architect.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Fields: {f.fields?.length || 0}</span>
                      <span>
                        Rules:{' '}
                        {(f.fields || []).reduce((acc, curr) => acc + (curr.rules?.length || 0), 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoadForm(f)}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition text-center"
                      >
                        Builder
                      </button>
                      <button
                        onClick={() => {
                          setForm(f);
                          setIsPreviewOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition text-center shadow-xs"
                      >
                        Fill Form
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isResponderOnly && activeNav === 'configurations' && (
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Database Submissions & Data Logs
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review all submitted form data validated through the Dynamic Zod and Rule Engine.
                </p>
              </div>

              <button
                onClick={fetchFormsAndSubmissions}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                Refresh Data
              </button>
            </div>

            {submissionsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Database className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No submissions recorded yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Open the Form Builder or click "Fill Form" to submit responses to the database.
                </p>
                <button
                  onClick={() => {
                    setActiveNav('builder');
                    setIsPreviewOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Test Fill Form Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissionsList.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          #{sub.id}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            {sub.form_name || `Form #${sub.form_id}`}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Submitted: {new Date(sub.created_at).toLocaleString('en-US')}
                            {sub.user_name && ` by ${sub.user_name}`}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        Validated & Saved
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(sub.data).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {key}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 break-words">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isResponderOnly && activeNav === 'builder' && (
          <>
            <ComponentPalette
              isPaletteCollapsed={isPaletteCollapsed}
              setIsPaletteCollapsed={setIsPaletteCollapsed}
              onPaletteDragStart={handlePaletteDragStart}
              onInsertComponent={handleInsertComponent}
            />

            <FormCanvas
              form={form}
              setFormName={name => {
                const newForm = { ...form, name };
                pushHistory(newForm);
              }}
              setFormDescription={description => {
                const newForm = { ...form, description };
                pushHistory(newForm);
              }}
              selectedFieldId={selectedFieldId}
              onSelectField={id => {
                setSelectedFieldId(id);
                setIsConfigOpen(true);
              }}
              onDuplicateField={handleDuplicateField}
              onDeleteField={handleDeleteField}
              onSlotDrop={handleSlotDrop}
              onInsertComponent={handleInsertComponent}
              isDragging={isDragging}
              activeDropSlot={activeDropSlot}
              setActiveDropSlot={setActiveDropSlot}
              onPreview={() => setIsPreviewOpen(true)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onRequestDeleteForm={() => setFormToDelete(form)}
              onSave={handleSave}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
            />

            {isConfigOpen && selectedField && (
              <FieldConfigDrawer
                form={form}
                selectedField={selectedField}
                configTab={configTab}
                setConfigTab={setConfigTab}
                onUpdateField={updateSelectedField}
                onClose={() => setIsConfigOpen(false)}
              />
            )}
          </>
        )}
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Fill Form ({form.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#f8fafc]">
              <DynamicForm
                formConfig={form}
                showInspector={false}
                onSubmitSuccess={() => {
                  fetchFormsAndSubmissions();
                  showToast('success', 'Form Response Submitted', 'Your response has been saved to the database.');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {formToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Form?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete form "{formToDelete.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteForm(formToDelete.id)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Form</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
