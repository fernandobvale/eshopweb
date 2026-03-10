"use client";

interface Props {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    description,
    confirmLabel = "Excluir",
    cancelLabel = "Cancelar",
    isLoading = false,
    onConfirm,
    onCancel,
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-neutral-400 mt-2">{description}</p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-2.5 text-sm font-medium transition disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white py-2.5 text-sm font-medium transition disabled:opacity-50"
                    >
                        {isLoading ? "Excluindo..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
