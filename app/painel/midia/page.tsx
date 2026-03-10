"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Search, X, ImageIcon, FileIcon, Copy, Loader2, Check } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MediaFile {
    id: string;
    filename: string;
    url: string;
    mime_type: string;
    size_bytes: number;
    alt_text?: string;
    created_at: string;
}

export default function MediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    async function fetchMedia() {
        try {
            const res = await fetch("/api/admin/media");
            const data = await res.json();
            if (data.data) {
                setFiles(data.data);
            }
        } catch (err) {
            console.error("Erro ao carregar mídia:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setFiles([data.data, ...files]);
            } else {
                alert(data.error || "Erro ao fazer upload. Verifique se o bucket 'media' foi criado no Supabase.");
            }
        } catch (err) {
            alert("Erro ao conectar com o servidor.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const askDelete = (file: MediaFile, e: React.MouseEvent) => {
        e.stopPropagation();
        setFileToDelete(file);
    };

    const handleDelete = async () => {
        if (!fileToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/media/${fileToDelete.id}`, { method: "DELETE" });
            if (res.ok) {
                setFiles(files.filter((f) => f.id !== fileToDelete.id));
                if (selectedFile?.id === fileToDelete.id) setSelectedFile(null);
                setFileToDelete(null);
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir arquivo");
            }
        } catch (err) {
            alert("Erro ao excluir arquivo");
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredFiles = files.filter((f) =>
        f.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Biblioteca de Mídia</h1>
                    <p className="text-neutral-400 text-sm mt-1">Gerencie imagens e arquivos para seus posts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all gap-2 shadow-lg disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5" />
                        )}
                        {isUploading ? "Enviando..." : "Fazer Upload"}
                    </button>
                </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Buscar arquivos por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white py-2 pl-9 pr-4 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-neutral-600"
                        />
                    </div>
                    <div className="text-xs text-neutral-500">
                        {filteredFiles.length} de {files.length} arquivos
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="aspect-square bg-neutral-900 rounded-lg animate-pulse border border-neutral-800"></div>
                            ))}
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>Nenhum arquivo encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => setSelectedFile(file)}
                                    className={`relative aspect-square group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedFile?.id === file.id ? "border-brand-500 shadow-[0_0_15px_rgba(var(--brand-500-rgb),0.3)]" : "border-neutral-800 hover:border-neutral-700"
                                        }`}
                                >
                                    {file.mime_type.startsWith("image/") ? (
                                        <img
                                            src={file.url}
                                            alt={file.filename}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                            <FileIcon className="w-10 h-10 text-neutral-600" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={(e) => askDelete(file, e)}
                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full translate-y-2 group-hover:translate-y-0 transition-transform"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-0 inset-x-0 p-1 bg-black/50 backdrop-blur-sm text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {file.filename}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Overlay */}
            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedFile(null)}>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden min-h-[300px]">
                            {selectedFile.mime_type.startsWith("image/") ? (
                                <img
                                    src={selectedFile.url}
                                    alt={selectedFile.filename}
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <FileIcon className="w-32 h-32 text-neutral-700" />
                            )}
                        </div>

                        <div className="w-full md:w-80 p-6 flex flex-col border-t md:border-t-0 md:border-l border-neutral-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-lg text-white truncate pr-4">Detalhes</h2>
                                <button onClick={() => setSelectedFile(null)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Nome do arquivo</label>
                                    <p className="text-sm text-neutral-200 break-all">{selectedFile.filename}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Tipo</label>
                                    <p className="text-sm text-neutral-200">{selectedFile.mime_type}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Tamanho</label>
                                    <p className="text-sm text-neutral-200">{formatSize(selectedFile.size_bytes)}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Data de Upload</label>
                                    <p className="text-sm text-neutral-200">{new Date(selectedFile.created_at).toLocaleString("pt-BR")}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">URL Pública</label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            readOnly
                                            value={selectedFile.url}
                                            className="flex-1 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 p-2 rounded focus:outline-none"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(selectedFile.url, "url")}
                                            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                                        >
                                            {copiedId === "url" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-auto border-t border-neutral-800">
                                <button
                                    onClick={() => setFileToDelete(selectedFile)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-lg transition-all text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir Permanentemente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={!!fileToDelete}
                title="Excluir arquivo"
                description={`Tem certeza que deseja excluir "${fileToDelete?.filename ?? "este arquivo"}"? Essa ação não pode ser desfeita.`}
                confirmLabel="Excluir arquivo"
                isLoading={isDeleting}
                onCancel={() => setFileToDelete(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
