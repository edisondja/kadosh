/**
 * Plantilla corporativa para impresión de reportes (ingresos y gastos).
 * Incluye cabecera con logo y nombre de la empresa, estilos elegantes y total en última página.
 */

export const getPrintStyles = () => `
<style>
    * { box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', 'Helvetica Neue', system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 0;
        color: #1a1a2e;
        font-size: 12px;
        line-height: 1.5;
    }
    .print-corporate-header {
        text-align: center;
        padding: 24px 20px 20px;
        border-bottom: 3px solid #1a1a2e;
        margin-bottom: 24px;
        background: #fff;
    }
    .print-corporate-header .logo-wrap {
        margin-bottom: 12px;
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .print-corporate-header .logo-wrap img {
        max-height: 64px;
        max-width: 220px;
        width: auto;
        height: auto;
        object-fit: contain;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .print-corporate-header .company-name {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        letter-spacing: 0.3px;
        margin: 0;
        text-transform: uppercase;
    }
    .print-report-title {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
        margin: 0 0 4px 0;
    }
    .print-report-subtitle {
        font-size: 11px;
        color: #6c757d;
        margin: 0;
    }
    .print-body {
        padding: 0 20px 20px;
    }
    .print-body table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0;
        font-size: 11px;
    }
    .print-body thead th {
        background: #fff;
        color: #1a1a2e;
        font-weight: 600;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 10px 12px;
        text-align: left;
        border: none;
        border-bottom: 2px solid #1a1a2e;
    }
    .print-body thead th.text-end,
    .print-body tbody td.text-end { text-align: right; }
    .print-body tbody tr { border-bottom: 1px solid #e9ecef; }
    .print-body tbody tr:nth-child(even) { background: #f8fafc; }
    .print-body tbody td { padding: 8px 12px; }
    .print-body tfoot td { padding: 12px 16px; }
    .print-body .no-imprimir { display: none !important; }
    .print-body .reporte-print-header { display: none !important; }
    .print-body .no-en-impresion { display: none !important; }
    .print-body table tfoot {
        display: table-footer-group !important;
        background: #f1f3f5 !important;
    }
    .print-body table tfoot td {
        padding: 12px 16px !important;
        border-top: 2px solid #1a1a2e !important;
        font-weight: 700 !important;
        color: #1a1a2e !important;
        background: #f1f3f5 !important;
    }
    @media print {
        body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-corporate-header { box-shadow: none; }
        .print-corporate-header .logo-wrap img { visibility: visible !important; }
        .print-body thead { display: table-header-group; }
        .print-body table tfoot { display: table-footer-group; page-break-inside: avoid; }
    }
</style>
`;

/**
 * Genera el HTML de la cabecera corporativa para impresión.
 * @param {string} logoUrl - URL del logo de la empresa
 * @param {string} companyName - Nombre de la empresa
 * @param {string} reportTitle - Título del reporte (ej: "Reporte de Ingresos")
 * @param {string} subtitle - Subtítulo opcional (ej: "Resumen de facturación por período")
 */
export const getPrintHeader = (logoUrl, companyName, reportTitle, subtitle) => {
    const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const logoImg = logoUrl
        ? `<div class="logo-wrap"><img src="${esc(logoUrl)}" alt="Logo" /></div>`
        : '';
    return `
    <header class="print-corporate-header">
        ${logoImg}
        <h1 class="company-name">${esc(companyName) || 'Empresa'}</h1>
        <p class="print-report-title">${esc(reportTitle) || 'Reporte'}</p>
        ${subtitle ? `<p class="print-report-subtitle">${esc(subtitle)}</p>` : ''}
    </header>
    `;
};

export default { getPrintStyles, getPrintHeader };
