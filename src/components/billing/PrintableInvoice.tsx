'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PrintableInvoiceProps {
    invoice: {
        id: string;
        totalAmount: any;
        felNumber?: string | null;
        felSeries?: string | null;
        felUuid?: string | null;
        paymentMethod?: string | null;
        createdAt: Date | string;
        appointment: {
            service: {
                name: string;
                price: any;
            };
            patient: {
                user: {
                    name: string | null;
                    email: string | null;
                };
                nit: string | null;
                phone: string | null;
            };
            doctor: {
                user: {
                    name: string | null;
                };
            };
        };
        // Added virtual property for medications if they exist in the record
        medicalRecord?: {
            medications?: any[];
        };
        transactions?: { amount: any, createdAt: Date | string, paymentMethod: string }[];
    };
}

export default function PrintableInvoice({ invoice }: PrintableInvoiceProps) {
    // Determine items to show
    const medItems = (invoice.appointment as any).medicalRecord?.medications || [];
    const servicePrice = Number(invoice.appointment?.service?.price || 0);

    return (
        <div id="pos-receipt" className="bg-white w-[80mm] mx-auto p-2 text-black font-mono text-[10px] leading-tight print:p-0 print:m-0 print:w-[80mm] print:shadow-none shadow-xl border border-gray-200 flex flex-col">

            {/* Header */}
            <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
                <div className="flex justify-center mb-2">
                    <div className="relative w-12 h-12 grayscale contrast-125">
                        <Image src="/icons/icon-192x192.png" alt="Clínica Pediátrica" fill className="object-contain" />
                    </div>
                </div>
                <h1 className="text-lg font-black uppercase tracking-wider">Clínica Pediátrica</h1>
                <p className="text-[10px] font-bold uppercase mt-1">Dra. Fernanda Mérida | Cirujana Dentista</p>
                <div className="mt-2 text-[9px] font-medium uppercase">
                    <p>NIT: CF</p>
                    <p>Hospital Privado Malacatán</p>
                    <p>6ta avenida zona 1, Clínica 2</p>
                    <p>WhatsApp: 3848-6229</p>
                </div>
            </div>

            {/* FEL Info */}
            <div className="mb-4 text-center border-b border-black pb-2 border-dashed">
                <p className="font-bold uppercase text-[10px]">FACTURA ELECTRÓNICA</p>
                <div className="flex justify-between mt-1 px-4">
                    <span>SERIE: <span className="font-bold">{invoice.felSeries || 'A'}</span></span>
                    <span>NO: <span className="font-bold">{invoice.felNumber || 'PEND'}</span></span>
                </div>
                <p className="text-[8px] mt-1 break-all">{invoice.felUuid || 'UUID-PENDIENTE-CERTIFICACION'}</p>
            </div>

            {/* Customer Info */}
            <div className="mb-4 text-[9px] uppercase border-b border-black pb-2 border-dashed space-y-1">
                <div className="flex">
                    <span className="w-16 font-bold">FECHA:</span>
                    <span>{new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex">
                    <span className="w-16 font-bold">CLIENTE:</span>
                    <span className="flex-1 truncate">{invoice.appointment?.patient?.user?.name || 'CONSUMIDOR FINAL'}</span>
                </div>
                <div className="flex">
                    <span className="w-16 font-bold">NIT:</span>
                    <span>{invoice.appointment?.patient?.nit || 'C/F'}</span>
                </div>
                <div className="flex">
                    <span className="w-16 font-bold">DIRECCIÓN:</span>
                    <span>CIUDAD</span>
                </div>
            </div>

            {/* Items */}
            <div className="mb-4">
                <div className="flex border-b border-black border-dashed pb-1 mb-2 font-bold uppercase text-[9px]">
                    <span className="flex-1">DESCRIPCION</span>
                    <span className="w-8 text-center">CANT</span>
                    <span className="w-16 text-right">TOTAL</span>
                </div>

                <div className="space-y-2 text-[9px]">
                    {/* Service */}
                    <div className="flex items-start">
                        <div className="flex-1 pr-1">
                            <span className="block font-bold uppercase">{invoice.appointment?.service?.name}</span>
                        </div>
                        <span className="w-8 text-center">1</span>
                        <span className="w-16 text-right font-bold">Q{servicePrice.toFixed(2)}</span>
                    </div>

                    {/* Medications */}
                    {medItems.map((med: any, idx: number) => (
                        <div key={idx} className="flex items-start">
                            <div className="flex-1 pr-1">
                                <span className="block font-medium uppercase">{med.name}</span>
                            </div>
                            <span className="w-8 text-center">{med.quantity}</span>
                            <span className="w-16 text-right">Q{(med.price * med.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="mb-6 space-y-1 text-[10px] uppercase">
                <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>Q{Number(invoice.totalAmount).toFixed(2)}</span>
                </div>
                {invoice.transactions && invoice.transactions.length > 0 && (
                    <div className="border-t border-black border-dashed pt-2 mt-1 space-y-1">
                        <p className="font-bold border-b border-black border-dotted pb-1 mb-1">HISTORIAL DE PAGOS</p>
                        {invoice.transactions.map((t, idx) => (
                            <div key={idx} className="flex justify-between text-[8px]">
                                <span>{new Date(t.createdAt).toLocaleDateString()} {t.paymentMethod}</span>
                                <span>-Q{Number(t.amount).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-between font-black text-sm border-t border-black border-dashed pt-2 mt-1">
                    <span>TOTAL FACTURADO:</span>
                    <span>Q{Number(invoice.totalAmount).toFixed(2)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] uppercase space-y-2 border-t border-black border-dashed pt-4">
                <p>SUJETO A PAGOS TRIMESTRALES ISR</p>
                <p className="font-bold">¡GRACIAS POR SU PREFERENCIA!</p>
                <div className="mt-4 pt-2 text-[8px] opacity-70">
                    <p>Impreso por Sistema Clínica Pediátrica</p>
                </div>
            </div>

            {/* Style for Print */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: 80mm auto; /* Continuous roll */
                    }
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    #pos-receipt {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        margin: 0;
                        padding: 5mm;
                        box-shadow: none !important;
                        border: none !important;
                        font-family: 'Courier New', Courier, monospace;
                    }
                    /* Hide everything else */
                    nav, header, footer, button, .modal, .overlay {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

