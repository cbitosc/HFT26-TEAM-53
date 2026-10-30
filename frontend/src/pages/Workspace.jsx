
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
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

function Workspace() {
    const location = useLocation();

const repoId = location.state?.repoId;
const repoData = location.state?.repoData;
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");

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
const [targetLine, setTargetLine] = useState(1);

const handleOpenFile = (item) => {
  setSelectedResult(item);
  setTargetLine(item.targetLine || 1);

  setOpenTabs((previousTabs) => {
    const alreadyOpen = previousTabs.some(
      (tab) => tab.path === item.path
    );

    if (alreadyOpen) return previousTabs;

    return [...previousTabs, item];
  });
};


const handleCloseTab = (path) => {
  const remainingTabs = openTabs.filter(
    (tab) => tab.path !== path
  );

  setOpenTabs(remainingTabs);

  if (selectedResult?.path === path) {
    setSelectedResult(
      remainingTabs.length > 0
        ? remainingTabs[remainingTabs.length - 1]
        : null
    );
  }
};
const handleSendMessage = () => {
  if (!chatInput.trim()) return;

  const userMessage = chatInput.trim();

  setChatMessages((previousMessages) => [
    ...previousMessages,
    {
      role: "user",
      content: userMessage,
    },
  ]);

  setChatInput("");

  const aiResponse = selectedResult
    ? `You're currently viewing ${selectedResult.path}. ${selectedResult.description} I'll be able to provide detailed, evidence-backed answers once the backend AI integration is connected.`
    : "Please select a code file first so I can provide context about your repository. The backend AI integration is coming soon.";

  setChatMessages((previousMessages) => [
    ...previousMessages,
    {
      role: "assistant",
      content: aiResponse,
    },
  ]);
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

  const filteredResults = sampleResults.filter((item) => {
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

  const language = languageMap[extension] || "Other";

  const matchesLanguage =
    selectedLanguage === "All" ||
    language === selectedLanguage;

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
            HFT26-TEAM-53
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                HFT26-TEAM-53
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
            <p className="text-3xl font-bold">128</p>
            <p className="mt-1 text-xs text-gray-500">Sample data</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Languages</span>
              <Languages className="text-cyan-400" size={20} />
            </div>
            <p className="text-3xl font-bold">4</p>
            <p className="mt-1 text-xs text-gray-500">Sample data</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Last indexed</span>
              <Clock3 className="text-pink-400" size={20} />
            </div>
            <p className="text-xl font-bold">Just now</p>
            <p className="mt-1 text-xs text-gray-500">Demo workspace</p>
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
              onClick={() => {
                if (!search.trim()) setSearch("dashboard");
              }}
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Search code
            </button>
                    </div>

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
      HFT26-TEAM-53
    </button>

    {folderOpen && (
      <div className="ml-5 mt-2 border-l border-white/10 pl-3">
        <div className="mb-1 flex items-center gap-2 px-2 py-2 text-sm text-gray-400">
          <FolderOpen size={16} className="text-yellow-400" />
          src
        </div>

        <div className="ml-4 border-l border-white/10 pl-2">
          <button
            onClick={() => setSrcOpen((previous) => !previous)}
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-400 hover:bg-white/5"
          >
            {srcOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={15} className="text-yellow-400" />
            pages
          </button>

          {srcOpen && (
            <div className="ml-4 border-l border-white/10 pl-2">
              {sampleResults.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleOpenFile(item)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedResult?.path === item.path
                      ? "bg-violet-500/15 text-violet-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <FileCode2 size={15} />
                  {item.path.split("/").pop()}
                </button>
              ))}
            </div>
          )}
        </div>
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
                {filteredResults.length} matching sample results
              </p>
            </div>

            <div className="p-3">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
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
                  No matching sample results.
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
  <Editor
    height="350px"
    language={getEditorLanguage(selectedResult.path)}
    theme="vs-dark"
    value={selectedResult.snippet}
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
      disabled={!chatInput.trim()}
      className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Send
    </button>
  </div>

  <p className="mt-3 text-xs text-yellow-500/80">
    Demo AI responses — backend integration coming soon.
  </p>
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
