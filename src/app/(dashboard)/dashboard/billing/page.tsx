'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import LoadingIcon from '@/components/ui/LoadingIcon';

export default function BillingPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // POS State
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'Services' | 'Inventory'>('Services');

    useEffect(() => {
        const loadData = async () => {
            try {
                const { getPatients } = await import('@/actions/patient');
                const { getServices } = await import('@/actions/billing');
                const { getInventory } = await import('@/actions/inventory');

                const [pats, servs, inv] = await Promise.all([getPatients(), getServices(), getInventory()]);
                setPatients(pats);
                setServices(servs);
                setInventory(inv);
            } catch (err) {
                console.error(err);
                toast.error('Error cargando datos');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nit?.includes(searchQuery)
    ).slice(0, 5);

    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const addToCart = (item: any, type: 'Service' | 'Inventory') => {
        if (type === 'Inventory' && item.stock <= 0) {
            return toast.error('Sin stock disponible');
        }

        const cartItem = {
            ...item,
            cartId: Math.random().toString(36).substr(2, 9),
            type,
            price: type === 'Inventory' ? item.unitPrice : item.price
        };
        setCart([...cart, cartItem]);
        toast.success(`${item.name} agregado`);
    };

    const removeFromCart = (cartId: string) => {
        setCart(cart.filter(i => i.cartId !== cartId));
    };

    const handleProcessPayment = async () => {
        if (!selectedPatient) return toast.error('Seleccione un paciente');
        if (cart.length === 0) return toast.error('Agregue al menos un producto');

        setIsProcessing(true);
        try {
            toast.loading('Certificando con GFACE (SAT) y descontando inventario...');

            // Simular lógica de backend unificada (ASIP Improvement: en el futuro esto llamará a una sola acción)
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.dismiss();
            toast.success('Venta Procesada y Factura FEL Certificada');
            setCart([]);
            setSelectedPatient(null);
        } catch (err) {
            toast.error('Error al procesar el pago');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingIcon />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white dark:bg-slate-950 min-h-screen animate-fade-in pb-24">
            <header className="flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 w-full">
                <div onClick={() => window.history.back()} className="text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined font-black">arrow_back</span>
                </div>
                <div className="ml-4 flex-1 text-center pr-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Administrativo</p>
                    <h2 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight uppercase tracking-[0.1em]">Caja / Punto de Venta</h2>
                </div>
            </header>

            <main className="flex-1 space-y-8 p-6 overflow-y-auto">
                {/* Patient Search */}
                <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                        <span className="material-symbols-outlined text-lg">person_search</span>
                        Selección de Paciente
                    </h4>
                    <div className="relative">
                        <input
                            className="w-full h-16 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-none px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary placeholder:text-slate-400 shadow-sm transition-all"
                            placeholder="Nombre o NIT del paciente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && !selectedPatient && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-20 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-4">
                                {filteredPatients.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPatient(p);
                                            setSearchQuery('');
                                        }}
                                        className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-4"
                                    >
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                            {p.user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase leading-none">{p.user.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">NIT: {p.nit || 'CF'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedPatient && (
                        <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-primary text-white shadow-xl shadow-primary/20 relative animate-in zoom-in-95 duration-300">
                            <div className="size-16 rounded-[1.5rem] bg-white/20 border-2 border-white/20 flex items-center justify-center text-white shrink-0">
                                <span className="material-symbols-outlined text-4xl font-black">person</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xl font-black uppercase tracking-tight leading-none">{selectedPatient.user.name}</p>
                                <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">Saldos al día • NIT: {selectedPatient.nit || 'CF'}</p>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="size-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                <span className="material-symbols-outlined text-sm font-black">close</span>
                            </button>
                        </div>
                    )}
                </section>

                {/* Catalog Selection Tabs */}
                <section className="space-y-4">
                    <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.8rem]">
                        <button
                            onClick={() => setActiveTab('Services')}
                            className={cn(
                                "flex-1 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'Services' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-500"
                            )}
                        >Servicios</button>
                        <button
                            onClick={() => setActiveTab('Inventory')}
                            className={cn(
                                "flex-1 py-3 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'Inventory' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-500"
                            )}
                        >Farmacia / Insumos</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-[300px] overflow-y-auto pr-1 no-scrollbar pt-2">
                        {activeTab === 'Services' ? (
                            services.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => addToCart(service, 'Service')}
                                    className="flex flex-col p-6 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-900 hover:border-primary/30 transition-all text-left group shadow-sm"
                                >
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none group-hover:text-primary transition-colors">{service.name}</span>
                                    <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">Q {service.price}</span>
                                </button>
                            ))
                        ) : (
                            inventory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item, 'Inventory')}
                                    disabled={item.stock <= 0}
                                    className={cn(
                                        "flex flex-col p-6 rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 transition-all text-left shadow-sm relative group",
                                        item.stock <= 0 ? "opacity-40 grayscale" : "border-slate-50 dark:border-slate-900 hover:border-emerald-400/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none group-hover:text-emerald-500 transition-colors uppercase">{item.name}</span>
                                        <div className={cn(
                                            "size-2 rounded-full",
                                            item.stock > item.minStock ? "bg-emerald-500" : item.stock > 0 ? "bg-amber-500" : "bg-red-500"
                                        )} />
                                    </div>
                                    <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">Q {item.unitPrice}</span>
                                    <p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest">STOCK: {item.stock} {item.unitName}</p>
                                </button>
                            ))
                        )}
                    </div>
                </section>

                {/* Cart Detail (Elevated) */}
                <section className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pl-2">
                        <span className="material-symbols-outlined text-lg">shopping_basket</span>
                        Detalle del Cobro
                    </h4>
                    {cart.length > 0 ? (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.cartId} className="flex justify-between items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{item.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                                            {item.type === 'Service' ? 'Servicio Médico' : 'Producto Farmacia'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">Q {item.price}</p>
                                        <button onClick={() => removeFromCart(item.cartId)} className="size-8 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm font-black">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 opacity-50 bg-slate-50/30 dark:bg-slate-900/30">
                            <span className="material-symbols-outlined text-5xl mb-3 font-light">shopping_basket</span>
                            <p className="text-[10px] font-black uppercase tracking-widest">Carrito Vacío</p>
                        </div>
                    )}
                </section>

                {/* Methods & Checkout */}
                <section className="space-y-8 pb-12">
                    <div>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pl-2">
                            <span className="material-symbols-outlined text-lg">payments</span>
                            Método de Pago
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Cash', 'Card', 'Transfer'] as const).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-5 rounded-[1.8rem] border-2 transition-all group",
                                        paymentMethod === method
                                            ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10 scale-105"
                                            : "border-slate-50 dark:border-slate-900 text-slate-400 hover:border-primary/20"
                                    )}
                                >
                                    <span className="material-symbols-outlined mb-2 text-2xl group-hover:scale-110 transition-transform">
                                        {method === 'Cash' ? 'payments' : method === 'Card' ? 'credit_card' : 'account_balance'}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {method === 'Cash' ? 'Efectivo' : method === 'Card' ? 'Tarjeta' : 'Transf.'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-primary rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <span className="material-symbols-outlined text-8xl">local_atm</span>
                        </div>

                        <div className="flex justify-between items-end mb-8 relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total a Pagar</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold opacity-60">Q</span>
                                    <span className="text-5xl font-black tracking-tighter">{total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Impuestos incl.</p>
                                <p className="text-xs font-bold uppercase tracking-tighter">Moneda: GTQ</p>
                            </div>
                        </div>

                        <button
                            onClick={handleProcessPayment}
                            disabled={isProcessing || !selectedPatient || cart.length === 0}
                            className="w-full bg-white text-slate-900 disabled:opacity-40 py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all relative z-10"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined font-black">receipt_long</span>
                                    <span>Certificar y Cobrar</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Quick Daily Summary (ASIP Glassmorphism) */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Últimos cobros hoy</h3>
                            <span className="material-symbols-outlined text-slate-300">timeline</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-50 dark:border-slate-900">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">Factura #9928 - Sofía G.</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Q 350.00</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-50 dark:border-slate-900">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">Factura #9927 - Luis M.</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Q 500.00</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
