
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import type { BitrixApiConfig } from "@/lib/types";

const formSchema = z.object({
  baseUrl: z.string().url("Por favor, insira uma URL válida (ex: https://dominio.bitrix24.com.br)."),
  apiToken: z.string().min(1, "O token da API é obrigatório."),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseUrl: "",
      apiToken: "",
    },
  });

  useEffect(() => {
    // Load config from localStorage when component mounts
    const savedConfig = localStorage.getItem("bitrixConfig");
    if (savedConfig) {
      const config: BitrixApiConfig = JSON.parse(savedConfig);
      form.reset(config);
    }
  }, [form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Save config to localStorage
    localStorage.setItem("bitrixConfig", JSON.stringify(values));
    toast({
      title: "Configurações Salvas!",
      description: "Suas credenciais do Bitrix24 foram salvas no navegador.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações de integração e permissões."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Credenciais da API Bitrix24</CardTitle>
              <CardDescription>
                Insira a URL base e o token de webhook da sua conta Bitrix24. Essas informações
                ficarão salvas apenas no seu navegador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Base do Bitrix24</FormLabel>
                    <FormControl>
                      <Input placeholder="https://seu-dominio.bitrix24.com.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token do Webhook (REST API)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******************************" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
