import { useId, useState } from "react";
import { site } from "../config/site.ts";
import { takePdfFiles } from "../files/selectFiles.ts";

type DropZoneProps = {
  disabled?: boolean;
  onFiles: (files: File[], ignoredCount: number) => void;
};

export function DropZone({ disabled = false, onFiles }: DropZoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  function takeFiles(fileList: FileList | null): void {
    const selected = takePdfFiles(fileList);
    if (selected.files.length > 0) onFiles(selected.files, selected.ignoredCount);
  }

  return (
    <label
      htmlFor={inputId}
      className={`dropzone${dragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) takeFiles(event.dataTransfer.files);
      }}
    >
      <input
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        disabled={disabled}
        onChange={(event) => {
          takeFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <span className="dropzone-icon" aria-hidden="true">
        ↑
      </span>
      <strong>PDFをここにドロップ</strong>
      <span>またはタップしてファイルを選択</span>
      <span className="dropzone-limit">最大{site.maxPdfFiles}ファイルまで、一度にチェックできます</span>
    </label>
  );
}
