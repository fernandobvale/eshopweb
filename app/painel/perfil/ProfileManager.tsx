"use client";

import { useState, useEffect } from "react";
import { User, Mail, Globe, Twitter, BookOpen, Save, Plus, Trash2, Camera, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
    id: string;
    full_name: string | null;
    email: string;
    bio: string | null;
    website: string | null;
    twitter_handle: string | null;
    avatar_url: string | null;
    role: string;
}

export default function ProfileManager({ initialProfiles, mainAuthorId, currentUserId }: { initialProfiles: Profile[], mainAuthorId: string | null, currentUserId: string }) {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
        if (initialProfiles.some((p) => p.id === currentUserId)) return currentUserId;
        return initialProfiles[0]?.id || "";
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [mainAuthor, setMainAuthor] = useState<string | null>(mainAuthorId);
    const router = useRouter();

    const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

    useEffect(() => {
        if (!profiles.length) {
            setSelectedProfileId("");
            return;
        }
        if (!profiles.some((p) => p.id === selectedProfileId)) {
            setSelectedProfileId(profiles[0].id);
        }
    }, [profiles, selectedProfileId]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProfile) return;

        setIsUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt_text", `Avatar de ${selectedProfile.full_name || selectedProfile.email}`);

        try {
            const res = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Erro ao fazer upload da imagem");

            const newAvatarUrl = result.data.url;
            updateField("avatar_url", newAvatarUrl);
            setMessage({ text: "Imagem enviada com sucesso! Não esqueça de salvar as alterações.", type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (profile: Profile) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/profiles/${profile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setProfiles(prev => prev.map(p => p.id === profile.id ? data : p));

            // If this is the main author, save that too
            if (mainAuthor === profile.id) {
                await fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ main_author_id: profile.id })
                });
            }

            setMessage({ text: "Perfil salvo com sucesso!", type: 'success' });
            router.refresh();
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = async () => {
        const email = prompt("Digite o e-mail do novo perfil:");
        if (!email) return;

        try {
            const res = await fetch('/api/admin/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, full_name: "Novo Autor", role: 'author' })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setProfiles(prev => [...prev, data]);
            setSelectedProfileId(data.id);
            setMessage({ text: "Perfil criado com sucesso!", type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (id === currentUserId) {
            alert("Você não pode excluir seu próprio perfil.");
            return;
        }
        if (!confirm("Tem certeza que deseja excluir este perfil?")) return;

        try {
            const res = await fetch(`/api/admin/profiles/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setProfiles(prev => {
                const filtered = prev.filter(p => p.id !== id);
                if (!filtered.length) {
                    setSelectedProfileId("");
                } else if (selectedProfileId === id) {
                    setSelectedProfileId(filtered[0].id);
                }
                return filtered;
            });
            setMessage({ text: "Perfil excluído com sucesso!", type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        }
    };

    const updateField = (field: keyof Profile, value: string) => {
        if (!selectedProfile) return;
        setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? { ...p, [field]: value } : p));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Profile List */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Autores</h2>
                    <button
                        onClick={handleCreate}
                        className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                        title="Cadastrar Novo Perfil"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {profiles.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedProfileId(p.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${selectedProfileId === p.id
                                ? 'bg-neutral-900 border-brand-500/50 ring-1 ring-brand-500/20'
                                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                                }`}
                        >
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                                {p.avatar_url ? (
                                    <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-sm font-bold text-neutral-500">
                                        {(p.full_name || p.email).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{p.full_name || 'Sem nome'}</p>
                                <p className="text-xs text-neutral-500 truncate">{p.email}</p>
                            </div>
                            {mainAuthor === p.id && (
                                <div className="text-brand-500" title="Autor Principal">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Profile Editor */}
            <div className="lg:col-span-2">
                {selectedProfile && (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                        <div className="p-6 border-b border-neutral-800 bg-neutral-900/30 flex items-center justify-between">
                            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-semibold text-white">Editar Perfil</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                {selectedProfile.id !== currentUserId && (
                                    <button
                                        onClick={() => handleDelete(selectedProfile.id)}
                                        className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleSave(selectedProfile)}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-3xl overflow-hidden border-2 border-neutral-800 bg-neutral-900 flex items-center justify-center relative">
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {selectedProfile.avatar_url ? (
                                            <img src={selectedProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <BookOpen size={48} className="text-neutral-700" />
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white shadow-xl cursor-pointer hover:bg-neutral-700 transition-colors">
                                        <Camera size={16} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Nome Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={selectedProfile.full_name || ''}
                                                    onChange={e => updateField('full_name', e.target.value)}
                                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none"
                                                    placeholder="Nome do autor"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">E-mail</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type="email"
                                                    value={selectedProfile.email || ''}
                                                    onChange={e => updateField('email', e.target.value)}
                                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Website</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={selectedProfile.website || ''}
                                                    onChange={e => updateField('website', e.target.value)}
                                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none"
                                                    placeholder="https://exemplo.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Twitter</label>
                                            <div className="relative">
                                                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={selectedProfile.twitter_handle || ''}
                                                    onChange={e => updateField('twitter_handle', e.target.value)}
                                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none"
                                                    placeholder="@usuario"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">URL da Foto de Perfil</label>
                                        <input
                                            type="text"
                                            value={selectedProfile.avatar_url || ''}
                                            onChange={e => updateField('avatar_url', e.target.value)}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 px-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none"
                                            placeholder="https://exemplo.com/foto.jpg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Biografia</label>
                                        <textarea
                                            value={selectedProfile.bio || ''}
                                            onChange={e => updateField('bio', e.target.value)}
                                            rows={4}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all outline-none resize-none"
                                            placeholder="Escreva um breve resumo sobre o autor..."
                                        />
                                    </div>

                                    <div className="pt-4 flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isMainAuthor"
                                            checked={mainAuthor === selectedProfile.id}
                                            onChange={(e) => setMainAuthor(e.target.checked ? selectedProfile.id : null)}
                                            className="h-5 w-5 rounded border-neutral-800 bg-neutral-900 text-brand-600 focus:ring-offset-0 focus:ring-brand-500"
                                        />
                                        <label htmlFor="isMainAuthor" className="text-sm text-neutral-300 cursor-pointer">Definir como Autor Principal do Blog</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
