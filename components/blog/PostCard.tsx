import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/supabase";

interface Props {
    post: Post;
}

export default function PostCard({ post }: Props) {
    return (
        <Link
            href={`/${post.slug}`}
            aria-label={`Ler artigo: ${post.title}`}
            className="group block h-full"
        >
            <article className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                {/* Cover Image */}
                {post.cover_image_url ? (
                    <div className="aspect-[16/9] overflow-hidden relative">
                        <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ) : (
                    <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <span className="text-neutral-300 dark:text-neutral-700 font-bold text-2xl">SEO</span>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-500 mb-3">
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'Draft'}</span>
                        <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                        <span>{post.reading_time_minutes || 5} min leitura</span>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight mb-3 line-clamp-2 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-500">
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-6">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                            Ler mais
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
