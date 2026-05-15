"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { CommonTable, type CommonColumn } from "@/components/common/common-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeleteDialog } from "@/components/common/delete-dialog";
import { PageLoader } from "@/components/common/page-loader";
import { TablePagination } from "@/components/common/table-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { useDepartments, useDeleteDepartment, useUpdateDepartment, type Department } from "@/hooks/use-departments";

type NormalizedDept = Department & { created_at: string };

export function DepartmentsContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  const { data, isLoading, isFetching } = useDepartments({
    page,
    limit,
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteDepartment();
  const updateMutation = useUpdateDepartment();

  // Normalize API response: camelCase createdAt → snake_case created_at (CommonTable contract)
  const rows = useMemo<NormalizedDept[]>(() =>
    (data?.data ?? []).map((d: any) => ({
      ...d,
      created_at: d.created_at ?? d.createdAt ?? "",
    })),
  [data?.data]);

  // Map backend pagination shape → TablePagination shape
  const pagination = useMemo(() => {
    const p = data?.pagination as any;
    if (!p) return null;
    const total = p.total ?? p.totalItems ?? 0;
    const totalPages = p.totalPages ?? Math.ceil(total / limit);
    return {
      page,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    };
  }, [data?.pagination, page, limit]);

  const confirmDelete = () => {
    if (!deleteDept) return;
    deleteMutation.mutate(deleteDept.id, {
      onSuccess: () => setDeleteDept(null),
      onError: () => setDeleteDept(null),
    });
  };

  const columns: CommonColumn<NormalizedDept>[] = [
    {
      key: "name",
      header: "Department",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-primary/10">
            <Building2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-medium text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {row.description || "—"}
        </span>
      ),
    },
  ];

  return (
    <PermissionGuard permission="departments.view">
      <div className="space-y-6">
        <PageLoader open={isLoading || isFetching || deleteMutation.isPending || updateMutation.isPending} />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Manage company departments and link them to employees</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <PermissionGuard permission="departments.create">
                  <Button onClick={() => router.push("/admin/platform/departments/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <CommonTable
              columns={columns}
              data={rows as any}
              isLoading={isLoading}
              onStatusToggle={(row, val) =>
                updateMutation.mutate({ id: row.id, data: { is_active: val ? 1 : 0 } })
              }
              onEdit={(row) => router.push(`/admin/platform/departments/${row.id}/edit`)}
              onDelete={(row) => setDeleteDept(row)}
              emptyMessage="No departments found."
              showStatus
              showCreated
              showActions
            />

            {pagination && (
              <TablePagination
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        open={deleteDept !== null}
        onOpenChange={(open) => { if (!open) setDeleteDept(null); }}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteDept?.name}"? Employees assigned to this department will be unlinked.`}
      />
    </PermissionGuard>
  );
}
