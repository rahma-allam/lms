import { useState } from "react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import {
  useListCourses,
  useCreateCourse,
  useDeleteCourse,
  getListCoursesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, Users, Search, MoreVertical, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  archived: "bg-muted text-muted-foreground",
};

export default function Courses() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: courses, isLoading } = useListCourses(
    {},
    { query: { queryKey: getListCoursesQueryKey() } }
  );

  const createCourse = useCreateCourse({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
        setDialogOpen(false);
        reset();
        toast.success("Course created successfully");
      },
      onError: () => toast.error("Failed to create course"),
    },
  });

  const deleteCourse = useDeleteCourse({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
        toast.success("Course deleted");
      },
      onError: () => toast.error("Failed to delete course"),
    },
  });

  const { register, handleSubmit, reset } = useForm<{
    title: string;
    titleAr: string;
    description: string;
    price: number;
    status: "active" | "draft" | "archived";
  }>({
    defaultValues: { status: "draft", price: 0 },
  });

  const filtered = (courses ?? []).filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">{t("courses")}</h1>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {t("createCourse")}
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl h-44 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t("noData")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColors[course.status])}>
                    {t(course.status)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/courses/${course.id}`} className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {t("viewDetails")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteCourse.mutate({ id: course.id })}
                      >
                        <Trash2 className="w-4 h-4 me-2" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">{course.title}</h3>
                {course.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.studentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.moduleCount} modules
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">${course.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createCourse")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) =>
              createCourse.mutate({
                data: {
                  title: data.title,
                  titleAr: data.titleAr || undefined,
                  description: data.description || undefined,
                  price: Number(data.price),
                  status: data.status,
                },
              })
            )}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">{t("name")} *</label>
              <Input {...register("title", { required: true })} className="mt-1" placeholder="Course title" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("titleAr")}</label>
              <Input {...register("titleAr")} className="mt-1" dir="rtl" placeholder="عنوان الدورة" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("description")}</label>
              <Input {...register("description")} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("price")} ($) *</label>
                <Input {...register("price", { required: true })} type="number" min="0" step="0.01" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("status")} *</label>
                <select
                  {...register("status")}
                  className="mt-1 w-full h-9 px-3 border border-input rounded-md bg-background text-sm"
                >
                  <option value="draft">{t("draft")}</option>
                  <option value="active">{t("active")}</option>
                  <option value="archived">{t("archived")}</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
              <Button type="submit" disabled={createCourse.isPending}>{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
