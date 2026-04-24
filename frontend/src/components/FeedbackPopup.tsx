interface FeedbackPopupProps {
  kind: "erro" | "aviso" | "sucesso";
  message: string;
  onClose: () => void;
}

const STYLE_BY_KIND: Record<FeedbackPopupProps["kind"], string> = {
  erro: "border-red-300 bg-red-100 text-red-900",
  aviso: "border-amber-300 bg-amber-100 text-amber-900",
  sucesso: "border-emerald-300 bg-emerald-100 text-emerald-900"
};

export function FeedbackPopup({ kind, message, onClose }: FeedbackPopupProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(440px,calc(100vw-32px))]">
      <div className={`rounded-[12px] border px-3.5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.18)] ${STYLE_BY_KIND[kind]}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-[0.95rem] font-semibold">{message}</p>
          <button
            type="button"
            className="cursor-pointer rounded-[8px] border-0 bg-black/10 px-2 py-1 text-[0.75rem] font-bold transition-colors hover:bg-black/20"
            onClick={onClose}
            aria-label="Fechar mensagem"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
}
