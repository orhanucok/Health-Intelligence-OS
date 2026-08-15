export const HEALTH_FILE_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

export const MAX_HEALTH_FILE_BYTES = 25 * 1024 * 1024;

export type ImportedHealthDocument = {
  id: string;
  name: string;
  type: string;
  date: string;
  pages: number;
  facts: number;
  status: "Yerel arşivde";
  progress: number;
  size: number;
  sizeLabel: string;
  mimeType: string;
  fingerprint: string;
  importedAt: string;
};

export type HealthFileImportResult = {
  accepted: ImportedHealthDocument[];
  rejected: string[];
};

const supportedExtensions = new Set(["pdf", "png", "jpg", "jpeg"]);
const supportedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(name: string) {
  return name.split(".").pop()?.toLocaleLowerCase("tr-TR") ?? "";
}

function getDocumentType(file: File) {
  return file.type === "application/pdf" || getExtension(file.name) === "pdf"
    ? "PDF belgesi"
    : "Görüntü";
}

function createFingerprint(file: File) {
  return [file.name, file.size, file.lastModified, file.type || "unknown"].join(
    ":",
  );
}

export function importHealthFiles(files: File[]): HealthFileImportResult {
  const accepted: ImportedHealthDocument[] = [];
  const rejected: string[] = [];

  for (const file of files) {
    const extension = getExtension(file.name);
    const isSupported =
      supportedExtensions.has(extension) || supportedMimeTypes.has(file.type);

    if (!isSupported) {
      rejected.push(`${file.name}: yalnızca PDF, JPG ve PNG kabul edilir.`);
      continue;
    }

    if (file.size > MAX_HEALTH_FILE_BYTES) {
      rejected.push(`${file.name}: dosya boyutu 25 MB sınırını aşıyor.`);
      continue;
    }

    const importedAt = new Date().toISOString();
    const fingerprint = createFingerprint(file);
    accepted.push({
      id: `LOCAL-${fingerprint}`,
      name: file.name,
      type: getDocumentType(file),
      date: new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      pages: 1,
      facts: 0,
      status: "Yerel arşivde",
      progress: 100,
      size: file.size,
      sizeLabel: formatFileSize(file.size),
      mimeType: file.type || "application/octet-stream",
      fingerprint,
      importedAt,
    });
  }

  return { accepted, rejected };
}

export function readStoredHealthDocuments(): ImportedHealthDocument[] {
  try {
    const raw = window.localStorage.getItem("healthcouncil-imported-documents");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ImportedHealthDocument[]) : [];
  } catch {
    return [];
  }
}

export function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
