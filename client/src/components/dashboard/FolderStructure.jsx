function FolderStructure({ folders }) {
  return (
    <section className="folders-card">
      <h2>Folder Structure</h2>

      {folders.length === 0 ? (
        <p>No folders found yet.</p>
      ) : (
        <ul>
          {folders.map((folder, index) => (
            <li key={index}>
              <code>{folder}/</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FolderStructure;
