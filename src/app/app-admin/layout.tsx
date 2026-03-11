import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Building2, CreditCard, LayoutDashboard, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AppAdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-gray-50 w-full overflow-hidden">
                <Sidebar>
                    <SidebarHeader className="p-4 border-b">
                        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
                            <Building2 className="w-6 h-6" />
                            <span>SaaS Pediátrico Admin</span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/app-admin">
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span>Dashboard Global</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/app-admin/clinics">
                                            <Building2 className="w-4 h-4" />
                                            <span>Clínicas (Tenants)</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/app-admin/subscriptions">
                                            <CreditCard className="w-4 h-4" />
                                            <span>Suscripciones & Planes</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/app-admin/registrations">
                                            <Users className="w-4 h-4" />
                                            <span>Solicitudes (Onboarding)</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/app-admin/users">
                                            <Users className="w-4 h-4" />
                                            <span>Usuarios Globales</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/app-admin/settings">
                                            <Settings className="w-4 h-4" />
                                            <span>Configuraciones</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
                    <header className="h-14 border-b bg-white flex items-center px-6 shadow-sm sticky top-0 z-10">
                        <h1 className="font-semibold text-gray-800">Panel de Control - Super Administrador</h1>
                    </header>
                    <div className="p-6 overflow-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
