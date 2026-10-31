
import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  getRepository,
  getRepositoryFile,
  searchRepository,
  askRepository,
} from "../services/api";
import Editor from "@monaco-editor/react";
import {
  Code2,
  Search,
  Folder,
  FolderOpen,
  FileCode2,
  GitBranch,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Clock3,
  Files,
  Languages,
  SearchX,
  Filter,
} from "lucide-react";

function getEditorLanguage(filePath) {
  const extension = filePath.split(".").pop().toLowerCase();

  const languages = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    c: "c",
    h: "c",
    cpp: "cpp",
    hpp: "cpp",
    cs: "csharp",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
    sql: "sql",
    php: "php",
    go: "go",
    rs: "rust",
    rb: "ruby",
    sh: "shell",
  };

  return languages[extension] || "plaintext";
}

const sampleResults = [
  {
    title: "App",
    path: "src/App.jsx",
    language: "JavaScript",
    lines: "1–24",
    targetLine: 5,
    description: "Main application component and route configuration.",
    snippet: `function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}`,
  },
  {
    title: "Landing",
    path: "src/pages/Landing.jsx",
    language: "JavaScript",
    lines: "1–85",
    targetLine: 4,
    description: "Renders the CodeAtlas landing page and navigation.",
    snippet: `function Landing() {
  return (
    <main>
      <h1>Explore your codebase</h1>
    </main>
  );
}`,
  },
  {
    title: "Dashboard",
    path: "src/pages/Dashboard.jsx",
    language: "JavaScript",
    lines: "1–190",
    targetLine: 2,
    description: "Handles repository ZIP selection and GitHub URL input.",
    snippet: `function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleContinue = () => {
    // Repository processing will be connected here
  };
}`,
  },
];

function buildFileTree(files) {
  const root = { name: "root", folders: {}, files: [] };

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current.files.push(file);
      } else {
        if (!current.folders[part]) {
          current.folders[part] = {
            name: part,
            folders: {},
            files: [],
          };
        }

        current = current.folders[part];
      }
    });
  });

  return root;
}

function FileTreeNode({ node, onOpenFile, selectedPath, isRoot = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const folders = Object.values(node.folders);

  return (
    <div>
      {!isRoot && (
        <button
          onClick={() => setIsOpen((previous) => !previous)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-400 hover:bg-white/5"
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {isOpen ? (
            <FolderOpen size={16} className="text-yellow-400" />
          ) : (
            <Folder size={16} className="text-yellow-400" />
          )}
          {node.name}
        </button>
      )}

      {(isOpen || isRoot) && (
        <div className={isRoot ? "" : "ml-4 border-l border-white/10 pl-2"}>
          {folders.map((folder) => (
            <FileTreeNode
              key={folder.name}
              node={folder}
              onOpenFile={onOpenFile}
              selectedPath={selectedPath}
            />
          ))}

          {node.files.map((file) => (
            <button
              key={file.path}
              onClick={() => onOpenFile(file)}
              className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                selectedPath === file.path
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileCode2 size={15} />
              <span className="truncate">{file.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function Workspace() {
    const location = useLocation();

const repoId = location.state?.repoId;
const initialRepoData = location.state?.repoData;

const [repoData, setRepoData] = useState(initialRepoData || null);
const [repositoryLoading, setRepositoryLoading] = useState(false);
const [repositoryError, setRepositoryError] = useState("");
useEffect(() => {
  if (!repoId) {
    setRepositoryError("Repository ID not found. Please upload a repository again.");
    return;
  }

  let cancelled = false;

  const fetchRepository = async () => {
    try {
      setRepositoryLoading(true);
      setRepositoryError("");

      const data = await getRepository(repoId);

      if (!cancelled) {
        setRepoData(data);
      }
    } catch (error) {
      if (!cancelled) {
        setRepositoryError(
          error.message || "Failed to fetch repository details."
        );
      }
    } finally {
      if (!cancelled) {
        setRepositoryLoading(false);
      }
    }
  };

  fetchRepository();

  return () => {
    cancelled = true;
  };
}, [repoId]);
    
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
const [searchLoading, setSearchLoading] = useState(false);
const [searchError, setSearchError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
const [chatError, setChatError] = useState("");

const [chatMessages, setChatMessages] = useState([
  {
    role: "assistant",
    content: "Hi! I'm CodeAtlas AI. Ask me anything about your codebase."
  }
]);
  const [selectedResult, setSelectedResult] = useState(sampleResults[0]);
  const [folderOpen, setFolderOpen] = useState(true);
  const [srcOpen, setSrcOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
const [selectedFileType, setSelectedFileType] = useState("All");
  const [openTabs, setOpenTabs] = useState([sampleResults[0]]);
const editorRef = useRef(null);
const fileRequestRef = useRef(0);
const [targetLine, setTargetLine] = useState(1);
const [fileContent, setFileContent] = useState("");
const [fileLoading, setFileLoading] = useState(false);
const [fileError, setFileError] = useState("");
const repositoryResults = Array.isArray(repoData?.files)
  ? repoData.files.map((file) => ({
      title: file.path.split("/").pop(),
      path: file.path,
      language: file.language,
      lines: `1–${file.line_count}`,
      targetLine: 1,
      description: `${file.line_count} lines of code`,
      snippet: "",
    }))
  : sampleResults;
  
  const fileTree = buildFileTree(repositoryResults);

  const repositoryName =
  repoData?.name ||
  repoData?.repo_name ||
  repoData?.repository_name ||
  "Your Repository";

  useEffect(() => {
  if (!repoData?.files?.length || !repoId) return;

  const firstFile = repositoryResults[0];

  setSelectedResult(firstFile);
  setTargetLine(1);
  setOpenTabs([firstFile]);
  setFileContent("");
  setFileError("");

  let cancelled = false;

  const loadFirstFile = async () => {
    try {
      setFileLoading(true);

      const data = await getRepositoryFile(repoId, firstFile.path);

      if (!cancelled) {
        setFileContent(data.content || "");
      }
    } catch (error) {
      if (!cancelled) {
        setFileError(error.message || "Unable to load this file.");
      }
    } finally {
      if (!cancelled) {
        setFileLoading(false);
      }
    }
  };

  loadFirstFile();

  return () => {
    cancelled = true;
  };
}, [repoData, repoId]);


const handleOpenFile = async (item) => {
  const requestId = ++fileRequestRef.current;

  setSelectedResult(item);
  setTargetLine(item.targetLine || 1);
  setFileContent(item.snippet || "");
  setFileError("");

  setOpenTabs((previousTabs) => {
    const alreadyOpen = previousTabs.some(
      (tab) => tab.path === item.path
    );

    if (alreadyOpen) return previousTabs;

    return [...previousTabs, item];
  });

  if (!repoId) return;

  try {
    setFileLoading(true);

    const data = await getRepositoryFile(repoId, item.path);

    if (requestId === fileRequestRef.current) {
      setFileContent(data.content || "");
    }
  } catch (error) {
    if (requestId === fileRequestRef.current) {
      setFileError(error.message || "Unable to load this file.");
    }
  } finally {
    if (requestId === fileRequestRef.current) {
      setFileLoading(false);
    }
  }
};


const handleSearch = async () => {
  if (!search.trim()) return;

  if (!repoId) {
    setSearchError("Repository ID is missing. Please upload a repository again.");
    return;
  }

  try {
    setSearchLoading(true);
    setSearchError("");
    setSearchResults(null);

    const data = await searchRepository(repoId, search.trim(), 10);

    const results = Array.isArray(data)
  ? data
  : Array.isArray(data?.results)
    ? data.results
    : [];

const formattedResults = results
  .filter((item) => item.file_path || item.path)
  .map((item) => {
    const filePath = item.file_path || item.path;

    return {
      title: item.symbol || filePath.split("/").pop(),
      path: filePath,
      language: item.language || "Other",
      lines: `${item.start_line || 1}–${item.end_line || item.start_line || 1}`,
      targetLine: item.start_line || 1,
      description: item.description || "Relevant code match",
      snippet: item.snippet || "",
    };
  });

setSearchResults(formattedResults);
  } catch (error) {
    setSearchError(error.message || "Search failed. Please try again.");
  } finally {
    setSearchLoading(false);
  }
};
const handleCloseTab = async (path) => {
  const remainingTabs = openTabs.filter(
    (tab) => tab.path !== path
  );

  setOpenTabs(remainingTabs);

  if (selectedResult?.path === path) {
    const nextTab =
      remainingTabs.length > 0
        ? remainingTabs[remainingTabs.length - 1]
        : null;

    setSelectedResult(nextTab);

    if (!nextTab) {
      setFileContent("");
      setFileError("");
      setTargetLine(1);
      return;
    }

    setTargetLine(nextTab.targetLine || 1);
    setFileError("");

    if (!repoId) {
      setFileContent(nextTab.snippet || "");
      return;
    }

    try {
      setFileLoading(true);

      const data = await getRepositoryFile(repoId, nextTab.path);

      setFileContent(data.content || "");
    } catch (error) {
      setFileError(error.message || "Unable to load this file.");
      setFileContent("");
    } finally {
      setFileLoading(false);
    }
  }
};
const handleSendMessage = async () => {
  if (!chatInput.trim() || chatLoading) return;

  if (!repoId) {
    setChatError("Repository ID is missing. Please upload a repository again.");
    return;
  }

  const userMessage = chatInput.trim();

  setChatMessages((previousMessages) => [
    ...previousMessages,
    {
      role: "user",
      content: userMessage,
    },
  ]);

  setChatInput("");
  setChatError("");

  try {
    setChatLoading(true);

    const data = await askRepository(repoId, userMessage, 10);

    const answer =
  data.answer ||
  "I couldn't find enough information to answer that question.";

const answerSourceNotice =
  data.answer_source === "none"
    ? "\n\nI couldn't generate an AI-supported answer for this question."
    : data.answer_source === "llm"
      ? "\n\nAI-generated answer based on repository context."
      : "";

    const references = Array.isArray(data.references)
      ? data.references
      : [];

    const referenceText = references.length
      ? "\n\nReferences:\n" +
        references
          .map((ref) =>
            `${ref.file_path || ref.path || "Unknown file"}${
              ref.start_line ? ` (line ${ref.start_line})` : ""
            }`
          )
          .join("\n")
      : "";

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "assistant",
        content: answer + answerSourceNotice + referenceText,
      },
    ]);
  } catch (error) {
    setChatError(error.message || "Unable to get an AI response.");
  } finally {
    setChatLoading(false);
  }
};
useEffect(() => {
  if (editorRef.current && selectedResult) {
    editorRef.current.revealLineInCenter(targetLine);

    editorRef.current.setPosition({
      lineNumber: targetLine,
      column: 1,
    });

    editorRef.current.focus();
  }
}, [selectedResult, targetLine]);

  const filteredResults = repositoryResults.filter((item) => {
  const content = [
    item.title,
    item.path,
    item.description,
    item.snippet,
  ].join(" ").toLowerCase();

  const matchesSearch = content.includes(search.toLowerCase());

  const extension = item.path.split(".").pop().toLowerCase();

  const languageMap = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "JavaScript",
    tsx: "JavaScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
  };

  const language = String(
  item.language || languageMap[extension] || "Other"
).toLowerCase();

const matchesLanguage =
  selectedLanguage === "All" ||
  language === selectedLanguage.toLowerCase();

  const fileTypeMap = {
    jsx: "Components",
    tsx: "Components",
    js: "Components",
    ts: "Components",
    py: "Pages",
    java: "Pages",
    css: "Stylesheets",
    scss: "Stylesheets",
    json: "Configuration",
  };

  const fileType = fileTypeMap[extension] || "Other";

  const matchesFileType =
    selectedFileType === "All" ||
    fileType === selectedFileType;

  return matchesSearch && matchesLanguage && matchesFileType;
});
const displayedResults = searchResults ?? filteredResults;

  return (
    <div className="min-h-screen bg-[#090d18] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Code2 className="text-violet-400" size={27} />
          CodeAtlas
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-9 md:px-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Folder size={15} />
            Repository workspace
            <ChevronRight size={14} />
            {repositoryName}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                {repositoryName}
              </h1>
              <p className="mt-2 text-gray-400">
                Explore files, search code and understand your repository.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Demo workspace
            </div>
          </div>
        </div>

        

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Files indexed</span>
              <Files className="text-violet-400" size={20} />
            </div>
            <p className="text-3xl font-bold">
  {repoData?.file_count ?? repoData?.files?.length ?? 0}
</p>
<p className="mt-1 text-xs text-gray-500">Files indexed</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Languages</span>
              <Languages className="text-cyan-400" size={20} />
            </div>
            <p className="text-3xl font-bold">
  {Object.keys(repoData?.languages || {}).length}
</p>
<p className="mt-1 text-xs text-gray-500">Languages detected</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Last indexed</span>
              <Clock3 className="text-pink-400" size={20} />
            </div>
            <p className="text-xl font-bold">
  {repoData ? "Completed" : "Loading..."}
</p>
<p className="mt-1 text-xs text-gray-500">
  Repository indexing status
</p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-[#111827] p-5 md:p-7">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="text-violet-400" size={21} />
            <h2 className="text-lg font-semibold">Ask your codebase</h2>
          </div>

          <p className="mb-5 text-sm text-gray-400">
            Search for functions, understand components or find where something
            happens in your project.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#090d18] px-4">
              <Search className="shrink-0 text-gray-500" size={19} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. Where is the dashboard component?"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-gray-600"
              />
            </div>

            <button
  onClick={handleSearch}
  disabled={searchLoading || !search.trim()}
  className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {searchLoading ? "Searching..." : "Search code"}
</button>
                    </div>
                    {searchError && (
  <p className="mt-2 text-sm text-red-400">
    {searchError}
  </p>
)}

          {/* Search Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Filter size={16} />
              Filters:
            </div>

            <select
              value={selectedLanguage}
              onChange={(event) => setSelectedLanguage(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#090d18] px-3 py-2 text-sm text-gray-300 outline-none focus:border-violet-500"
            >
              <option value="All">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="C">C</option>
            </select>

            <select
              value={selectedFileType}
              onChange={(event) => setSelectedFileType(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#090d18] px-3 py-2 text-sm text-gray-300 outline-none focus:border-violet-500"
            >
              <option value="All">All File Types</option>
              <option value="Components">Components</option>
              <option value="Pages">Pages</option>
              <option value="Stylesheets">Stylesheets</option>
              <option value="Configuration">Configuration</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Find the main component", "Where is routing handled?", "Find upload logic"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearch(suggestion)}
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:border-violet-400 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>

<div className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">


<section className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
  <div className="border-b border-white/10 p-5">
    <div className="flex items-center gap-2">
      <FolderOpen size={19} className="text-violet-400" />
      <h2 className="font-semibold">Repository explorer</h2>
    </div>
    <p className="mt-1 text-xs text-gray-500">
      Browse the project files
    </p>
  </div>

  <div className="p-4">
    <button
      onClick={() => setFolderOpen(!folderOpen)}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-200 hover:bg-white/5"
    >
      {folderOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <FolderOpen size={17} className="text-violet-400" />
      {repositoryName}
    </button>

    {folderOpen && (
  <div className="ml-5 mt-2 border-l border-white/10 pl-3">
    <FileTreeNode
      node={fileTree}
      isRoot
      onOpenFile={handleOpenFile}
      selectedPath={selectedResult?.path}
    />
  </div>
)}
</div>
</section>

<div className="min-w-0">
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-semibold">Relevant code</h2>
              <p className="mt-1 text-xs text-gray-500">
                {displayedResults.length} matching results
              </p>
            </div>

            <div className="p-3">
              {displayedResults.length > 0 ? (
                displayedResults.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleOpenFile(item)}
                    className={`mb-2 w-full rounded-xl border p-4 text-left transition ${
                      selectedResult?.path === item.path
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <FileCode2 size={17} className="text-violet-400" />
                      <span className="font-semibold">{item.title}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        Lines {item.lines}
                      </span>
                    </div>
                    <p className="mb-2 text-xs text-cyan-400">{item.path}</p>
                    <p className="text-sm leading-6 text-gray-400">
                      {item.description}
                    </p>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <SearchX className="mx-auto mb-3" size={28} />
                  No matching results found.
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="font-semibold">Code preview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedResult?.path || "Select a result"}
                </p>
              </div>
              <GitBranch size={19} className="text-violet-400" />
            </div>

            {selectedResult ? (
              <>
                
<div className="flex overflow-x-auto border-b border-white/10 bg-[#090d18]">
  {openTabs.map((tab) => (
    <div
      key={tab.path}
      className={`flex shrink-0 items-center gap-3 border-r border-white/10 px-4 py-3 ${
        selectedResult?.path === tab.path
          ? "border-t-2 border-t-violet-500 bg-[#111827] text-white"
          : "text-gray-400 hover:bg-white/5"
      }`}
    >
      <button
        onClick={() => handleOpenFile(tab)}
        className="text-sm"
      >
        {tab.path.split("/").pop()}
      </button>

      <button
        onClick={() => handleCloseTab(tab.path)}
        className="text-gray-500 hover:text-white"
        aria-label={`Close ${tab.path}`}
      >
        ×
      </button>
    </div>
  ))}
</div>

<div className="overflow-hidden">
    {fileLoading && (
  <p className="p-4 text-sm text-gray-400">
    Loading file contents...
  </p>
)}

{fileError && (
  <p className="p-4 text-sm text-red-400">
    {fileError}
  </p>
)}
  <Editor
    height="350px"
    language={getEditorLanguage(selectedResult.path)}
    theme="vs-dark"
    value={fileContent}
    onMount={(editor) => {
  editorRef.current = editor;
  editor.revealLineInCenter(targetLine);
  editor.setPosition({
    lineNumber: targetLine,
    column: 1,
  });
}}
    options={{
      readOnly: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
    }}
  />
</div>


                
<div className="border-t border-white/10 p-5">
  <div className="mb-4 flex items-center gap-2">
    <Sparkles size={19} className="text-violet-400" />
    <div>
      <h3 className="font-semibold">CodeAtlas AI Assistant</h3>
      <p className="text-xs text-gray-500">
        Ask questions about your codebase
      </p>
    </div>
    <span className="ml-auto rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
      Online
    </span>
  </div>

  <div className="mb-4 max-h-64 space-y-3 overflow-y-auto rounded-xl bg-[#090d18] p-3">
    {chatMessages.map((message, index) => (
      <div
        key={index}
        className={`flex ${
          message.role === "user"
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-6 ${
            message.role === "user"
              ? "bg-violet-600 text-white"
              : "border border-white/10 bg-[#1a2233] text-gray-300"
          }`}
        >
          {message.role === "assistant" && (
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-violet-400">
              <Sparkles size={13} />
              CodeAtlas AI
            </div>
          )}
          {message.content}
        </div>
      </div>
    ))}
  </div>

  <div className="flex gap-2">
    <input
      value={chatInput}
      onChange={(event) => setChatInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") handleSendMessage();
      }}
      placeholder="Ask something about your code..."
      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090d18] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
    />

    <button
  onClick={handleSendMessage}
  disabled={!chatInput.trim() || chatLoading}
  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
>
  {chatLoading ? "Thinking..." : "Send"}
</button>
  </div>

  {chatError && (
  <p className="mt-3 text-sm text-red-400">
    {chatError}
  </p>
)}

</div>

              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Select a code result to preview it.
              </div>
            )}
          </div>
        </section>
        </div>
      </div>
      </main>
    </div>
  );
}

export default Workspace;
