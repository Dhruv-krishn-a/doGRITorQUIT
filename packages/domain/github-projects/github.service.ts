import { Octokit } from "octokit";
import { prisma } from "@gritorquit/db";

export const getOctokitForUser = async (userId: string) => {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "github",
    }
  });

  if (!account || !account.access_token) {
    throw new Error("GitHub account not connected or access token missing.");
  }
  return new Octokit({ auth: account.access_token });
};

export const GithubRepoService = {
  async getRepoDetails(userId: string, ownerRepo: string) {
    const octokit = await getOctokitForUser(userId);
    const [owner, repo] = ownerRepo.split('/');
    if (!owner || !repo) throw new Error("Invalid repo format. Must be owner/repo");
    
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data;
  },

  async getBranches(userId: string, ownerRepo: string) {
    const octokit = await getOctokitForUser(userId);
    const [owner, repo] = ownerRepo.split('/');
    
    const { data } = await octokit.rest.repos.listBranches({ owner, repo, per_page: 50 });
    return data.map(b => ({ name: b.name, commitSha: b.commit.sha }));
  },

  async getPullRequests(userId: string, ownerRepo: string) {
    const octokit = await getOctokitForUser(userId);
    const [owner, repo] = ownerRepo.split('/');

    const { data } = await octokit.rest.pulls.list({ owner, repo, state: 'all', per_page: 20 });
    return data.map(pr => ({
      id: pr.number,
      title: pr.title,
      state: pr.state,
      url: pr.html_url,
      branch: pr.head.ref,
      author: pr.user?.login
    }));
  },

  async getBranchCommits(userId: string, ownerRepo: string, branch: string) {
    const octokit = await getOctokitForUser(userId);
    const [owner, repo] = ownerRepo.split('/');

    const { data } = await octokit.rest.repos.listCommits({ owner, repo, sha: branch, per_page: 10 });
    return data.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      url: c.html_url,
      author: c.commit.author?.name,
      date: c.commit.author?.date
    }));
  },

  async getFileContent(userId: string, ownerRepo: string, path: string) {
    const octokit = await getOctokitForUser(userId);
    const [owner, repo] = ownerRepo.split('/');
    
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
      if (!Array.isArray(data) && data.type === 'file' && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf8');
      }
      return null;
    } catch (e) {
      return null; // File might not exist
    }
  },

  async getRepoTree(userId: string, ownerRepo: string) {
    const octokit = await getOctokitForUser(userId);
    const [owner, repo] = ownerRepo.split('/');
    
    try {
      // Get default branch
      const repoData = await this.getRepoDetails(userId, ownerRepo);
      const defaultBranch = repoData.default_branch;
      
      // Get the tree (recursive 1 level deep to avoid massive payloads, but Octokit recursive is all-or-nothing, so we get the root tree)
      const { data: branchData } = await octokit.rest.repos.getBranch({ owner, repo, branch: defaultBranch });
      const treeSha = branchData.commit.commit.tree.sha;
      
      const { data: treeData } = await octokit.rest.git.getTree({ owner, repo, tree_sha: treeSha });
      
      // Return top-level directories and interesting files
      return treeData.tree
        .filter(t => t.type === 'tree' || t.path?.includes('package.json') || t.path?.includes('README'))
        .map(t => ({ path: t.path, type: t.type }));
    } catch (e) {
      return [];
    }
  }
};
