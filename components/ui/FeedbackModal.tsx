"use client";

import clsx from "clsx";

export default function FeedbackModal({
    isOpen,
    title,
    message,
    type = "success",
    onClose,
}: {
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl p-6">
                <h3
                    className={clsx(
                        "text-lg font-bold",
                        type === "success" ? "text-emerald-400" : "text-red-400"
                    )}
                >
                    {title}
                </h3>
                <p className="text-sm text-neutral-300 mt-3">{message}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white py-2.5 text-sm font-semibold transition"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
