
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FolderGit2,
  FileArchive,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Link2,
  Code2,
} from "lucide-react";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("zip");
  const [selectedFile, setSelectedFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setMessage("Please select a ZIP file.");
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const handleContinue = () => {
    if (activeTab === "zip" && !selectedFile) {
      setMessage("Please select a repository ZIP file first.");
      return;
    }

    if (activeTab === "github" && !githubUrl.trim()) {
      setMessage("Please enter a GitHub repository URL.");
      return;
    }

    setMessage(
      "Your repository details are ready. Backend integration is our next step!"
    );
  };

  return (
    <div className="min-h-screen bg-[#090d18] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Code2 className="text-violet-400" size={27} />
          CodeAtlas
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles size={16} />
            Your AI-powered code explorer
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Let's explore your{" "}
            <span className="text-violet-400">codebase.</span>
          </h1>

          <p className="mx-auto max-w-xl text-gray-400">
            Upload a repository or connect GitHub to understand your project,
            discover files and find the code you need.
          </p>
        </div>

        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl md:p-9">
          <div className="mb-8 flex gap-3 rounded-xl bg-[#090d18] p-2">
            <button
              onClick={() => {
                setActiveTab("zip");
                setMessage("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                activeTab === "zip"
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Upload size={17} />
              Upload ZIP
            </button>

            <button
              onClick={() => {
                setActiveTab("github");
                setMessage("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                activeTab === "github"
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Link2 size={17} />
              GitHub URL
            </button>
          </div>

          {activeTab === "zip" ? (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFile(event.dataTransfer.files[0]);
                }}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-violet-500/30 bg-violet-500/5 px-5 py-14 text-center transition hover:border-violet-400 hover:bg-violet-500/10"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15">
                  <Upload size={30} className="text-violet-400" />
                </div>

                <h2 className="mb-2 text-lg font-semibold">
                  Drop your repository ZIP here
                </h2>

                <p className="mb-4 text-sm text-gray-400">
                  Or click to browse files
                </p>

                <span className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium">
                  Choose ZIP file
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files[0])}
                />
              </div>

              {selectedFile && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#090d18] p-4">
                  <div className="flex items-center gap-3">
                    <FileArchive className="text-violet-400" size={25} />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-400"
                    aria-label="Remove selected file"
                  >
                    <X size={19} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10">
              <div className="mb-5 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15">
                  <FolderGit2 size={30} className="text-violet-400" />
                </div>
                <h2 className="mb-2 text-lg font-semibold">
                  Connect a GitHub repository
                </h2>
                <p className="text-sm text-gray-400">
                  Paste the URL of a public repository.
                </p>
              </div>

              <input
                type="url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full rounded-xl border border-white/10 bg-[#090d18] px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
              />
            </div>
          )}

          {message && (
            <p className="mt-5 rounded-lg bg-violet-500/10 p-3 text-sm text-violet-300">
              {message}
            </p>
          )}

          <button
            onClick={handleContinue}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 font-semibold transition hover:bg-violet-500"
          >
            Continue to CodeAtlas
            <ArrowRight size={18} />
          </button>

          <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} />
              Secure repository handling
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} />
              Built for developers
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Your codebase, understood in a whole new way.
        </p>
      </main>
    </div>
  );
}

export default Dashboard;