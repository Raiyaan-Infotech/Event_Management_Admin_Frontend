import { DepartmentForm } from "@/components/admin/departments/department-form";

export default function CreateDepartmentPage() {
  return (
    <div className="space-y-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Department</h1>
        <p className="text-muted-foreground text-sm mt-1">Create a new department</p>
      </div>
      <DepartmentForm />
    </div>
  );
}
