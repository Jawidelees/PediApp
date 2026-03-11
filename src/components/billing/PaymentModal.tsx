'use client';

import React, { useState } from 'react';
import {
    X,
    CreditCard,
    Banknote,
    ArrowRightLeft,
    Upload,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    AlertCircle,
    FileText,
    Image as ImageIcon,
    Printer,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { updatePaymentStatus, certifyInvoiceAction } from '@/actions/billing';
import PrintableInvoice from './PrintableInvoice';

interface PaymentModalProps {
    invoice: {
        id: string;
        totalAmount: any;
        felNumber?: string | null;
        felSeries?: string | null;
        felUuid?: string | null;
        appointment: {
            patient: {
                user: {
                    name: string | null;
                }
            }
        };
        transactions?: any[]; // For calculating remaining balance
    };
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
    const totalAmount = Number(invoice.totalAmount);
    const paidAmount = invoice.transactions?.reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    const [method, setMethod] = useState<'Cash' | 'Transfer' | 'Card' | 'PayBI'>('Cash');
    const [cardLast4, setCardLast4] = useState('');
    const [ref, setRef] = useState('');
    const [amount, setAmount] = useState<string>(remainingAmount.toString());
    const [promisedDate, setPromisedDate] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCertifying, setIsCertifying] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [updatedInvoice, setUpdatedInvoice] = useState<any>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setTimeout(() => {
            setAttachmentUrl(`https://storage.mock/receipts/${file.name}`);
            setIsUploading(false);
        }, 1500);
    };

    const handleConfirm = async () => {
        setIsSaving(true);
        try {
            const paymentAmount = Number(amount);
            const isPartial = paymentAmount < remainingAmount;

            const result = await updatePaymentStatus({
                invoiceId: invoice.id,
                status: isPartial ? 'PARTIAL' : 'COMPLETED',
                paymentMethod: method,
                paymentRef: method === 'Transfer' ? ref : (method === 'Card' ? `CARD-ENDING-${cardLast4}` : undefined),
                attachmentUrl: attachmentUrl || undefined,
                amount: paymentAmount,
                promisedDate: isPartial && promisedDate ? promisedDate : undefined,
            });

            if (result.success) {
                setUpdatedInvoice(result.invoice);
                setIsCompleted(true);
            } else {
                alert('Error al procesar: ' + result.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCertify = async () => {
        if (!updatedInvoice?.id) return;
        setIsCertifying(true);
        try {
            const result = await certifyInvoiceAction(updatedInvoice.id);
            if (result.success) {
                setUpdatedInvoice(result.invoice);
            } else {
                alert('Error al certificar FEL: ' + result.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCertifying(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isCompleted) {
        const hasFel = !!updatedInvoice?.felUuid;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in print:hidden">
                <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl border border-brand-100 dark:border-zinc-800 animate-scale-in">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-glow">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">¡Pago Registrado!</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            {hasFel
                                ? 'La factura ha sido certificada correctamente.'
                                : 'El cobro se ha registrado. Puede certificar FEL ahora.'}
                        </p>
                    </div>

                    {hasFel ? (
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-left space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos de Certificación</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">UUID:</span>
                                <span className="text-xs font-mono font-bold text-brand-600 truncate ml-4">{updatedInvoice.felUuid}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Serie/No:</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{updatedInvoice.felSeries} - {updatedInvoice.felNumber}</span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleCertify}
                            disabled={isCertifying}
                            className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-glow flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {isCertifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            CERTIFICAR FACTURA (FEL)
                        </button>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                            onClick={handlePrint}
                            className="py-4 rounded-2xl bg-brand-500 text-white text-xs font-black shadow-glow flex items-center justify-center gap-2 hover:bg-brand-600 transition-all"
                        >
                            <Printer className="w-4 h-4" />
                            IMPRIMIR
                        </button>
                        <button
                            onClick={onSuccess}
                            className="py-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 text-gray-500 text-xs font-bold hover:bg-gray-100 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                {/* Renderizar Invoice para Impresión Oculto */}
                <div id="printable-area-modal" className="hidden print:block absolute inset-0 bg-white z-[100]">
                    {updatedInvoice && <PrintableInvoice invoice={updatedInvoice} />}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full">
                            Procesar Pago
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                Q {remainingAmount.toLocaleString()}
                            </h2>
                            {paidAmount > 0 && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Total: Q{totalAmount.toLocaleString()} | Abonado: Q{paidAmount.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-bold text-gray-400 line-clamp-1">
                            / {invoice.appointment.patient.user.name}
                        </span>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Monto a Cobrar (Q)</label>
                        <input
                            type="number"
                            step="0.01"
                            max={remainingAmount}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/20 text-2xl font-black focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                        />
                    </div>

                    {/* Method Selector */}
                    <div className="grid grid-cols-4 gap-2">
                        <MethodButton
                            active={method === 'Cash'}
                            onClick={() => setMethod('Cash')}
                            icon={<Banknote className="w-4 h-4" />}
                            label="Efectivo"
                        />
                        <MethodButton
                            active={method === 'Card'}
                            onClick={() => setMethod('Card')}
                            icon={<CreditCard className="w-4 h-4" />}
                            label="Tarjeta"
                        />
                        <MethodButton
                            active={method === 'Transfer'}
                            onClick={() => setMethod('Transfer')}
                            icon={<ArrowRightLeft className="w-4 h-4" />}
                            label="Transf."
                        />
                        <MethodButton
                            active={method === 'PayBI'}
                            onClick={() => setMethod('PayBI')}
                            icon={<ShieldCheck className="w-4 h-4" />}
                            label="PayBI"
                        />
                    </div>

                    {/* Dynamic Fields */}
                    {method === 'Card' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Últimos 4 dígitos / Auth</label>
                            <input
                                type="text"
                                maxLength={4}
                                value={cardLast4}
                                onChange={(e) => setCardLast4(e.target.value)}
                                placeholder="Ej: 1234"
                                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/20 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none transition-all font-mono"
                            />
                            <p className="text-[9px] text-gray-400 font-medium italic">Use el POS físico para procesar antes de confirmar aquí.</p>
                        </div>
                    )}

                    {method === 'Transfer' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">No. Referencia</label>
                                <input
                                    type="text"
                                    value={ref}
                                    onChange={(e) => setRef(e.target.value)}
                                    placeholder="Ej: 987654321"
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/20 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Comprobante / Screenshot</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={cn(
                                        "border-2 border-dashed rounded-[2rem] p-4 flex flex-col items-center justify-center gap-2 transition-all",
                                        attachmentUrl ? "border-brand-500 bg-brand-50/20" : "border-gray-200 dark:border-zinc-800 hover:border-brand-400 text-gray-400"
                                    )}>
                                        {isUploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : attachmentUrl ? (
                                            <CheckCircle2 className="w-5 h-5 text-brand-500" />
                                        ) : (
                                            <Upload className="w-5 h-5" />
                                        )}
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {attachmentUrl ? 'Archivo Adjunto' : 'Subir Imagen'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {method === 'PayBI' && (
                        <div className="p-5 rounded-3xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/50 flex gap-4 animate-in fade-in">
                            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-black text-brand-900 dark:text-brand-100 uppercase tracking-tight">Seguridad PayBI</p>
                                <p className="text-[10px] text-brand-700/70 dark:text-brand-400/70 leading-relaxed font-medium">
                                    Se generará un link de pago. El estado se actualizará tras la confirmación bancaria.
                                </p>
                            </div>
                        </div>
                    )}

                    {Number(amount) < remainingAmount && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest px-1">Fecha Prometida de Pago (Saldo Restante)</label>
                            <input
                                type="date"
                                value={promisedDate}
                                onChange={(e) => setPromisedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // No dates in the past
                                className="w-full px-5 py-3.5 rounded-2xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-900/10 text-sm focus:ring-2 focus:ring-brand-500/30 outline-none transition-all"
                            />
                            <p className="text-[9px] text-gray-400 font-medium italic">Se enviará un recordatorio automático al paciente en esta fecha.</p>
                        </div>
                    )}

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide leading-relaxed">
                            Esta acción certificará el pago y enviará la factura FEL al correo del paciente.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSaving || isUploading || !amount || Number(amount) <= 0 || Number(amount) > remainingAmount || (method === 'Transfer' && !ref) || (method === 'Card' && !cardLast4) || (Number(amount) < remainingAmount && !promisedDate)}
                        className="flex-[2] py-4 rounded-2xl bg-brand-500 text-white text-xs font-black shadow-glow flex items-center justify-center gap-2 hover:bg-brand-600 transition-all disabled:opacity-50 uppercase tracking-widest"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        CONFIRMAR PAGO
                    </button>
                </div>
            </div>
        </div>
    );
}

function MethodButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2",
                active
                    ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                    : "bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 text-gray-400 hover:border-brand-200"
            )}
        >
            {icon}
            <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
        </button>
    );
}
