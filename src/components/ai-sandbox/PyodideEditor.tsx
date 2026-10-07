"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

// Add global declaration for Pyodide
declare global {
  interface Window {
    loadPyodide: any;
  }
}

interface PyodideEditorProps {
  initialCode?: string;
  testCode?: string;
  value?: string;
  onChange?: (code: string) => void;
  onPass?: () => void;
}

export default function PyodideEditor({
  initialCode = 'print("Hello World!")\n',
  testCode,
  value,
  onChange,
  onPass,
}: PyodideEditorProps) {
  const [internalCode, setInternalCode] = useState<string>(initialCode);
  const code = value !== undefined ? value : internalCode;

  const handleCodeChange = (newCode: string) => {
    if (value === undefined) {
      setInternalCode(newCode);
    }
    onChange?.(newCode);
  };

  const [output, setOutput] = useState<string>("");
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [hintMessage, setHintMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    setOutput("");
    setTestStatus("idle");
    setHintMessage("");
  }, [initialCode, testCode]);

  useEffect(() => {
    async function initPyodide() {
      try {
        if (!window.loadPyodide) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
          script.async = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN"));
            document.body.appendChild(script);
          });
        }

        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
        });
        pyodideRef.current = pyodide;
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error loading Pyodide:", error);
        setOutput("Failed to load Pyodide engine: " + (error.message || String(error)));
        setIsLoading(false);
      }
    }
    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideRef.current) return;
    setIsExecuting(true);
    setTestStatus("running");
    setOutput("");
    setHintMessage("");

    try {
      const pyodide = pyodideRef.current;

      pyodide.globals.set("user_code_str", code);
      pyodide.globals.set("test_code_str", testCode || "");

      const pythonWrapper = `
import sys, io, traceback
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

run_globals = {"__builtins__": __builtins__}

try:
    exec(user_code_str, run_globals)
except Exception:
    tb_lines = traceback.format_exception(*sys.exc_info())
    clean_tb = [line for line in tb_lines if 'File "<exec>"' not in line]
    print("".join(clean_tb).strip(), file=sys.stderr)
else:
    if test_code_str:
        try:
            exec(test_code_str, run_globals)
            print("__TEST_PASS__", file=sys.stderr)
        except AssertionError as e:
            print(f"__TEST_FAIL__: {e}", file=sys.stderr)
        except Exception:
            print("Test Runner Error: " + traceback.format_exc(), file=sys.stderr)
`;

      await pyodide.runPythonAsync(pythonWrapper);

      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const stderr = pyodide.runPython("sys.stderr.getvalue()");

      if (stderr.includes("__TEST_FAIL__: ")) {
        const hint = stderr.split("__TEST_FAIL__: ")[1].trim();
        setTestStatus("failed");
        setHintMessage(hint);
        setOutput(stdout.trim());
      } else if (stderr.includes("__TEST_PASS__")) {
        setTestStatus("passed");
        setOutput(stdout.trim() || "(Executed successfully with no print output)");
        onPass?.();
      } else {
        setTestStatus(stderr.trim() ? "failed" : "idle");
        setOutput((stdout + stderr).trim());
      }
    } catch (error: any) {
      setTestStatus("failed");
      setOutput((prev) => (prev ? prev + "\n" : "") + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#09090b] text-zinc-100 font-sans border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header Bar */}
      <div className="flex justify-between items-center bg-[#121215] px-4 py-2.5 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-mono font-medium text-zinc-300">main.py</span>
          <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-2 py-0.5 rounded font-mono">
            Python 3.12
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {testStatus === "passed" && (
            <span className="text-xs font-mono font-medium text-[#f4c430] bg-[#f4c430]/10 border border-[#f4c430]/30 px-2.5 py-1 rounded flex items-center gap-1.5 animate-in fade-in">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f4c430]"></span>
              Tests Passed
            </span>
          )}
          {testStatus === "failed" && (
            <span className="text-xs font-mono font-medium text-red-400 bg-red-950/40 border border-red-800/50 px-2.5 py-1 rounded flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400"></span>
              Test Failed
            </span>
          )}

          <button
            onClick={runCode}
            disabled={isLoading || isExecuting}
            className="px-4 py-1.5 bg-[#f4c430] hover:brightness-110 text-[#09090b] text-xs font-mono font-bold rounded disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            {isLoading ? (
              "Loading..."
            ) : isExecuting ? (
              "Running..."
            ) : (
              <>
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Run & Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-grow relative min-h-[300px] bg-[#09090b]">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => handleCodeChange(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 12 },
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        />
      </div>

      {/* Console Drawer */}
      <div className="flex flex-col h-[200px] bg-[#09090b] border-t border-white/10">
        <div className="bg-[#121215] px-4 py-1.5 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span className="tracking-widest uppercase text-[10px] font-semibold text-zinc-500">Output</span>
          {hintMessage && (
            <span className="text-[#f4c430] font-medium text-xs font-mono flex items-center gap-1">
              Hint Available
            </span>
          )}
        </div>

        <div className="p-3.5 flex-grow overflow-y-auto font-mono text-xs leading-relaxed space-y-2">
          {hintMessage && (
            <div className="bg-[#f4c430]/10 border border-[#f4c430]/30 text-zinc-200 p-2.5 rounded mb-2">
              <strong className="text-[#f4c430] block mb-0.5">Hint:</strong>
              {hintMessage}
            </div>
          )}

          {output ? (
            <pre className="text-zinc-200 whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-zinc-600 italic">No output yet. Click &quot;Run & Test&quot; above to execute.</span>
          )}
        </div>
      </div>
    </div>
  );
}
