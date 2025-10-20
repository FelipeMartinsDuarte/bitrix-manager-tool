
"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { CrmEntity } from "@/lib/types";

export function EditCrmDialog({
  children,
  crm,
  onUpdate,
}: {
  children: ReactNode;
  crm: CrmEntity;
  onUpdate: (crm: CrmEntity) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const entityTypeId = Number(formData.get("entityTypeId"));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const updatedCrm = { ...crm, title, entityTypeId };
    console.log({ updatedCrm });
    onUpdate(updatedCrm);

    toast({
      title: "CRM Atualizado com Sucesso!",
      description: `O CRM "${title}" foi atualizado.`,
    });

    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar CRM</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do Smart Process (CRM).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={crm.title}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entityTypeId" className="text-right">
                ID da Entidade
              </Label>
              <Input
                id="entityTypeId"
                name="entityTypeId"
                type="number"
                defaultValue={crm.entityTypeId}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
