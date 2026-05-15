"use client";

import { use } from "react";
import { DepartmentForm } from "@/components/admin/departments/department-form";
import { useDepartment } from "@/hooks/use-departments";
import { PageLoader } from "@/components/common/page-loader";

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: department, isLoading } = useDepartment(Number(id));

  if (isLoading) return <PageLoader open />;

  return (
    <div className="space-y-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Department</h1>
        <p className="text-muted-foreground text-sm mt-1">Update department details</p>
      </div>
      {department && <DepartmentForm department={department} />}
    </div>
  );
}
