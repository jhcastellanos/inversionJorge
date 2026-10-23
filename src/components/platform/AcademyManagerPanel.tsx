'use client';

import { useCallback, useMemo, useState } from 'react';
import AdminPanelChrome from './admin/AdminPanelChrome';
import {
  adminField,
  adminLabel,
  adminPanelShell,
  adminGhostBtn,
  adminLessonPanel,
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

function formatMb(bytes: number | null) {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function NewLessonBar({
  moduleId,
  defaultCode,
  onCreated,
}: {
  moduleId: number;
  defaultCode: string;
  onCreated: () => void;
}) {
  const { isDark } = useAdminPanelTheme();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lessonCode, setLessonCode] = useState(defaultCode);
  const [title, setTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [fileUrl, setFileUrl] = useState('');
  const [duration, setDuration] = useState('15:30');
  const [fileSize, setFileSize] = useState<number | null>(null);

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

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/academy-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: moduleId,
          lesson_code: lessonCode,
          title,
          lesson_type: lessonType,
          file_url: lessonType === 'link' ? fileUrl : fileUrl || null,
          duration_label: duration,
          file_size_bytes: fileSize,
        }),
      });
      if (!res.ok) throw new Error('No se pudo crear');
      setOpen(false);
      setTitle('');
      setFileUrl('');
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-4 text-sm font-semibold ${adminLinkAccent(isDark)}`}
      >
        + Add Lesson
      </button>
    );
  }

  return (
    <div className={adminLessonPanel(isDark)}>
      <p className={`text-[11px] font-bold tracking-widest uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
        New lesson
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-12 items-end">
        <label className="sm:col-span-2">
          <span className={adminLabel(isDark)}>Lesson ID</span>
          <input value={lessonCode} onChange={(e) => setLessonCode(e.target.value)} className={adminField(isDark)} />
        </label>
        <label className="sm:col-span-6">
          <span className={adminLabel(isDark)}>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={adminField(isDark)} required />
        </label>
        <label className="sm:col-span-4">
          <span className={adminLabel(isDark)}>Type</span>
          <select
            value={lessonType}
            onChange={(e) => setLessonType(e.target.value as LessonType)}
            className={adminField(isDark)}
          >
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="link">Link</option>
          </select>
        </label>
        {lessonType === 'link' ? (
          <label className="sm:col-span-12">
            <span className={adminLabel(isDark)}>URL</span>
            <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className={adminField(isDark)} />
          </label>
        ) : (
          <label className="sm:col-span-12">
            <span className={adminLabel(isDark)}>Upload file</span>
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
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                {uploading ? 'Subiendo…' : `Listo · ${formatMb(fileSize)}`}
              </p>
            )}
          </label>
        )}
        <label className="sm:col-span-3">
          <span className={adminLabel(isDark)}>Duration</span>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className={adminField(isDark)} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving || !title.trim()}
          onClick={() => void create()}
          className={adminPrimaryBtn(isDark)}
        >
          {saving ? '…' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={adminGhostBtn(isDark)}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}

function ModuleList({ modules, reload }: { modules: ModuleRow[]; reload: () => void }) {
  const { isDark } = useAdminPanelTheme();
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
      {modules.map((mod, idx) => {
        const isOpen = expanded[mod.id] ?? true;
        return (
          <li key={mod.id} className={adminPanelShell(isDark)}>
            <div className="p-5 border-b border-white/5">
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
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {mod.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mod.is_published && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          Published
                        </span>
                      )}
                      <span className={`text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        {mod.lessons.length} lessons
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [mod.id]: !isOpen }))}
                    className={`text-sm px-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
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
                        isDark ? 'bg-[#12151c]' : 'bg-slate-50 border border-gray-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {lesson.lesson_type === 'video' && '🎬 '}
                          {lesson.lesson_type === 'pdf' && '📄 '}
                          {lesson.lesson_type === 'link' && '🔗 '}
                          {lesson.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                          {lesson.lesson_code}
                          {lesson.duration_label ? ` · ${lesson.duration_label}` : ''}
                          {lesson.file_size_bytes ? ` · ${formatMb(lesson.file_size_bytes)}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLesson(lesson.id)}
                        className="text-xs text-red-400 hover:underline shrink-0"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <NewLessonBar
                  moduleId={mod.id}
                  defaultCode={`${idx + 1}.${mod.lessons.length + 1}`}
                  onCreated={reload}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AcademyManagerInner({ initialModules }: { initialModules: ModuleRow[] }) {
  const { isDark } = useAdminPanelTheme();
  const [modules, setModules] = useState(initialModules);

  const reload = useCallback(async () => {
    const res = await fetch('/api/admin/academy-modules');
    if (res.ok) {
      const data = await res.json();
      setModules(data.modules ?? []);
    }
  }, []);

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

  const addModule = async () => {
    const title = prompt('Nombre del módulo');
    if (!title?.trim()) return;
    const description = prompt('Descripción (opcional)') ?? '';
    await fetch('/api/admin/academy-modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), description }),
    });
    await reload();
  };

  return (
    <>
      <div className="flex justify-end -mt-2 mb-4">
        <button type="button" onClick={() => void addModule()} className={adminPrimaryBtn(isDark)}>
          + Add Module
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(
          [
            ['Modules', stats.modules],
            ['Videos', stats.videos],
            ['PDFs', stats.pdfs],
            ['Links', stats.links],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className={adminStatCard(isDark)}>
            <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${adminStatValue(isDark)}`}>{n}</p>
          </div>
        ))}
      </div>
      <ModuleList modules={modules} reload={() => void reload()} />
    </>
  );
}

export default function AcademyManagerPanel({ initialModules }: { initialModules: ModuleRow[] }) {
  return (
    <AdminPanelChrome
      title="Academy Manager"
      subtitle="Manage modules, lessons, and content. Visible para usuarios activos con rol Estudiante o superior."
    >
      <AcademyManagerInner initialModules={initialModules} />
    </AdminPanelChrome>
  );
}
