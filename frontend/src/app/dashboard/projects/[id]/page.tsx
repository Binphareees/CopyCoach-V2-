"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, ensureSupabaseConfig } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import {
  Folder,
  ArrowLeft,
  Search,
  Copy,
  Check,
  Star,
  Trash2,
  Edit2,
  FileText,
  Clock,
  Sparkles,
  Layers,
  AlertCircle
} from "lucide-react";

interface CopyHistoryItem {
  id: string;
  project_id?: string;
  copy_type?: string;
  tone?: string;
  original_text?: string;
  improved_text?: string;
  framework?: string;
  score?: number;
  favorite?: boolean;
  created_at?: string;
}

interface ProjectData {
  id: string;
  name: string;
  created_at?: string;
  description?: string;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [history, setHistory] = useState<CopyHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  const loadProject = useCallback(async () => {
    setLoading(true);
    await ensureSupabaseConfig();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Failed to load project:", projectError);
      setLoading(false);
      return;
    }

    setProject(projectData as ProjectData);
    setEditName(projectData.name || "");

    const { data: historyData, error: historyError } = await supabase
      .from("history")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (historyError) {
      console.error("Failed to load project history:", historyError);
    } else {
      setHistory((historyData as CopyHistoryItem[]) || []);
    }
    setLoading(false);
  }, [projectId, router]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        loadProject();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [loadProject]);

  async function renameProject() {
    if (!editName.trim() || !project) return;

    const { error } = await supabase
      .from("projects")
      .update({ name: editName.trim() })
      .eq("id", projectId);

    if (error) {
      console.error("Rename project error:", error);
      return;
    }

    setProject({ ...project, name: editName.trim() });
    setEditing(false);
  }

  async function deleteProject() {
    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      console.error("Delete project error:", error);
      return;
    }

    router.push("/dashboard");
  }

  function handleCopyText(text: string, id: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  async function toggleFavorite(id: string, currentFavorite: boolean) {
    const { error } = await supabase
      .from("history")
      .update({ favorite: !currentFavorite })
      .eq("id", id);

    if (error) {
      console.error("Toggle favorite error:", error);
      return;
    }

    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !currentFavorite } : item))
    );
  }

  async function deleteCopy(id: string) {
    const { error } = await supabase.from("history").delete().eq("id", id);

    if (error) {
      console.error("Delete copy error:", error);
      return;
    }

    setHistory((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirmId(null);
  }

  const filteredHistory = history.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.improved_text?.toLowerCase().includes(q) ||
      item.original_text?.toLowerCase().includes(q) ||
      item.copy_type?.toLowerCase().includes(q) ||
      item.tone?.toLowerCase().includes(q) ||
      item.framework?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen text-text-primary flex flex-col font-sans pb-16">
      <DashboardTopbar
        title="Project View"
        right={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        }
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* PROJECT HEADER */}
        <div className="border-b border-border pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted">
                <Folder className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                {editing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="cc-field w-56 rounded-lg px-3 py-1.5 text-lg font-bold text-text-primary sm:w-72"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={renameProject}
                      className="rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditName(project?.name || "");
                      }}
                      className="px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                      {project?.name || "Project Workspace"}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      title="Rename Project"
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <strong className="font-semibold text-text-secondary">{history.length}</strong>
                    {history.length === 1 ? "saved copy" : "saved copies"}
                  </span>
                  {project?.created_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteProjectModal(true)}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Project</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search copies by text, framework, tone, or type..."
              className="cc-field rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
              aria-label="Search copies in this project"
            />
          </div>

          <span className="hidden whitespace-nowrap text-xs text-text-muted sm:block">
            Showing {filteredHistory.length} of {history.length}
          </span>
        </div>

        {/* COPIES LIST */}
        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 animate-pulse rounded-md bg-surface-muted" />
                  <div className="h-3 w-14 animate-pulse rounded bg-surface-muted" />
                </div>
                <div className="mt-4 h-24 animate-pulse rounded-lg bg-surface-muted" />
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-16 text-center">
            <FileText className="mb-3 h-8 w-8 text-text-muted" />
            <h3 className="text-base font-bold text-text-primary">
              {search.trim() ? "No matching copy found" : "No copies in this project yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              {search.trim()
                ? "Try searching for a different keyword or clearing your filter."
                : "Head back to the CopyCoach AI Dashboard to generate and save your high-converting copy here."}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create New Copy</span>
            </Link>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-elevated">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-4 sm:p-5">
                {/* TOP META ROW */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      {item.copy_type || "Copywriting"}
                    </span>
                    {item.tone && (
                      <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-text-muted">
                        {item.tone}
                      </span>
                    )}
                    {item.framework && item.framework !== "None" && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-text-muted">
                        <Layers className="h-3 w-3" />
                        <span>{item.framework}</span>
                      </span>
                    )}
                    {item.created_at && (
                      <span className="inline-flex items-center text-[11px] text-text-muted">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id, !!item.favorite)}
                      title={item.favorite ? "Favorited" : "Add to favorites"}
                      className={`rounded-lg border p-1.5 transition-colors ${
                        item.favorite
                          ? "border-warning/40 bg-warning/10 text-warning"
                          : "border-border bg-surface text-text-muted hover:text-warning"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${item.favorite ? "fill-warning" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyText(item.improved_text || item.original_text || "", item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span className="font-medium text-success">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => deleteCopy(item.id)}
                          className="rounded-lg bg-danger px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-danger/85"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete Copy"
                        className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* COPY CONTENT */}
                <div className="mt-3 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {item.improved_text || item.original_text || "No copy text available."}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      {showDeleteProjectModal && (
        <div className="fixed inset-0 z-50 bg-[var(--modal-backdrop)] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full p-6 animate-pop">
            <div className="flex items-center gap-3 text-danger mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-text-primary">Delete Project?</h3>
            </div>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong>&ldquo;{project?.name}&rdquo;</strong> and all associated saved copy records? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(false)}
                className="text-xs text-text-secondary hover:text-text-primary px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteProject}
                className="text-xs text-white font-bold px-4 py-2 rounded-xl bg-danger hover:bg-danger/85 transition-colors shadow-soft cursor-pointer"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
