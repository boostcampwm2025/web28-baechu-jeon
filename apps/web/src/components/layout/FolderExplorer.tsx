export default function FolderExplorer() {
  const menus = [
    { name: "AI 분석" },
    { name: "JSON 결과" },
    { name: "시각화" },
  ];

  return (
    <section className="flex flex-col gap-2 p-4">
      <p className="mb-4 text-sm font-semibold text-gray-400">메뉴</p>
      {menus.map((menu, index) => (
        <div key={index}>{menu.name}</div>
      ))}
    </section>
  );
}
