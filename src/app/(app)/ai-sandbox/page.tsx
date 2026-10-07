"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// We must lazy-load the Pyodide/Monaco editor and disable SSR
// because both libraries rely heavily on the browser 'window' object and WebAssembly.
const PyodideEditor = dynamic(() => import('@/components/ai-sandbox/PyodideEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm animate-pulse">
      <span className="text-gray-500 font-medium text-lg">Loading AI Sandbox Environment...</span>
    </div>
  ),
});

export default function AiSandboxPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Engineering Sandbox (Prototype)</h1>
        <p className="text-gray-600">
          This is a technical spike to verify that we can execute Python code directly in the browser 
          using Pyodide and Monaco Editor, capturing standard output and tracebacks without a backend.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Cases to Try</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <li><strong>Standard Output:</strong> Write <code>print("Hello World")</code> and click Run.</li>
          <li><strong>Syntax/Runtime Error:</strong> Write <code>print(1 / 0)</code> to verify standard traceback capture.</li>
          <li><strong>The Test Runner (Success):</strong> Write <code>user = &#123;"name": "Test"&#125;</code> and click Run. It will silently pass the hidden test.</li>
          <li><strong>The Test Runner (Failure Hint):</strong> Write <code>x = 5</code> and click Run. You will see a conversational hint because you failed to define the <code>user</code> dictionary.</li>
        </ul>
      </div>

      <PyodideEditor 
        testCode={`
assert 'user' in globals(), "You need to define a variable named 'user'."
assert isinstance(user, dict), "The variable 'user' should be a dictionary."
assert 'name' in user, "The dictionary must have a key called 'name'."
        `} 
      />
    </div>
  );
}
