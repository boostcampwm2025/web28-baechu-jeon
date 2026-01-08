export default function Toast({
  message,
  show,
}: {
  message: string;
  show: boolean;
}) {
  return (
    <div
      className={`fixed top-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0"
      }`}
    >
      <div className="rounded-lg bg-slate-800 px-6 py-3 text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
