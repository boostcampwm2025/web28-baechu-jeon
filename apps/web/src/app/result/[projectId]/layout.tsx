import { getProjectStructure } from "@/api/project";
import { buildProjectTree, FileNode } from "@/utils/pathTree";
import LayoutClient from "@/components/result/LayoutClient";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ResultLayout({ children, params }: LayoutProps) {
  const { projectId } = await params;
  let treeData: FileNode[] = [];

  try {
    const data = await getProjectStructure(projectId);
    treeData = buildProjectTree({
      files: data.projectStructure.files,
      folders: data.projectStructure.folders,
    });
  } catch (error) {
    console.error("Failed to load project structure:", error);
  }

  return <LayoutClient treeData={treeData}>{children}</LayoutClient>;
}
