import { describe, expect, it } from "vitest";
import { takePdfFiles } from "./selectFiles.ts";

function fakeFile(name: string): File {
  return new File(["x"], name, { type: "application/pdf" });
}

describe("takePdfFiles", () => {
  it("keeps up to the max and reports the rest", () => {
    const files = Array.from({ length: 12 }, (_, index) => fakeFile(`${index}.pdf`));
    const selected = takePdfFiles(files, 10);
    expect(selected.files).toHaveLength(10);
    expect(selected.ignoredCount).toBe(2);
    expect(selected.files[0]?.name).toBe("0.pdf");
    expect(selected.files[9]?.name).toBe("9.pdf");
  });

  it("handles an empty list", () => {
    expect(takePdfFiles(null)).toEqual({ files: [], ignoredCount: 0 });
  });
});
