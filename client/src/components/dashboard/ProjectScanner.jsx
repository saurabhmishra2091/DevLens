function ProjectScanner({
  projectFile,
  loading,
  message,
  hasFiles,
  onFileChange,
  onScan,
  onDownload,
}) {
  return (
    <section className="scanner-card">
      <h2>Scan Project</h2>

      <label>Upload Project ZIP</label>

      <input
        type="file"
        accept=".zip"
        onChange={onFileChange}
      />

      {projectFile && (
        <p className="selected-file">
          Selected project: {projectFile.name}
        </p>
      )}

      <button onClick={onScan} disabled={loading || !projectFile}>
        {loading ? "Uploading and Scanning..." : "Scan Project"}
      </button>

      {message && <p className="message">{message}</p>}

      <button
        className="download-button"
        onClick={onDownload}
        disabled={!hasFiles}
      >
        Download Project Report (.md)
      </button>
    </section>
  );
}

export default ProjectScanner;
