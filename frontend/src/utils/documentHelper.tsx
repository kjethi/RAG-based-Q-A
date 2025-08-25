import type { Doc } from "../classes/Doc";

// Helper function to map backend type to frontend type
export const mapType = (backendType: string): string => {
  if (backendType.toLowerCase().includes("pdf")) return "pdf";
  if (
    backendType.toLowerCase().includes("image") ||
    backendType.toLowerCase().includes("png") ||
    backendType.toLowerCase().includes("jpg")
  )
    return "image";
  if (
    backendType.toLowerCase().includes("text") ||
    backendType.toLowerCase().includes("txt")
  )
    return "text";
  return "other";
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const badgeForType = (type: string) => {
  const map: Record<string, string> = {
    pdf: "danger",
    image: "info",
    text: "secondary",
    other: "light",
  };
  const mappedType = mapType(type);
  return (
    <span className={`badge text-bg-${map[mappedType]}`}>
      {mappedType.toUpperCase()}
    </span>
  );
};

export const badgeForStatus = (status: Doc["status"]) => {
  const map = {
    pending: "info",
    completed: "success",
    queued: "warning",
    processing: "warning",
    failed: "danger",
  } as const;
  return <span className={`badge text-bg-${map[status]}`}>{status}</span>;
};
