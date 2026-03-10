import Image from "next/image";
import { User, Twitter, Globe, Mail } from "lucide-react";

interface AuthorCardProps {
    author: {
        full_name: string | null;
        avatar_url: string | null;
        bio: string | null;
        twitter_handle: string | null;
        website: string | null;
        email: string | null;
    } | null;
}

export default function AuthorCard({ author }: AuthorCardProps) {
    if (!author) return null;

    return (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 shadow-sm overflow-hidden relative group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-500" />

            <div className="relative flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-brand-500/10 p-1 bg-white dark:bg-neutral-900 shadow-xl">
                    {author.avatar_url ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image
                                src={author.avatar_url}
                                alt={author.full_name || "Autor"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                            <User size={40} />
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">
                    {author.full_name || "Autor do Blog"}
                </h3>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed line-clamp-4">
                    {author.bio || "Escritor e entusiasta de tecnologia, compartilhando insights sobre o mundo digital."}
                </p>

                <div className="flex items-center justify-center gap-3">
                    {author.twitter_handle && (
                        <a
                            href={`https://twitter.com/${author.twitter_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 hover:border-brand-500/30 transition-all"
                        >
                            <Twitter size={18} />
                        </a>
                    )}
                    {author.website && (
                        <a
                            href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 hover:border-brand-500/30 transition-all"
                        >
                            <Globe size={18} />
                        </a>
                    )}
                    {author.email && (
                        <a
                            href={`mailto:${author.email}`}
                            className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 hover:border-brand-500/30 transition-all"
                        >
                            <Mail size={18} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
