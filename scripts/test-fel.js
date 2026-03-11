/**
 * Test script to verify FEL payload generation and mock certification.
 */
const { buildFelPayload, certifyWithCertificador } = require('../src/lib/fel');

async function testFel() {
    console.log('--- Starting FEL Integration Test ---');

    const mockInvoice = {
        id: 'inv_123',
        appointmentId: 'apt_456789',
        totalAmount: 150.00
    };

    const mockPatient = {
        nit: '1234567-8',
        user: { name: 'Juan Perez' },
        address: 'Ciudad de Guatemala'
    };

    const mockClinic = {
        name: 'Clínica Pediatrica de Prueba',
        regionalSettings: {
            nit: '999999-9',
            direccion: 'Av. Reforma 1-23, Zona 10'
        }
    };

    console.log('1. Building Payload...');
    const payload = buildFelPayload(mockInvoice, mockPatient, mockClinic);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    console.log('\n2. Certifying with Mock Service...');
    try {
        const result = await certifyWithCertificador(payload);
        console.log('Certification Success!');
        console.log('UUID:', result.uuid);
        console.log('Serie:', result.serie);
        console.log('No:', result.numero);
        console.log('PDF:', result.pdf_url);

        console.log('\n--- Test Completed Successfully ---');
    } catch (error) {
        console.error('Certification Failed:', error.message);
    }
}

testFel();
