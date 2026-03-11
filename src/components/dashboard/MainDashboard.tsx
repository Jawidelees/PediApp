'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart,
  Activity,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PediatricLogo from '@/components/ui/PediatricLogo';
import { useSession } from 'next-auth/react';
import { getClinicalAnalytics } from '@/actions/analytics';
import { getInventory } from '@/actions/inventory';
import { getAppointments } from '@/actions/patient';
import LoadingIcon from '@/components/ui/LoadingIcon';
import { cn } from '@/lib/utils';

export default function MainDashboard() {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [inventoryAlerts, setInventoryAlerts] = React.useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { data: session } = useSession();

  const role = (session?.user as any)?.role || 'RECEPTIONIST';
  const isDoctorOrAdmin = role === 'ADMIN' || role === 'DOCTOR';
  const isReceptionist = role === 'RECEPTIONIST';

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Wrap each promise to handle failures individually
        const analyticsPromise = getClinicalAnalytics().catch(err => {
          console.error('Failed to load analytics:', err);
          return null;
        });

        const inventoryPromise = getInventory().catch(err => {
          console.error('Failed to load inventory:', err);
          return [];
        });

        const appointmentsPromise = getAppointments().catch(err => {
          console.error('Failed to load appointments:', err);
          return [];
        });

        const [aData, iData, appointments] = await Promise.all([
          analyticsPromise,
          inventoryPromise,
          appointmentsPromise
        ]);

        if (aData) setAnalytics(aData);
        if (Array.isArray(iData)) {
          setInventoryAlerts(iData.filter((i: any) => i.stock <= i.minStock).slice(0, 3));
        }
        if (Array.isArray(appointments)) {
          setRecentAppointments(appointments.slice(0, 5));
        }
      } catch (err) {
        console.error('Critical error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Clínico</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.1 } }
        }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {isDoctorOrAdmin && (
          <KpiCard
            title="Ingresos Totales (Hoy)"
            value={`Q${analytics?.totalRevenueToday?.toFixed(2) || '0.00'}`}
            icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
            trend="Basado en facturas completadas"
            delay={0}
          />
        )}
        <KpiCard
          title="Citas de Hoy"
          value={analytics?.productivityByDoctor?.reduce((sum: number, d: any) => sum + d.count, 0)?.toString() || '0'}
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          trend="Finalizadas hoy"
          delay={0.1}
        />
        <KpiCard
          title="Pacientes en Sistema"
          value={analytics?.totalPatients?.toString() || '0'}
          icon={<Users className="h-4 w-4 text-violet-500" />}
          delay={0.2}
        />
        {isDoctorOrAdmin ? (
          <KpiCard
            title="Alertas Inventario"
            value={inventoryAlerts.length.toString()}
            icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            alert={inventoryAlerts.length > 0}
            delay={0.3}
          />
        ) : (
          <KpiCard
            title="Agenda del Día"
            value={recentAppointments.length.toString()}
            icon={<CalendarCheck className="h-4 w-4 text-brand-500" />}
            trend="Citas próximas"
            delay={0.3}
          />
        )}
      </motion.div>

      <div className={cn("grid gap-6", isDoctorOrAdmin ? "md:grid-cols-2 lg:grid-cols-7" : "grid-cols-1")}>

        {/* Main Chart Area (Mocked) */}
        {isDoctorOrAdmin && (
          <div className="col-span-4 rounded-xl border bg-white dark:bg-zinc-950 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Resumen de Ingresos</h3>
              <p className="text-sm text-gray-500">Vista mensual de servicios facturados</p>
            </div>
            <div className="h-[300px] flex items-end justify-between gap-2 px-2">
              {/* Simple CSS Bar Chart Simulation */}
              {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-md relative group">
                  <div
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-md transition-all duration-500 hover:bg-blue-500"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
            </div>
          </div>
        )}

        {/* Inventory Alerts */}
        {isDoctorOrAdmin && (
          <div className="col-span-3 rounded-xl border bg-white dark:bg-zinc-950 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Insumos Críticos</h3>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-4">
              {inventoryAlerts.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm truncate max-w-[150px]">{item.name}</span>
                    <span className="text-xs text-gray-500">Min: {item.minStock}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-sm font-bold", item.stock <= item.minStock / 2 ? 'text-red-600' : 'text-orange-500')}>
                      {item.stock} {item.baseUnitName}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                      {item.stock <= item.minStock / 2 ? 'CRÍTICO' : 'BAJO'}
                    </span>
                  </div>
                </div>
              ))}
              {inventoryAlerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Saludable</p>
                </div>
              )}
            </div>
            <button className="w-full mt-4 text-sm text-blue-600 hover:underline">
              Ver inventario completo
            </button>
          </div>
        )}
      </div>

      {/* Recent Appointments Table */}
      <div className="rounded-xl border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 dark:bg-zinc-900/50">
          <h3 className="text-lg font-medium">Próximas Citas</h3>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                <th className="h-12 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Paciente</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Servicio</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Hora</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Estado</th>
                <th className="h-12 px-4 align-middle font-medium text-gray-500 dark:text-gray-400 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {recentAppointments.map((appt: any) => (
                <tr key={appt.id} className="border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                  <td className="p-4 align-middle font-medium">{appt.patient.user.name}</td>
                  <td className="p-4 align-middle uppercase text-[10px] font-black text-brand-600">{appt.service.name}</td>
                  <td className="p-4 align-middle text-xs text-gray-500">{new Date(appt.date).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4 align-middle">
                    <StatusBadge status={appt.status} />
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Link href={`/dashboard/patients/${appt.patientId}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
              {recentAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No hay citas programadas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function KpiCard({ title, value, icon, trend, alert, delay }: { title: string, value: string, icon: React.ReactNode, trend?: string, alert?: boolean, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-2xl border p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm transition-all border-slate-200 dark:border-slate-800",
        alert ? "border-red-200 bg-red-50/50 dark:bg-red-900/10" : "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 letter-spacing-widest">{title}</h3>
        <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-900", alert && "bg-red-100 dark:bg-red-900/30")}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {trend}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  const label: Record<string, string> = {
    SCHEDULED: "Programada (Pend. Aceptar)",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {label[status as keyof typeof label]}
    </span>
  );
}
