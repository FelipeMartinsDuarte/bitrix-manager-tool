
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

export function CreateCrmDialog({
  children,
  onCreate,
}: {
  children: ReactNode;
  onCreate: (crm: CrmEntity) => void;
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

    console.log("Chamada de API para criar CRM (simulada)...");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newCrm: CrmEntity = {
      id: `${entityTypeId}-${Date.now()}`,
      title,
      entityTypeId,
      created: new Date().toISOString(),
    };

    console.log("Payload simulado:", { newCrm });
    onCreate(newCrm);

    toast({
      title: "CRM Criado com Sucesso!",
      description: `O CRM "${title}" foi adicionado (simulação).`,
    });

    setIsSubmitting(false);
    setOpen(false);
    event.currentTarget.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo CRM</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar um novo Smart Process (CRM).
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
                defaultValue="Novo CRM"
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
                defaultValue="150"
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
              Criar CRM
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
