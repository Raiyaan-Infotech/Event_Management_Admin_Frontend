"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateDepartment, useUpdateDepartment, type Department } from "@/hooks/use-departments";
import { PageLoader } from "@/components/common/page-loader";

const schema = z.object({
  name: z.string().trim().min(1, "Department name is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface DepartmentFormProps {
  department?: Department;
}

export function DepartmentForm({ department }: DepartmentFormProps) {
  const router = useRouter();
  const isEditMode = !!department;

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description ?? "",
      });
    }
  }, [department, reset]);

  const onSubmit = (data: FormData) => {
    if (isEditMode) {
      updateMutation.mutate(
        { id: department.id, data },
        { onSuccess: () => router.push("/admin/platform/departments") }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => router.push("/admin/platform/departments"),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PageLoader open={isPending} />

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Department" : "Department Details"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Engineering"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description (optional)"
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/platform/departments")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isEditMode ? "Save Changes" : "Create Department"}
        </Button>
      </div>
    </form>
  );
}
