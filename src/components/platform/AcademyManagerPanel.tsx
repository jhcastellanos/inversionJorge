'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPanelChrome from './admin/AdminPanelChrome';
import { usePlatformPreferences } from './PlatformPreferencesProvider';
import {
  adminField,
  adminLabel,
  adminPanelShell,
  adminGhostBtn,
  adminLinkAccent,
  adminPrimaryBtn,
  adminStatCard,
  adminStatValue,
  useAdminPanelTheme,
} from './admin/AdminPanelTheme';
import type { LessonType } from '../../lib/platformAcademy';

type LessonRow = {
  id: number;
  module_id: number;
  lesson_code: string;
  title: string;
  lesson_type: LessonType;
  file_url: string | null;
  duration_label: string | null;
  file_size_bytes: number | null;
  sort_order: number;
  is_published: boolean;
};

type ModuleRow = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  lessons: LessonRow[];
};

type ModuleFormState = { mode: 'create' } | { mode: 'edit'; module: ModuleRow };

type LessonFormState = {
  moduleId: number;
  moduleTitle: string;
  defaultCode: string;
  lesson?: LessonRow;
};

function formatMb(bytes: number | null) {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function AcademyModuleForm({
  state,
  onCancel,
  onSaved,
}: {
  state: ModuleFormState;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { isDark } = useAdminPanelTheme();
  const [title, setTitle] = useState(state.mode === 'edit' ? state.module.title : '');
  const [description, setDescription] = useState(
    state.mode === 'edit' ? state.module.description ?? '' : ''
  );
  const [isPublished, setIsPublished] = useState(
    state.mode === 'edit' ? state.module.is_published : true
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.mode === 'edit') {
      setTitle(state.module.title);
      setDescription(state.module.description ?? '');
      setIsPublished(state.module.is_published);
    } else {
      setTitle('');
      setDescription('');
      setIsPublished(true);
    }
    setError(null);
  }, [state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (state.mode === 'create') {
        const res = await fetch('/api/admin/academy-modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
        });
        if (!res.ok) throw new Error('No se pudo crear el módulo');
      } else {
        const res = await fetch(`/api/admin/academy-modules/${state.module.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            is_published: isPublished,
          }),
        });
        if (!res.ok) throw new Error('No se pudo actualizar el módulo');
      }
      onSaved();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="academy-module-form" className={`${adminPanelShell(isDark)} p-6 sm:p-8 mb-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className={`text-[11px] font-bold tracking-widest uppercase ${isDark ? 'text-emerald-400' : 'text-[var(--ventic-accent)]'}`}>
            {state.mode === 'create' ? 'Nuevo módulo' : 'Editar módulo'}
          </p>
          <h2 className="text-xl font-bold ventic-text mt-1">
            {state.mode === 'create' ? 'Crear módulo de academia' : state.module.title}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className={adminGhostBtn(isDark)}>
          Cerrar formulario
        </button>
      </div>
      <form onSubmit={submit} className="space-y-4 max-w-2xl">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:text-red-300 dark:bg-red-950/50 dark:border-red-500/30">
            {error}
          </p>
        )}
        <label className="block">
          <span className={adminLabel(isDark)}>Nombre del módulo</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={adminField(isDark)}
            placeholder="Ej. Fundamentos de trading"
          />
        </label>
        <label className="block">
          <span className={adminLabel(isDark)}>Descripción (opcional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${adminField(isDark)} resize-y min-h-[80px]`}
          />
        </label>
        {state.mode === 'edit' && (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600"
            />
            <span className="text-sm ventic-muted">Publicado</span>
          </label>
        )}
        <div className="flex flex-wrap gap-2 pt-2 border-t ventic-border">
          <button type="submit" disabled={saving || !title.trim()} className={adminPrimaryBtn(isDark)}>
            {saving ? 'Guardando…' : state.mode === 'create' ? 'Crear módulo' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={onCancel} className={adminGhostBtn(isDark)}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

function AcademyLessonForm({
  state,
  onCancel,
  onSaved,
}: {
  state: LessonFormState;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { isDark } = useAdminPanelTheme();
  const isEdit = Boolean(state.lesson);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonCode, setLessonCode] = useState(state.lesson?.lesson_code ?? state.defaultCode);
  const [title, setTitle] = useState(state.lesson?.title ?? '');
  const [lessonType, setLessonType] = useState<LessonType>(state.lesson?.lesson_type ?? 'video');
  const [fileUrl, setFileUrl] = useState(state.lesson?.file_url ?? '');
  const [duration, setDuration] = useState(state.lesson?.duration_label ?? '15:30');
  const [fileSize, setFileSize] = useState<number | null>(state.lesson?.file_size_bytes ?? null);

  useEffect(() => {
    setLessonCode(state.lesson?.lesson_code ?? state.defaultCode);
    setTitle(state.lesson?.title ?? '');
    setLessonType(state.lesson?.lesson_type ?? 'video');
    setFileUrl(state.lesson?.file_url ?? '');
    setDuration(state.lesson?.duration_label ?? '15:30');
    setFileSize(state.lesson?.file_size_bytes ?? null);
    setError(null);
  }, [state]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', lessonType === 'pdf' ? 'pdf' : 'video');
      const res = await fetch('/api/admin/academy-upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Error al subir');
      const data = await res.json();
      setFileUrl(data.url);
      setFileSize(data.file_size_bytes ?? file.size);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        module_id: state.moduleId,
        lesson_code: lessonCode,
        title: title.trim(),
        lesson_type: lessonType,
        file_url: lessonType === 'link' ? fileUrl : fileUrl || null,
        duration_label: duration,
        file_size_bytes: fileSize,
      };
      if (isEdit && state.lesson) {
        const res = await fetch(`/api/admin/academy-lessons/${state.lesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('No se pudo actualizar');
      } else {
        const res = await fetch('/api/admin/academy-lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('No se pudo crear');
      }
      onSaved();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="academy-lesson-form" className={`${adminPanelShell(isDark)} p-6 sm:p-8 mb-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className={`text-[11px] font-bold tracking-widest uppercase ${isDark ? 'text-emerald-400' : 'text-[var(--ventic-accent)]'}`}>
            {isEdit ? 'Editar lección' : 'Nueva lección'}
          </p>
          <h2 className="text-xl font-bold ventic-text mt-1">
            {state.moduleTitle}
            <span className="ventic-muted font-normal text-base"> · {isEdit ? state.lesson!.title : 'Contenido del módulo'}</span>
          </h2>
        </div>
        <button type="button" onClick={onCancel} className={adminGhostBtn(isDark)}>
          Cerrar formulario
        </button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:text-red-300 dark:bg-red-950/50 dark:border-red-500/30">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-12">
          <label className="sm:col-span-3 block">
            <span className={adminLabel(isDark)}>ID de lección</span>
            <input value={lessonCode} onChange={(e) => setLessonCode(e.target.value)} className={adminField(isDark)} />
          </label>
          <label className="sm:col-span-6 block">
            <span className={adminLabel(isDark)}>Título</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={adminField(isDark)} required />
          </label>
          <label className="sm:col-span-3 block">
            <span className={adminLabel(isDark)}>Tipo</span>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value as LessonType)}
              className={adminField(isDark)}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="link">Enlace</option>
            </select>
          </label>
          {lessonType === 'link' ? (
            <label className="sm:col-span-12 block">
              <span className={adminLabel(isDark)}>URL</span>
              <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className={adminField(isDark)} />
            </label>
          ) : (
            <label className="sm:col-span-12 block">
              <span className={adminLabel(isDark)}>{isEdit && fileUrl ? 'Reemplazar archivo (opcional)' : 'Subir archivo'}</span>
              <input
                type="file"
                accept={lessonType === 'pdf' ? '.pdf' : 'video/*'}
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f);
                }}
                className={`${adminField(isDark)} file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white`}
              />
              {fileUrl && (
                <p className={`text-xs mt-1 ventic-muted`}>
                  {uploading ? 'Subiendo…' : `Archivo listo · ${formatMb(fileSize)}`}
                </p>
              )}
            </label>
          )}
          <label className="sm:col-span-3 block">
            <span className={adminLabel(isDark)}>Duración</span>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} className={adminField(isDark)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t ventic-border">
          <button type="submit" disabled={saving || !title.trim()} className={adminPrimaryBtn(isDark)}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar lección' : 'Crear lección'}
          </button>
          <button type="button" onClick={onCancel} className={adminGhostBtn(isDark)}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

function ModuleList({
  modules,
  reload,
  onAddModule,
  onEditModule,
  onAddLesson,
  onEditLesson,
}: {
  modules: ModuleRow[];
  reload: () => void;
  onAddModule: () => void;
  onEditModule: (mod: ModuleRow) => void;
  onAddLesson: (mod: ModuleRow, defaultCode: string) => void;
  onEditLesson: (mod: ModuleRow, lesson: LessonRow, defaultCode: string) => void;
}) {
  const { isDark } = useAdminPanelTheme();
  const { t } = usePlatformPreferences();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const removeModule = async (id: number) => {
    if (!confirm('¿Eliminar módulo y sus lecciones?')) return;
    await fetch(`/api/admin/academy-modules/${id}`, { method: 'DELETE' });
    reload();
  };

  const removeLesson = async (id: number) => {
    if (!confirm('¿Eliminar lección?')) return;
    await fetch(`/api/admin/academy-lessons/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <ul className="space-y-4">
      {modules.length === 0 && (
        <li
          className={`rounded-2xl border border-dashed p-12 text-center text-sm ${isDark ? 'border-emerald-500/20 text-slate-500' : 'border-emerald-200 text-gray-500'}`}
        >
          {t('admin.academy.noModules')}
        </li>
      )}
      {modules.map((mod, idx) => {
        const isOpen = expanded[mod.id] ?? true;
        const defaultCode = `${idx + 1}.${mod.lessons.length + 1}`;
        return (
          <li key={mod.id} className={adminPanelShell(isDark)}>
            <div className="p-5 border-b ventic-border">
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="flex gap-3 min-w-0">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg uppercase tracking-wide">{mod.title}</h3>
                    {mod.description && (
                      <p className={`text-sm mt-1 ventic-muted`}>{mod.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mod.is_published && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {t('admin.academy.published')}
                        </span>
                      )}
                      <span className={`text-[10px] uppercase ventic-muted`}>
                        {mod.lessons.length}{' '}
                        {mod.lessons.length === 1 ? t('admin.academy.lessonOne') : t('admin.academy.lessons')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEditModule(mod)}
                    className={`${adminGhostBtn(isDark)} !px-3 !py-1.5 !text-xs`}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [mod.id]: !isOpen }))}
                    className={`text-sm px-2 ventic-muted`}
                  >
                    {isOpen ? '▲' : '▼'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeModule(mod.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            {isOpen && (
              <div className="p-5">
                <ul className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5 ${
                        isDark ? 'bg-[var(--ventic-bg)]' : 'bg-slate-50 border border-gray-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {lesson.lesson_type === 'video' && '🎬 '}
                          {lesson.lesson_type === 'pdf' && '📄 '}
                          {lesson.lesson_type === 'link' && '🔗 '}
                          {lesson.title}
                        </p>
                        <p className={`text-xs mt-0.5 ventic-muted`}>
                          {lesson.lesson_code}
                          {lesson.duration_label ? ` · ${lesson.duration_label}` : ''}
                          {lesson.file_size_bytes ? ` · ${formatMb(lesson.file_size_bytes)}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditLesson(mod, lesson, lesson.lesson_code)}
                          className={`text-xs font-semibold ${adminLinkAccent(isDark)}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLesson(lesson.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onAddLesson(mod, defaultCode)}
                  className={`mt-4 text-sm font-semibold ${adminLinkAccent(isDark)}`}
                >
                  + {t('admin.academy.addLesson')}
                </button>
              </div>
            )}
          </li>
        );
      })}
      {modules.length > 0 && (
        <li className="flex justify-center pt-2">
          <button type="button" onClick={onAddModule} className={adminGhostBtn(isDark)}>
            + {t('admin.academy.addAnotherModule')}
          </button>
        </li>
      )}
    </ul>
  );
}

function AcademyManagerInner({ initialModules }: { initialModules: ModuleRow[] }) {
  const { isDark } = useAdminPanelTheme();
  const { t } = usePlatformPreferences();
  const [modules, setModules] = useState(initialModules);
  const [moduleForm, setModuleForm] = useState<ModuleFormState | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch('/api/admin/academy-modules');
    if (res.ok) {
      const data = await res.json();
      setModules(data.modules ?? []);
    }
  }, []);

  useEffect(() => {
    if (!moduleForm && !lessonForm) return;
    const id = moduleForm ? 'academy-module-form' : 'academy-lesson-form';
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [moduleForm, lessonForm]);

  const openModuleCreate = () => {
    setLessonForm(null);
    setModuleForm({ mode: 'create' });
  };

  const openModuleEdit = (mod: ModuleRow) => {
    setLessonForm(null);
    setModuleForm({ mode: 'edit', module: mod });
  };

  const openLessonCreate = (mod: ModuleRow, defaultCode: string) => {
    setModuleForm(null);
    setLessonForm({
      moduleId: mod.id,
      moduleTitle: mod.title,
      defaultCode,
    });
  };

  const openLessonEdit = (mod: ModuleRow, lesson: LessonRow, defaultCode: string) => {
    setModuleForm(null);
    setLessonForm({
      moduleId: mod.id,
      moduleTitle: mod.title,
      defaultCode,
      lesson,
    });
  };

  const stats = useMemo(() => {
    let videos = 0;
    let pdfs = 0;
    let links = 0;
    for (const m of modules) {
      for (const l of m.lessons) {
        if (l.lesson_type === 'video') videos++;
        else if (l.lesson_type === 'pdf') pdfs++;
        else links++;
      }
    }
    return { modules: modules.length, videos, pdfs, links };
  }, [modules]);

  return (
    <>
      {moduleForm && (
        <AcademyModuleForm
          state={moduleForm}
          onCancel={() => setModuleForm(null)}
          onSaved={() => void reload()}
        />
      )}
      {lessonForm && (
        <AcademyLessonForm
          state={lessonForm}
          onCancel={() => setLessonForm(null)}
          onSaved={() => void reload()}
        />
      )}

      <div className="flex justify-end -mt-2 mb-4">
        <button
          type="button"
          disabled={moduleForm?.mode === 'create'}
          onClick={openModuleCreate}
          className={`${adminPrimaryBtn(isDark)} disabled:opacity-50`}
        >
          + {t('admin.academy.addModule')}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(
          [
            [t('admin.academy.statsModules'), stats.modules],
            [t('admin.academy.statsVideos'), stats.videos],
            [t('admin.academy.statsPdfs'), stats.pdfs],
            [t('admin.academy.statsLinks'), stats.links],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className={adminStatCard(isDark)}>
            <p className={`text-xs uppercase tracking-wide ventic-muted`}>{label}</p>
            <p className={`text-2xl font-bold mt-1 ${adminStatValue(isDark)}`}>{n}</p>
          </div>
        ))}
      </div>
      <ModuleList
        modules={modules}
        reload={() => void reload()}
        onAddModule={openModuleCreate}
        onEditModule={openModuleEdit}
        onAddLesson={openLessonCreate}
        onEditLesson={openLessonEdit}
      />
    </>
  );
}

export default function AcademyManagerPanel({ initialModules }: { initialModules: ModuleRow[] }) {
  const { t } = usePlatformPreferences();
  return (
    <AdminPanelChrome title={t('admin.academy.title')} subtitle={t('admin.academy.subtitle')}>
      <AcademyManagerInner initialModules={initialModules} />
    </AdminPanelChrome>
  );
}
