"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { GrowthKeyword } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface KeywordFormState {
  name: string;
  nameEn: string;
  sortOrder: number;
}

export default function KeywordManagementPage() {
  useRequireRole("ADMIN");
  const router = useRouter();

  const [keywords, setKeywords] = useState<GrowthKeyword[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<KeywordFormState>({
    name: "",
    nameEn: "",
    sortOrder: 0,
  });
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<KeywordFormState>({
    name: "",
    nameEn: "",
    sortOrder: 0,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingKeyword, setDeletingKeyword] = useState<GrowthKeyword | null>(
    null
  );
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchKeywords = useCallback(async () => {
    try {
      const data = await api.get<GrowthKeyword[]>("/api/v1/keywords");
      setKeywords(data);
    } catch {
      // Error handled by api layer
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    setAddSubmitting(true);
    setError(null);

    try {
      const newKeyword = await api.post<GrowthKeyword>("/api/v1/keywords", {
        name: addForm.name.trim(),
        nameEn: addForm.nameEn.trim() || null,
        sortOrder: addForm.sortOrder,
      });
      setKeywords((prev) => [...prev, newKeyword]);
      setAddForm({ name: "", nameEn: "", sortOrder: 0 });
      setShowAddForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "키워드 추가 중 오류가 발생했습니다."
      );
    } finally {
      setAddSubmitting(false);
    }
  };

  const startEditing = (keyword: GrowthKeyword) => {
    setEditingId(keyword.id);
    setEditForm({
      name: keyword.name,
      nameEn: keyword.nameEn || "",
      sortOrder: 0,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || editingId === null) return;

    setEditSubmitting(true);
    setError(null);

    try {
      const updated = await api.put<GrowthKeyword>(
        `/api/v1/keywords/${editingId}`,
        {
          name: editForm.name.trim(),
          nameEn: editForm.nameEn.trim() || null,
          sortOrder: editForm.sortOrder,
        }
      );
      setKeywords((prev) =>
        prev.map((k) => (k.id === editingId ? updated : k))
      );
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "키워드 수정 중 오류가 발생했습니다."
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingKeyword) return;

    setDeleteSubmitting(true);
    setError(null);

    try {
      await api.delete(`/api/v1/keywords/${deletingKeyword.id}`);
      setKeywords((prev) => prev.filter((k) => k.id !== deletingKeyword.id));
      setDeleteDialogOpen(false);
      setDeletingKeyword(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "키워드 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <MobileShell>
      <div className="p-4 space-y-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>뒤로</span>
        </button>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">성장 키워드 관리</h2>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleAdd} className="space-y-3">
                <h3 className="text-sm font-semibold">새 키워드 추가</h3>
                <Input
                  placeholder="키워드 이름 (한국어)"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="영문 이름 (선택)"
                  value={addForm.nameEn}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="정렬 순서"
                  value={addForm.sortOrder}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!addForm.name.trim() || addSubmitting}
                  >
                    {addSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "추가"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Keyword list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              등록된 키워드가 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {keywords.map((keyword) => (
              <Card key={keyword.id}>
                <CardContent className="p-3">
                  {editingId === keyword.id ? (
                    <form onSubmit={handleEdit} className="space-y-3">
                      <Input
                        placeholder="키워드 이름 (한국어)"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="영문 이름 (선택)"
                        value={editForm.nameEn}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            nameEn: e.target.value,
                          }))
                        }
                      />
                      <Input
                        type="number"
                        placeholder="정렬 순서"
                        value={editForm.sortOrder}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            sortOrder: Number(e.target.value),
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingId(null)}
                        >
                          취소
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="flex-1"
                          disabled={!editForm.name.trim() || editSubmitting}
                        >
                          {editSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "저장"
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">
                          {keyword.name}
                        </span>
                        {keyword.nameEn && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({keyword.nameEn})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditing(keyword)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingKeyword(keyword);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-[340px]">
            <DialogHeader>
              <DialogTitle>키워드 삭제</DialogTitle>
              <DialogDescription>
                &quot;{deletingKeyword?.name}&quot; 키워드를 삭제하시겠습니까?
                이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingKeyword(null);
                }}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="flex-1"
              >
                {deleteSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "삭제"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MobileShell>
  );
}
