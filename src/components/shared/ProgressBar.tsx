type ProgressBarProps = {
  value: number;
};

export default function ProgressBar(props: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(props.value)));

  return (
    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-emerald-400 transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}