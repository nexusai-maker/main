// nexus-github.js - A simple project and user management library for static sites (GitHub Pages compatible)
(function() {
  const LOCAL_PROJECTS_KEY = "nexus_public_projects";
  const LOCAL_ACCOUNTS_KEY = "nexus_accounts";
  const LOCAL_USER_KEY = "nexus_user";

  function nowISO() {
    return new Date().toISOString();
  }

  function uuid(prefix) {
    return (prefix ? prefix + "_" : "") + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  async function readLocalProjects() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || "[]");
    } catch (e) {
      console.warn("Failed to parse local projects", e);
      return [];
    }
  }

  async function writeLocalProjects(arr) {
    try {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(arr || []));
      window.dispatchEvent(new CustomEvent("nexus:projects:updated", { detail: arr || [] }));
    } catch (e) {
      console.warn("Failed to write local projects", e);
    }
  }

  function getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || "{}");
    } catch (e) {
      console.warn("Failed to parse accounts", e);
      return {};
    }
  }

  function saveAccounts(obj) {
    try {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(obj || {}));
    } catch (e) {
      console.warn("Failed to save accounts", e);
    }
  }

  async function getProject(projectId) {
    if (!projectId) throw new Error("Missing project ID");
    const local = await readLocalProjects();
    const project = local.find((x) => x.id === projectId);
    if (project) return { source: "local", project };
    return null;
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#39;");
  }

  window.NexusAPI = {
    // Check if the current user owns the project (compares username)
    async isOwner(project, currentUserIdentifier) {
      if (!project || !currentUserIdentifier) return false;
      try {
        const identifier = String(currentUserIdentifier).toLowerCase();
        const author = String(project.author || "").toLowerCase();
        return author === identifier;
      } catch (e) {
        console.warn("Error checking ownership", e);
        return false;
      }
    },

    // List projects (public only by default). Accepts opts: { publicOnly }.
    async listProjects(opts = {}) {
      const local = await readLocalProjects();
      if (opts.publicOnly) return local.filter((p) => p.public);
      return local;
    },

    // Create a new project. Payload can include: title, desc, author, previewImage, previewText, public
    async createProject(payload) {
      const base = payload && typeof payload === "object" ? { ...payload } : {};
      const arr = await readLocalProjects();
      const id = uuid("local");
      const newProject = { 
        id, 
        ...base,
        created_at: base.created_at || nowISO(),
        public: base.public !== undefined ? base.public : true 
      };
      arr.unshift(newProject);
      await writeLocalProjects(arr);
      return { ok: true, source: "local", project: newProject };
    },

    // Update an existing project
    async updateProject(projectId, updates) {
      if (!projectId) throw new Error("Missing project ID");
      const arr = await readLocalProjects();
      const idx = arr.findIndex((p) => p.id === projectId);
      if (idx === -1) return { ok: false, error: "Project not found" };
      arr[idx] = { ...arr[idx], ...updates, updated_at: nowISO() };
      await writeLocalProjects(arr);
      return { ok: true, source: "local", project: arr[idx] };
    },

    // Delete a project
    async deleteProject(projectId) {
      if (!projectId) throw new Error("Missing project ID");
      const arr = await readLocalProjects();
      const idx = arr.findIndex((p) => p.id === projectId);
      if (idx === -1) return { ok: false, error: "Project not found" };
      arr.splice(idx, 1);
      await writeLocalProjects(arr);
      return { ok: true, source: "local" };
    },

    // Toggle the public flag of a project
    async togglePublic(projectId, makePublic) {
      return this.updateProject(projectId, { public: !!makePublic });
    },

    // Generate and download a simple HTML representation of the project
    async downloadProjectHtml(projectId, filename) {
      const result = await getProject(projectId);
      if (!result) return { ok: false, error: "Project not found" };
      
      const p = result.project;
      const title = escapeHtml(p.title || "Project");
      const desc = escapeHtml(p.desc || "");
      const previewImage = p.previewImage ? escapeHtml(p.previewImage) : "";
      const previewText = escapeHtml(p.previewText || "");
      
      const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px; background: #f7f9fb; }
  header { background: #222; color: #fff; padding: 20px; border-radius: 8px; }
  img { max-width: 100%; height: auto; border-radius: 6px; }
  .preview-text { margin-top: 16px; }
</style>
</head>
<body>
<header><h1>${title}</h1></header>
<main style="margin-top:16px">
  <p>${desc}</p>
  ${previewImage ? `<img src="${previewImage}" alt="${title} preview">` : ""}
  ${previewText ? `<div class="preview-text">${previewText}</div>` : ""}
</main>
</body>
</html>`;
      
      try {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || title.replace(/\s+/g, "_") + ".html";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        return { ok: true };
      } catch (e) {
        console.error("Download failed", e);
        return { ok: false, error: "Download failed" };
      }
    },

    // --- Local user management (plaintext, for demo only) ---
    async createUser(username, password) {
      if (!username || !password) return { ok: false, error: "Username and password required" };
      
      const accounts = getAccounts();
      const key = username.toLowerCase();
      if (accounts[key]) return { ok: false, error: "User already exists" };
      
      accounts[key] = { username, pass: password, created_at: nowISO() };
      saveAccounts(accounts);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ username }));
      window.dispatchEvent(new CustomEvent("nexus:user:changed", { detail: { username } }));
      return { ok: true, user: { username } };
    },

    async signIn(username, password) {
      if (!username || !password) return { ok: false, error: "Username and password required" };
      
      const accounts = getAccounts();
      const acc = accounts[username.toLowerCase()];
      if (!acc || acc.pass !== password) return { ok: false, error: "Invalid username or password" };
      
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ username }));
      window.dispatchEvent(new CustomEvent("nexus:user:changed", { detail: { username } }));
      return { ok: true, user: { username } };
    },

    async signOut() {
      localStorage.removeItem(LOCAL_USER_KEY);
      window.dispatchEvent(new CustomEvent("nexus:user:changed", { detail: null }));
      return { ok: true };
    },

    async getCurrentUser() {
      try {
        return JSON.parse(localStorage.getItem(LOCAL_USER_KEY) || "null");
      } catch {
        return null;
      }
    },

    _debug: { LOCAL_PROJECTS_KEY, LOCAL_ACCOUNTS_KEY, LOCAL_USER_KEY }
  };

  // Initialize: ensure every project has an id and public flag, and clean up old preview fields
  (async function initializeNexus() {
    try {
      const arr = await readLocalProjects();
      let changed = false;
      
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i].id) {
          arr[i].id = uuid("local");
          changed = true;
        }
        if (typeof arr[i].public === "undefined") {
          arr[i].public = true;
          changed = true;
        }
        // Clean up legacy preview fields
        if (arr[i].previewImage === undefined && arr[i].preview_image) {
          arr[i].previewImage = null;
          delete arr[i].preview_image;
          changed = true;
        }
      }
      
      if (changed) await writeLocalProjects(arr);
      window.dispatchEvent(new CustomEvent("nexus:projects:updated", { detail: arr }));
    } catch (e) {
      console.warn("Nexus initialisation failed", e);
    }
  })();
})();
