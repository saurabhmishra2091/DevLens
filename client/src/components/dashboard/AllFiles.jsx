import { useState } from "react";

function AllFiles({ files }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = files.filter((file) => {
    const search = searchTerm.toLowerCase();
    return (
      (file.name || "").toLowerCase().includes(search) ||
      (file.path || "").toLowerCase().includes(search) ||
      (file.type || "").toLowerCase().includes(search) ||
      (file.importance || "").toLowerCase().includes(search)
    );
  });

  return (
    <section className="files-card">
      <h2>Files</h2>

      <input
        type="text"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search files, routes, controllers..."
      />

      {files.length === 0 ? (
        <p>No files scanned yet.</p>
      ) : filteredFiles.length === 0 ? (
        <p>No matching files found.</p>
      ) : (
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index}>
              <div className="file-row">
                <div>
                  <span>{file.name}</span>
                  <small>{file.path}</small>
                </div>

                <div className="file-tags">
                  <strong>{file.type}</strong>

                  {file.importance !== "Normal file" && (
                    <strong className="important-tag">
                      {file.importance}
                    </strong>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AllFiles;
