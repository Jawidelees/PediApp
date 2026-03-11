// FEL (Factura Electrónica en Línea) - Guatemala
// Estructura y Helper para construir el JSON de la SAT

export interface FelJsonStructure {
  // Datos Generales
  fecha_emision: string; // ISO 8601
  codigo_moneda: string; // 'GTQ'
  tipo_documento: 'FACT' | 'NCRE';

  // Emisor
  emisor: {
    nit: string;
    nombre: string;
    direccion: string;
    departamento: string;
    municipio: string;
  };

  // Receptor
  receptor: {
    nit: string;
    nombre: string;
    direccion: string;
    correo?: string;
  };

  // Items
  items: Array<{
    cantidad: number;
    descripcion: string;
    precio_unitario: number;
    monto_impuesto: number; // IVA
    total: number;
    tipo_impuesto: 'IVA';
  }>;

  // Totales
  total_impuesto: number;
  total_monto: number;
}

// Función helper para convertir una factura de la DB al formato JSON de la SAT
export function buildFelPayload(invoice: any, patient: any, clinic: any): FelJsonStructure {
  const totalAmount = Number(invoice.totalAmount);
  const baseAmount = totalAmount / 1.12;
  const ivaAmount = totalAmount - baseAmount;

  const payload: FelJsonStructure = {
    fecha_emision: new Date().toISOString(),
    codigo_moneda: 'GTQ',
    tipo_documento: 'FACT',
    emisor: {
      nit: clinic?.regionalSettings?.nit || process.env.FEL_EMISOR_NIT || 'CF',
      nombre: clinic?.name || process.env.FEL_EMISOR_NOMBRE || 'Clínica Pediátrica',
      direccion: clinic?.regionalSettings?.direccion || 'Ciudad',
      departamento: 'Guatemala',
      municipio: 'Guatemala'
    },
    receptor: {
      nit: patient?.nit || 'CF',
      nombre: patient?.user?.name || 'Consumidor Final',
      direccion: patient?.address || 'Ciudad'
    },
    items: [
      {
        cantidad: 1,
        descripcion: `Servicios Médicos - Cita #${invoice.appointmentId.slice(-6)}`,
        precio_unitario: totalAmount,
        monto_impuesto: Number(ivaAmount.toFixed(2)),
        total: totalAmount,
        tipo_impuesto: 'IVA'
      }
    ],
    total_impuesto: Number(ivaAmount.toFixed(2)),
    total_monto: totalAmount
  };

  return payload;
}

/**
 * Simula la certificación real con un certificador (Infile/Digifact)
 */
export async function certifyWithCertificador(payload: FelJsonStructure) {
  // Simulación de latencia de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulación de éxito/error (95% éxito)
  if (Math.random() > 0.95) {
    throw new Error('Certificador API Timeout - Reintente en unos momentos');
  }

  const uuid = crypto.randomUUID().toUpperCase();
  const serie = "E" + Math.random().toString(36).substring(2, 4).toUpperCase();
  const numero = Math.floor(Math.random() * 899999999) + 100000000;

  return {
    success: true,
    uuid,
    serie,
    numero: numero.toString(),
    fecha_certificacion: new Date().toISOString(),
    xml_comprobante: '<?xml version="1.0" encoding="UTF-8"?><DTE>...</DTE>', // Mock XML
    pdf_url: `https://report.feel.com.gt/ingresarportal/default.aspx?key=${uuid}` // Mock PDF URL
  };
}
