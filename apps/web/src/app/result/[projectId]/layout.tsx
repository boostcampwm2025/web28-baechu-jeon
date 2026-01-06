import FolderExplorer from "../../../components/layout/FolderExplorer";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <div className="flex h-full w-full">
      <aside className="h-full w-64 overflow-y-auto border-r bg-gray-50">
        <FolderExplorer />
      </aside>
      <section className="flex-1 overflow-y-auto">{children}</section>{" "}
    </div>
  );
}
