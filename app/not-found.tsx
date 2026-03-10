import Link from "next/link";

export default function NotFoundPage() {
    return (
        <main className="min-h-[70vh] px-6 py-20">
            <div className="mx-auto max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 p-10 sm:p-14">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_40%)]" />
                    <div className="relative space-y-6">
                        <p className="inline-flex rounded-full border border-neutral-700 bg-neutral-900/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
                            Erro 404
                        </p>

                        <h1 className="text-balance text-4xl font-black tracking-tight text-white sm:text-5xl">
                            Esta página não foi encontrada
                        </h1>

                        <p className="max-w-2xl text-base text-neutral-300 sm:text-lg">
                            O link pode estar desatualizado, ter sido removido ou digitado incorretamente. Use os atalhos abaixo para continuar navegando.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link
                                href="/"
                                className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                            >
                                Ir para Home
                            </Link>
                            <Link
                                href="/arquivo"
                                className="inline-flex items-center rounded-xl border border-neutral-600 bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
                            >
                                Ver Arquivo de Artigos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
