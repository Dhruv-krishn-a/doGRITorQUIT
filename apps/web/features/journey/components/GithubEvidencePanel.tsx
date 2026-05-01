import React, { useState, useEffect } from "react";
import { Github, GitBranch, GitCommit, GitPullRequest, Loader2, Link2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { GithubFeature } from "@gritorquit/domain/github-projects/types";
import { toast } from "sonner";

interface GithubEvidencePanelProps {
  projectId: string;
  feature: GithubFeature;
  repoName: string | null;
  onUpdateEvidence: (updates: any) => Promise<void>;
}

export function GithubEvidencePanel({ projectId, feature, repoName, onUpdateEvidence }: GithubEvidencePanelProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isLinkingBranch, setIsLinkingBranch] = useState(false);
  const [isLinkingPR, setIsLinkingPR] = useState(false);

  useEffect(() => {
    if (!repoName) return;
    fetchGithubData();
  }, [feature.id, repoName]);

  const fetchGithubData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (feature.githubBranch) {
        const [commitsRes, prsRes] = await Promise.all([
          fetch(`/api/github-projects/${projectId}/repo-data?action=commits&branch=${feature.githubBranch}`).then(r => r.json()),
          fetch(`/api/github-projects/${projectId}/repo-data?action=prs`).then(r => r.json())
        ]);
        setCommits(commitsRes);
        setPrs(prsRes.filter((pr: any) => pr.branch === feature.githubBranch));
        
        // Auto-link PR if one matches the branch and none is linked
        const matchingPr = prsRes.find((pr: any) => pr.branch === feature.githubBranch);
        if (matchingPr && !feature.githubPullReq) {
          await onUpdateEvidence({ githubPullReq: matchingPr.id });
        }
      } else {
        setCommits([]);
        setPrs([]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch GitHub data. Check your token.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranchesForLinking = async () => {
    setIsLinkingBranch(true);
    try {
      const res = await fetch(`/api/github-projects/${projectId}/repo-data?action=branches`);
      if (!res.ok) throw new Error(await res.text());
      setBranches(await res.json());
    } catch (err: any) {
      toast.error(err.message);
      setIsLinkingBranch(false);
    }
  };

  const handleLinkBranch = async (branchName: string) => {
    await onUpdateEvidence({ githubBranch: branchName });
    setIsLinkingBranch(false);
    fetchGithubData();
  };

  const handleUnlinkBranch = async () => {
    await onUpdateEvidence({ githubBranch: null, githubPullReq: null });
    setCommits([]);
    setPrs([]);
  };

  if (!repoName) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-8 text-center flex flex-col items-center">
        <Github size={32} className="text-[var(--text-secondary)] opacity-50 mb-4" />
        <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)] mb-2">No Repository Linked</h3>
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
          Link a GitHub repository to the project to automatically pull in branches, commits, and pull requests.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-6 md:p-8 flex flex-col h-full overflow-hidden shadow-inner">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
          <Github size={16} className="text-[var(--text-primary)]" /> GitHub Evidence
        </h3>
        {isLoading && <Loader2 size={14} className="animate-spin text-[var(--accent-color)]" />}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
        {/* Branch Link Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
              <GitBranch size={12} /> Active Branch
            </h4>
            {feature.githubBranch && (
              <button onClick={handleUnlinkBranch} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">Unlink</button>
            )}
          </div>
          
          {feature.githubBranch ? (
             <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm flex items-center justify-between">
               <span className="text-sm font-bold text-[var(--text-primary)] truncate font-mono">{feature.githubBranch}</span>
             </div>
          ) : (
             <div className="bg-[var(--bg-card)]/50 border border-dashed border-[var(--border-color)] rounded-xl p-6 text-center">
                {isLinkingBranch ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar text-left">
                    {branches.length === 0 ? <Loader2 size={16} className="animate-spin mx-auto text-[var(--text-secondary)]" /> : null}
                    {branches.map(b => (
                      <button key={b.name} onClick={() => handleLinkBranch(b.name)} className="w-full text-left px-3 py-2 text-xs font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors truncate">
                        {b.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button onClick={loadBranchesForLinking} className="flex items-center gap-2 mx-auto text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest hover:underline">
                    <Link2 size={12} /> Link Branch to Feature
                  </button>
                )}
             </div>
          )}
        </div>

        {/* Pull Request Section */}
        {feature.githubBranch && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
              <GitPullRequest size={12} /> Pull Request
            </h4>
            {prs.length > 0 ? (
               prs.map(pr => (
                 <a key={pr.id} href={pr.url} target="_blank" rel="noreferrer" className="block bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 rounded-xl p-4 shadow-sm transition-all group">
                   <div className="flex items-start justify-between mb-2">
                     <span className="text-xs font-black text-[var(--text-primary)] truncate pr-4 leading-tight">{pr.title}</span>
                     <ExternalLink size={12} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                   </div>
                   <div className="flex items-center gap-3">
                     <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${pr.state === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
                       {pr.state}
                     </span>
                     <span className="text-[10px] font-bold text-[var(--text-secondary)]">#{pr.id}</span>
                   </div>
                 </a>
               ))
            ) : (
               <div className="text-[10px] font-bold text-[var(--text-secondary)] italic uppercase tracking-widest opacity-60">No pull requests linked to this branch.</div>
            )}
          </div>
        )}

        {/* Commits Section */}
        {feature.githubBranch && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
              <GitCommit size={12} /> Recent Activity
            </h4>
            {commits.length > 0 ? (
               <div className="space-y-2">
                 {commits.map(commit => (
                   <a key={commit.sha} href={commit.url} target="_blank" rel="noreferrer" className="block bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-xl p-3 shadow-sm transition-all">
                      <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 mb-1">{commit.message}</p>
                      <div className="flex items-center justify-between text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                        <span>{commit.author}</span>
                        <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                      </div>
                   </a>
                 ))}
               </div>
            ) : (
               <div className="text-[10px] font-bold text-[var(--text-secondary)] italic uppercase tracking-widest opacity-60">No commits found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
