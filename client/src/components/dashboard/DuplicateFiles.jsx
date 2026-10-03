function DuplicateFiles({ duplicateGroups }) {
  return (
    <section className="duplicates-card">
      <h2>Duplicate File Detector</h2>

      {duplicateGroups.length === 0 ? (
        <p>No possible duplicate files detected.</p>
      ) : (
        <ul>
          {duplicateGroups.map((group, groupIndex) => (
            <li key={groupIndex}>
              <span>Possible duplicate group {groupIndex + 1}</span>

              <div className="duplicate-list">
                {group.map((file, fileIndex) => (
                  <code key={fileIndex}>{file.path}</code>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DuplicateFiles;
