'use client';

export default function CaptureBox() {
  return (
    <div className="w-full bg-surface rounded-xl p-4">
      <textarea
        className="w-full bg-transparent text-primary placeholder:text-muted resize-none outline-none min-h-[120px]"
        placeholder="Pegá cualquier cosa — link, importe, idea..."
      />
      <div className="flex justify-end mt-3">
        <button className="bg-accent text-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
          Clasificar
        </button>
      </div>
    </div>
  );
}
