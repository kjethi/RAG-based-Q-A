import { useRef, useState, useEffect } from "react";
import { documentService, type Document } from "../../services/document";
import { s3UploadService } from "../../services/s3Upload";
import { toast } from "react-toastify";

type DocumentType = "pdf" | "image" | "text" | "other";


// Helper function to map backend type to frontend type
function mapType(backendType: string): DocumentType {
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
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function badgeForType(type: string) {
  const map: Record<DocumentType, string> = {
    pdf: "danger",
    image: "info",
    text: "secondary",
    other: "light",
  };
  const mappedType = mapType(type);
  return (
    <span className={`badge text-bg-${map[mappedType]}`}>{mappedType.toUpperCase()}</span>
  );
}

function badgeForStatus(status: Document["status"]) {
  const map = {
    pending: "info",
    completed: "success",
    queued: "warning",
    processing: "warning",
    failed: "danger",
  } as const;
  return <span className={`badge text-bg-${map[status]}`}>{status}</span>;
}

function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>("all");
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      file: File;
      progress: number;
      status: "queued" | "uploading" | "completed" | "error" | "cancelled";
      error?: string;
      uploadId?: string;
      abortController?: AbortController;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    const selected = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "queued" as const,
      abortController: new AbortController(),
    }));

    setUploadingFiles(selected);

    // Upload each file concurrently
    const uploadPromises = selected.map(async (fileInfo, index) => {
      try {
        await uploadFile(fileInfo.file, index);
        // Update status to completed
        setUploadingFiles((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: "completed", progress: 100 } : item
          )
        );
      } catch (error) {
        console.error(`Failed to upload ${fileInfo.file.name}:`, error);
        // Update status to error
        setUploadingFiles((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : typeof error === "string"
                      ? error
                      : "Unknown error",
                }
              : item
          )
        );
        toast.error(`Failed to upload ${fileInfo.file.name}`);
      }
    });

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);

    // Remove completed and cancelled uploads after a delay
    setTimeout(() => {
      setUploadingFiles((prev) =>
        prev.filter(
          (item) => item.status !== "completed" && item.status !== "cancelled"
        )
      );
    }, 3000);

    // Refresh documents list
    fetchDocuments();
  }

  async function uploadFile(file: File, fileIndex: number) {
    try {
      console.log("Uploading file:", file);

      // Check if upload was cancelled
      const currentFileInfo = uploadingFiles[fileIndex];
      if (currentFileInfo?.status === "cancelled") {
        throw new Error("Upload was cancelled");
      }

      // Step 1: Initialize multipart upload
      const { uploadId } = await s3UploadService.initUpload(file.name);
      console.log("Upload initialized with ID:", uploadId);

      // Update upload ID in state
      setUploadingFiles((prev) =>
        prev.map((item, i) => (i === fileIndex ? { ...item, uploadId } : item))
      );

      // Step 2: Calculate file parts (5MB chunks for multipart upload)
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts: Array<{ ETag: string; PartNumber: number }> = [];

      toast.info(`Uploading ${file.name} (${totalParts} parts)...`);

      // Step 3: Upload file parts
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Get presigned URL for this part
        const { url } = await s3UploadService.getPresignedUrl(
          file.name,
          uploadId,
          partNumber
        );

        // Upload chunk to S3
        let uploadResponse: Response;
        try {
          uploadResponse = await fetch(url, {
            method: "PUT",
            body: chunk,
            signal: currentFileInfo?.abortController?.signal,
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
          });
        } catch (err) {
          if (err instanceof Error && err?.name === "AbortError") {
            throw new Error("Upload was cancelled");
          }
          throw err;
        }

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        const etag =
          uploadResponse.headers.get("ETag")?.replace(/"/g, "") || "";
        parts.push({ ETag: etag, PartNumber: partNumber });

        // Update progress
        const progress = Math.round((partNumber / totalParts) * 100);
        setUploadingFiles((prev) =>
          prev.map((item, i) =>
            i === fileIndex ? { ...item, progress, status: "uploading" } : item
          )
        );
        console.log(`Part ${partNumber}/${totalParts} uploaded (${progress}%)`);
      }

      // Step 4: Complete multipart upload
      const completeResult = await s3UploadService.completeUpload(
        file.name,
        uploadId,
        parts
      );

      console.log("Upload completed:", completeResult);

      // Step 5: Send to processing queue
      if (completeResult.documentId) {
        try {
          await s3UploadService.sendPendingDocumentToSqs(
            completeResult.documentId
          );
          console.log("Document sent to processing queue");
        } catch (error) {
          console.warn("Failed to send to processing queue:", error);
          // Don't fail the upload if queue sending fails
        }
      }

      toast.success(`${file.name} uploaded successfully!`);
      return completeResult;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        `Failed to upload ${file.name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  async function cancelUpload(fileIndex: number) {
    const fileInfo = uploadingFiles[fileIndex];

    try {
      // Abort the upload if it's in progress
      if (fileInfo.abortController) {
        fileInfo.abortController.abort();
      }

      // If upload was initialized, we should clean up on the backend
      if (fileInfo.uploadId && fileInfo.status === "uploading") {
        // TODO: Add backend endpoint to abort multipart upload
        // await s3UploadService.abortUpload(fileInfo.uploadId);
      }

      setUploadingFiles((prev) =>
        prev.map((item, i) =>
          i === fileIndex ? { ...item, status: "cancelled" } : item
        )
      );

      toast.info(`Upload cancelled for ${fileInfo.file.name}`);
    } catch (error) {
      console.error("Error cancelling upload:", error);
      toast.error("Failed to cancel upload");
    }
  }

  async function retryUpload(fileIndex: number) {
    const fileInfo = uploadingFiles[fileIndex];

    try {
      // Reset status and progress
      setUploadingFiles((prev) =>
        prev.map((item, i) =>
          i === fileIndex
            ? {
                ...item,
                status: "queued",
                progress: 0,
                error: undefined,
                abortController: new AbortController(),
              }
            : item
        )
      );

      // Retry the upload
      await uploadFile(fileInfo.file, fileIndex);
    } catch (error) {
      console.error("Error retrying upload:", error);
      toast.error("Failed to retry upload");
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentService.deleteDocument(id);
      toast.success("Document deleted successfully");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <h1 className="h4 mb-0">Documents</h1>
        <div className="ms-auto d-flex flex-wrap gap-2">
          <input
            type="search"
            className="form-control"
            placeholder="Search"
            style={{ maxWidth: 260 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 180 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="all">All types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="text">Text</option>
            <option value="other">Other</option>
          </select>
          <button className="btn btn-primary" onClick={openFilePicker}>
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h2 className="h6 mb-3">Uploads</h2>
            <div className="list-group list-group-flush">
              {uploadingFiles.map((fileInfo, idx) => (
                <div key={idx} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-medium">{fileInfo.file.name}</div>
                      <div className="text-secondary small">
                        {formatBytes(fileInfo.file.size)}
                      </div>
                    </div>
                    <div className="text-end">
                      <div
                        className={`badge text-bg-${
                          fileInfo.status === "completed"
                            ? "success"
                            : fileInfo.status === "error"
                            ? "danger"
                            : fileInfo.status === "cancelled"
                            ? "secondary"
                            : fileInfo.status === "uploading"
                            ? "warning"
                            : "secondary"
                        }`}
                      >
                        {fileInfo.status === "completed"
                          ? "Completed"
                          : fileInfo.status === "error"
                          ? "Error"
                          : fileInfo.status === "cancelled"
                          ? "Cancelled"
                          : fileInfo.status === "uploading"
                          ? "Uploading"
                          : "Queued"}
                      </div>
                      {fileInfo.status === "uploading" && (
                        <div className="text-secondary small mt-1">
                          {fileInfo.progress}%
                        </div>
                      )}
                      {fileInfo.status === "queued" && (
                        <button
                          className="btn btn-sm btn-outline-danger mt-1"
                          onClick={() => cancelUpload(idx)}
                        >
                          Cancel
                        </button>
                      )}
                      {fileInfo.status === "error" && (
                        <button
                          className="btn btn-sm btn-outline-warning mt-1"
                          onClick={() => retryUpload(idx)}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {fileInfo.status === "error" && fileInfo.error && (
                    <div className="text-danger small mt-2">
                      Error: {fileInfo.error}
                    </div>
                  )}

                  <div
                    className="progress mt-2"
                    role="progressbar"
                    aria-label="Upload progress"
                    aria-valuenow={fileInfo.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`progress-bar ${
                        fileInfo.status === "completed"
                          ? "bg-success"
                          : fileInfo.status === "error"
                          ? "bg-danger"
                          : fileInfo.status === "cancelled"
                          ? "bg-secondary"
                          : fileInfo.status === "uploading"
                          ? "bg-warning"
                          : "bg-secondary"
                      }`}
                      style={{
                        width: `${
                          fileInfo.status === "cancelled"
                            ? "0%"
                            : `${fileInfo.progress}%`
                        }`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover align-middle">
            <thead>
              <tr>
                <th style={{ width: 56 }}>#</th>
                <th>Name</th>
                <th style={{ width: 120 }}>Type</th>
                <th style={{ width: 140 }}>Size</th>
                <th style={{ width: 200 }}>Uploaded</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents?.map((d, idx) => (
                <tr key={d.id}>
                  <td>{idx + 1}</td>
                  <td className="text-truncate" style={{ maxWidth: 380 }}>
                    {d.filename}
                  </td>
                  <td>{badgeForType(mapType(d.type))}</td>
                  <td>{formatBytes(d.size)}</td>
                  <td className="text-secondary">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td>{badgeForStatus(d.status)}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-outline-light">View</button>
                      <button className="btn btn-outline-light">
                        Download
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteDocument(d.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-4">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <div className="text-secondary small">Showing {documents.length}</div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled">
              <span className="page-link">Prev</span>
            </li>
            <li className="page-item active">
              <span className="page-link">1</span>
            </li>
            <li className="page-item">
              <span className="page-link">2</span>
            </li>
            <li className="page-item">
              <span className="page-link">Next</span>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Documents;
