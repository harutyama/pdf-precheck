import { useId, useRef, useState } from "react";

type DropZoneProps = {
  disabled?: boolean;
  onFile: (file: File) => void;
};

export function DropZone({ disabled = false, onFile }: DropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function takeFile(fileList: FileList | null): void {
    const file = fileList?.[0];
    if (file) onFile(file);
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
        if (!disabled) takeFile(event.dataTransfer.files);
      }}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        disabled={disabled}
        onChange={(event) => {
          takeFile(event.target.files);
          event.target.value = "";
        }}
      />
      <span className="dropzone-icon" aria-hidden="true">
        ↑
      </span>
      <strong>PDFをここにドロップ</strong>
      <span>またはタップしてファイルを選択</span>
    </label>
  );
}
