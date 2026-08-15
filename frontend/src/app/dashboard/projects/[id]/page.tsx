"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, ensureSupabaseConfig } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
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
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans pb-16">
      {/* TOP HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo theme="dark" size="sm" showTagline={false} />
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-400">Project View</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* PROJECT HERO CARD */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Folder className="w-7 h-7" />
              </div>

              <div>
                {editing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-bold bg-slate-950 border border-cyan-500 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={renameProject}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditName(project?.name || "");
                      }}
                      className="text-xs text-slate-400 hover:text-white px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {project?.name || "Project Workspace"}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      title="Rename Project"
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <strong>{history.length}</strong> {history.length === 1 ? "saved copy" : "saved copies"}
                  </span>
                  {project?.created_at && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Created on {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search copies by text, framework, tone, or type..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
            Showing {filteredHistory.length} of {history.length}
          </span>
        </div>

        {/* COPIES LIST */}
        {loading ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
            Loading project data...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              {search.trim() ? "No matching copy found" : "No copies in this project yet"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              {search.trim()
                ? "Try searching for a different keyword or clearing your filter."
                : "Head back to the CopyCoach AI Dashboard to generate and save your high-converting copy here."}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Copy</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg"
              >
                {/* TOP META ROW */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                      {item.copy_type || "Copywriting"}
                    </span>
                    {item.tone && (
                      <span className="text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg">
                        {item.tone}
                      </span>
                    )}
                    {item.framework && item.framework !== "None" && (
                      <span className="text-xs text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{item.framework}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.created_at && (
                      <span className="text-[11px] text-slate-500 mr-2">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id, !!item.favorite)}
                      title={item.favorite ? "Favorited" : "Add to favorites"}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        item.favorite
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-amber-300"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.favorite ? "fill-amber-400" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyText(item.improved_text || item.original_text || "", item.id)}
                      className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => deleteCopy(item.id)}
                          className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete Copy"
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* COPY CONTENT */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {item.improved_text || item.original_text || "No copy text available."}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      {showDeleteProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Project?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong>&ldquo;{project?.name}&rdquo;</strong> and all associated saved copy records? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteProjectModal(false)}
                className="text-xs text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteProject}
                className="text-xs text-white font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 cursor-pointer"
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
