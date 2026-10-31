
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Code2,
  Upload,
  FolderOpen,
  Search,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import {
  uploadRepository,
  importGithubRepository,
} from "../services/api";

const processingSteps = [
  {
    title: "Uploading repository",
    description: "Preparing your repository files",
    icon: Upload,
  },
  {
    title: "Extracting files",
    description: "Organising folders and source files",
    icon: FolderOpen,
  },
  {
    title: "Analysing code",
    description: "Identifying functions and components",
    icon: Code2,
  },
  {
    title: "Building search index",
    description: "Preparing your code for intelligent search",
    icon: Search,
  },
];

function Processing() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
const [repoData, setRepoData] = useState(null);

  const repository = location.state;
  const hasValidRepository =
  repository?.source === "github"
    ? Boolean(repository.githubUrl?.trim())
    : repository?.source === "zip" &&
      repository.file instanceof File &&
      repository.file.name.toLowerCase().endsWith(".zip");

  useEffect(() => {
  if (!hasValidRepository) {
    navigate("/dashboard", { replace: true });
    return;
  }

  let cancelled = false;

  const processRepository = async () => {
    try {
      setCurrentStep(1);
      setError("");

      let data;

      if (repository.source === "zip") {
        data = await uploadRepository("/upload", repository.file);
      } else {
        data = await importGithubRepository(repository.githubUrl);
      }

      if (cancelled) return;

      setRepoData(data);
      setCurrentStep(4);
      setCompleted(true);
    } catch (err) {
      if (!cancelled) {
        setError(err.message || "Repository processing failed.");
      }
    }
  };

  processRepository();

  return () => {
    cancelled = true;
  };
}, [repository, hasValidRepository, navigate]);

  if (!repository) return null;

  const repositoryName =
    repository.source === "zip"
      ? repository.fileName
      : repository.githubUrl;

  return (
    <div className="min-h-screen bg-[#090d18] px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 flex items-center gap-2 text-xl font-bold">
          <Code2 size={28} className="text-violet-400" />
          CodeAtlas
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 md:p-10">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-violet-500/10 p-5">
              {completed ? (
                <CheckCircle2 size={38} className="text-green-400" />
              ) : (
                <Sparkles size={38} className="text-violet-400" />
              )}
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold">
            {completed
              ? "Repository ready!"
              : "Analysing your repository..."}
          </h1>

          <p className="mt-3 break-all text-center text-sm text-gray-400">
            {repositoryName}
          </p>
          {error && (
  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
    <h3 className="font-semibold text-red-400">
      Repository processing failed
    </h3>

    <p className="mt-2 text-sm text-red-300">
      {error}
    </p>

    <button
      onClick={() => navigate("/dashboard")}
      className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
    >
      Back to Dashboard
    </button>
  </div>
)}
{repoData && (
  <div className="mt-6 grid grid-cols-2 gap-3">
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-gray-400">Files analysed</p>
      <h3 className="mt-2 text-2xl font-bold text-violet-400">
        {repoData.file_count}
      </h3>
    </div>

    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-gray-400">Total lines</p>
      <h3 className="mt-2 text-2xl font-bold text-violet-400">
        {repoData.total_lines?.toLocaleString() ?? "—"}
      </h3>
    </div>

    <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-gray-400">Languages detected</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(repoData.languages || {}).map(
          ([language, count]) => (
            <span
              key={language}
              className="rounded-lg bg-violet-500/10 px-3 py-2 text-sm text-violet-300"
            >
              {language.toUpperCase()}: {count} files
            </span>
          )
        )}
      </div>
    </div>
  </div>
)}

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-700"
              style={{
                width: `${(currentStep / processingSteps.length) * 100}%`,
              }}
            />
          </div>

          <p className="mt-3 text-right text-sm text-violet-300">
            {Math.round(
              (currentStep / processingSteps.length) * 100
            )}%
          </p>

          <div className="mt-8 space-y-6">
            {processingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isDone = index < currentStep;
              const isActive = index === currentStep && !completed;

              return (
                <div key={step.title} className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/5 p-3">
                    {isDone ? (
                      <CheckCircle2 size={21} className="text-green-400" />
                    ) : isActive ? (
                      <LoaderCircle
                        size={21}
                        className="animate-spin text-violet-400"
                      />
                    ) : (
                      <StepIcon size={21} className="text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className={isDone ? "text-green-400" : "text-white"}>
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {isDone ? "Complete" : isActive ? "In progress" : "Waiting"}
                  </span>
                </div>
              );
            })}
          </div>

          {completed && (
  <button
    onClick={() =>
      navigate("/workspace", {
        state: {
          repoId: repoData.repo_id,
          repoData: repoData,
        },
      })
    }
    className="mt-10 w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500"
  >
    Explore your repository →
  </button>
)}

        </div>
      </div>
    </div>
  );
}

export default Processing;
