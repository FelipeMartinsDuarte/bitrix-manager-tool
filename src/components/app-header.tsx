
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  PanelLeft,
  Package2,
  Users,
  Settings,
  Package,
  FilePlus2,
  ScrollText,
  Warehouse,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MOCK_USERS } from "@/lib/mock-data";

const navItems = [
  { href: "/crms", icon: Warehouse, label: "CRMs" },
  { href: "/fields", icon: FilePlus2, label: "Campos" },
  { href: "/logs", icon: ScrollText, label: "Logs" },
  { href: "/users", icon: Users, label: "Usuários" },
];

export function AppHeader() {
  const pathname = usePathname();
  const adminUser = MOCK_USERS.find(u => u.NAME === 'Admin');
  const userImage = PlaceHolderImages.find(p => p.id === 'user3');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Package className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Bitrix Integrator</span>
            </Link>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-2.5 ${
                        pathname.startsWith(item.href)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
             <Link
                href="/settings"
                className={`flex items-center gap-4 px-2.5 ${
                    pathname.startsWith('/settings')
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <Settings className="h-5 w-5" />
                Configurações
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can be a search bar later */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Image
              src={userImage?.imageUrl || "/placeholder-user.jpg"}
              width={40}
              height={40}
              alt="Avatar"
              className="overflow-hidden rounded-full"
              data-ai-hint={userImage?.imageHint}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{adminUser?.NAME} {adminUser?.LAST_NAME}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuItem>Suporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
