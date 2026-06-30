"use client";

import * as React from "react";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Loader2, Upload, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDokumenAction,
  updateDokumenAction,
  fetchDokumenDetailAction,
  getNextDocumentNumber,
  type ActionResult,
} from "@/app/(dashboard)/admin/dokumen/actions";
import type { DokumenListItem, KategoriListItem } from "@/types";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; dokumen: DokumenListItem };

type EditData = {
  id: string;
  title: string;
  documentNumber: string;
  content: string;
  documentDate: string;
  categoryId: string;
};

type ContentSource = "manual" | "upload";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const ACCEPT_STRING = ".pdf,.docx,.doc";

export function DokumenFormDialog({
  mode,
  kategoriOptions,
  open,
  onOpenChange,
  onSuccess,
}: {
  mode: Mode | null;
  kategoriOptions: KategoriListItem[];
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = mode?.kind === "edit";
  const title = isEdit ? "Edit Dokumen" : "Tambah Dokumen";
  const description = isEdit
    ? "Perbarui informasi dokumen. TF-IDF akan di-re-index otomatis."
    : "Tambahkan dokumen baru. Dokumen akan di-index TF-IDF secara otomatis.";

  const action = React.useMemo(() => {
    if (isEdit && mode?.kind === "edit") {
      return updateDokumenAction.bind(null, mode.dokumen.id);
    }
    return createDokumenAction;
  }, [isEdit, mode]);

  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);

  const [editData, setEditData] = React.useState<EditData | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  const [contentSource, setContentSource] = React.useState<ContentSource>("manual");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [manualContent, setManualContent] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [documentNumber, setDocumentNumber] = React.useState("");
  const [autoNumber, setAutoNumber] = React.useState(false);
  const [loadingNumber, setLoadingNumber] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");

  React.useEffect(() => {
    if (open && isEdit && mode?.kind === "edit") {
      setLoadingDetail(true);
      setEditData(null);
      fetchDokumenDetailAction(mode.dokumen.id).then((result) => {
        if (result.ok && result.dokumen) {
          setEditData(result.dokumen);
          setManualContent(result.dokumen.content);
        }
        setLoadingDetail(false);
      });
    }
    if (open && !isEdit) {
      setEditData(null);
      setManualContent("");
      setDocumentNumber("");
      setAutoNumber(false);
      setSelectedCategoryId("");
    }
    if (open) {
      setContentSource("manual");
      setSelectedFile(null);
    }
  }, [open, isEdit, mode]);

  React.useEffect(() => {
    if (state?.ok) {
      onSuccess();
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  React.useEffect(() => {
    if (isEdit || !selectedCategoryId) return;
    let cancelled = false;
    setLoadingNumber(true);
    getNextDocumentNumber(selectedCategoryId).then((result) => {
      if (cancelled) return;
      if (result.ok && result.documentNumber) {
        setDocumentNumber(result.documentNumber);
        setAutoNumber(true);
      }
      setLoadingNumber(false);
    });
    return () => { cancelled = true; };
  }, [isEdit, selectedCategoryId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isValid = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!isValid) {
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isLoading = isEdit && loadingDetail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" as const }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat data dokumen...
            </div>
          ) : (
            <form action={formAction} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={editData?.title ?? ""}
                  placeholder="Judul surat atau dokumen"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="documentNumber">Nomor Surat</Label>
                  {autoNumber && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Otomatis
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    required
                    value={isEdit ? (editData?.documentNumber ?? "") : documentNumber}
                    onChange={(e) => {
                      if (!isEdit) {
                        setDocumentNumber(e.target.value);
                        setAutoNumber(false);
                      }
                    }}
                    placeholder="Contoh: 001/SK/2026"
                    disabled={pending || loadingNumber}
                  />
                  {loadingNumber && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentDate">Tanggal Dokumen</Label>
                <Input
                  id="documentDate"
                  name="documentDate"
                  type="date"
                  required
                  defaultValue={editData?.documentDate ?? ""}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategori</Label>
                <Select
                  name="categoryId"
                  defaultValue={editData?.categoryId ?? ""}
                  disabled={pending}
                  onValueChange={(value) => {
                    if (!isEdit) setSelectedCategoryId(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOptions.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Sumber Konten</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={contentSource === "manual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContentSource("manual")}
                    disabled={pending}
                  >
                    Ketik Manual
                  </Button>
                  <Button
                    type="button"
                    variant={contentSource === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContentSource("upload")}
                    disabled={pending}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Unggah File
                  </Button>
                </div>

                {contentSource === "manual" ? (
                  <div className="space-y-2">
                    <Label htmlFor="content">Konten Dokumen</Label>
                    <Textarea
                      id="content"
                      name="content"
                      required
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      placeholder="Isi konten dokumen..."
                      rows={8}
                      disabled={pending}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="file">Unggah File (.pdf, .docx, .doc)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          ref={fileInputRef}
                          id="file"
                          name="file"
                          type="file"
                          accept={ACCEPT_STRING}
                          onChange={handleFileChange}
                          disabled={pending}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Maksimal 10 MB. Format: PDF, DOCX, DOC. Teks akan diekstrak otomatis.
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate flex-1">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={clearFile}
                          disabled={pending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {contentSource === "upload" && !selectedFile && (
                      <input type="hidden" name="content" value="" />
                    )}

                    {contentSource === "upload" && selectedFile && isEdit && editData && (
                      <p className="text-xs text-muted-foreground">
                        Konten lama akan diganti dengan teks dari file yang diunggah.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {state?.ok === false && state.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={pending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {pending
                    ? "Menyimpan..."
                    : isEdit
                      ? "Simpan perubahan"
                      : "Tambah dokumen"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
