type CommonModalProps = {
  show: boolean;
  title: string;
  applicantName: string;
  applicationReason: string;
  action: "承認" | "拒否" | null;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CommonModal({
  show,
  title,
  applicantName,
  applicationReason,
  action,
  rejectReason,
  onRejectReasonChange,
  onClose,
  onConfirm,
}: CommonModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="text-xs font-medium text-slate-400">申請者</p>
            <p className="mt-1 text-sm text-slate-900">{applicantName}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">申請理由</p>
            <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm text-slate-700">
              {applicationReason || "-"}
            </p>
          </div>

          {action === "拒否" && (
            <div>
              <label className="text-xs font-medium text-slate-500">拒否理由</label>
              <textarea
                value={rejectReason}
                onChange={(event) => onRejectReasonChange(event.target.value)}
                rows={4}
                placeholder="拒否理由を入力してください。"
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              action === "拒否"
                ? "rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
            }
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
}
