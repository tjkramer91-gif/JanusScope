"use client";

import { useRef, useState } from "react";

export function PackageUploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const syncFiles = (files: FileList | null) => {
    setFileNames(files ? Array.from(files).map((file) => file.name) : []);
  };

  return (
    <div
      className={`rounded-[24px] border border-dashed p-8 transition ${
        isDragging ? "border-steel bg-[#eef5ff]" : "border-line bg-paper"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (inputRef.current) {
          inputRef.current.files = event.dataTransfer.files;
          syncFiles(event.dataTransfer.files);
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="section-title">Upload everything you want reviewed</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Put the package in one place. JanusScope will classify files after upload and route the review around the highest-risk documents first.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase text-moss">
            PDF, DOCX, XLSX, CSV, PNG, and JPG supported
          </p>
        </div>
        <label className="button-primary cursor-pointer" htmlFor="package-files">
          Choose Files
        </label>
      </div>
      <input
        ref={inputRef}
        id="package-files"
        className="sr-only"
        type="file"
        name="files"
        accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
        multiple
        onChange={(event) => syncFiles(event.currentTarget.files)}
      />
      <div className="mt-6 rounded-[18px] border border-line/60 bg-white p-5">
        {fileNames.length === 0 ? (
          <p className="text-sm font-semibold text-moss">Drag files here or choose files from your computer.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">{fileNames.length} file{fileNames.length === 1 ? "" : "s"} ready to upload</p>
            <ul className="grid gap-2 text-sm text-moss sm:grid-cols-2">
              {fileNames.map((name) => (
                <li className="truncate rounded-full border border-line/60 bg-paper px-4 py-2" key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["1", "Intake", "Upload the full package"],
          ["2", "Classify", "Detect contracts, bids, budgets, RFIs, and reports"],
          ["3", "Review", "Prioritize risk, missing scope, and conflicts"],
          ["4", "Export", "Create a report and issue log"],
        ].map(([number, title, body]) => (
          <div className="rounded-[18px] border border-line/60 bg-white p-4" key={title}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf3ff] text-xs font-semibold text-steel">
              {number}
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 text-xs leading-5 text-moss">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
