import { useState } from 'react';
import { X, Download, CheckCircle, FileText, Building2, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceModal = ({ isOpen, onClose, order, invoice, user }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !order) return null;

  // Resolve values with safe fallbacks
  const orderNumber = order.id ? order.id.split('-')[0].toUpperCase() : '---';
  const invoiceNumber = invoice?.invoice_number || `INV-${new Date(order.created_at || Date.now()).getFullYear()}-${orderNumber}`;
  const total = Number(invoice?.total || order.total || 0);
  const shippingCost = Number(order.shipping_cost || 0);
  const itemsTotal = Math.max(0, total - shippingCost);
  
  // Colombian VAT 19%
  const subtotal = Number(invoice?.subtotal || (itemsTotal / 1.19));
  const tax = Number(invoice?.tax || (itemsTotal - subtotal));
  
  const issueDate = new Date(invoice?.issued_at || invoice?.created_at || order.created_at || Date.now()).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const rawMethod = invoice?.method || 'credit_card';
  const paymentMethodLabel = 
    rawMethod === 'pse' ? 'Transferencia Bancaria (PSE)' :
    rawMethod === 'credit_card' ? 'Tarjeta de Crédito / Débito' :
    rawMethod === 'cash' ? 'Pago Contra Entrega' : rawMethod;

  const clientName = user?.full_name || 'Cliente MercadoExpress';
  const clientEmail = user?.email || 'cliente@correo.com';
  const clientPhone = user?.phone || 'No especificado';
  const clientAddress = order.shipping_address || 'Dirección no especificada';
  const clientCity = order.shipping_city || order.shipping_department || 'Colombia';

  // Generate printable HTML for downloading as PDF
  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const printWindow = window.open('', '_blank', 'width=850,height=950');
      if (!printWindow) {
        toast.error('Por favor permite las ventanas emergentes para generar el PDF');
        setDownloading(false);
        return;
      }

      const itemsHtml = (order.items || []).map((item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-size: 13px; color: #64748b; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px; font-size: 13px; color: #1e293b; font-weight: 500;">${item.product_name}</td>
          <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: right;">$${Number(item.unit_price).toLocaleString('es-CO')}</td>
          <td style="padding: 10px; font-size: 13px; color: #0d9488; font-weight: 600; text-align: right;">$${(Number(item.unit_price) * item.quantity).toLocaleString('es-CO')}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Factura_${invoiceNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 20px;
              background: #ffffff;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 800;
              color: #0d9488;
              margin: 0;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h1 {
              font-size: 20px;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .badge-paid {
              display: inline-block;
              background-color: #dcfce7;
              color: #15803d;
              font-weight: 700;
              font-size: 12px;
              padding: 4px 10px;
              border-radius: 12px;
              margin-top: 5px;
            }
            .info-grid {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .info-box {
              width: 48%;
              vertical-align: top;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 16px;
            }
            .info-box h3 {
              font-size: 12px;
              text-transform: uppercase;
              color: #0d9488;
              letter-spacing: 0.5px;
              margin: 0 0 8px 0;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            }
            .info-box p {
              font-size: 12px;
              margin: 3px 0;
              color: #334155;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background: #0f172a;
              color: #ffffff;
              font-size: 12px;
              font-weight: 600;
              padding: 10px;
              text-align: left;
            }
            .totals-table {
              width: 320px;
              margin-left: auto;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .totals-table td {
              padding: 6px 10px;
              font-size: 13px;
            }
            .totals-table .total-row td {
              border-top: 2px solid #0d9488;
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              padding-top: 10px;
            }
            .footer-note {
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 10px;
              color: #64748b;
              line-height: 1.5;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="brand-name">⚡ Mercado Express</div>
                <div class="brand-sub">MERCADOEXPRESS COLOMBIA S.A.S.</div>
                <div class="brand-sub">NIT: 901.458.723-1 | IVA Régimen Común</div>
                <div class="brand-sub">Calle 20 # 10-15, Montería, Córdoba - Colombia</div>
                <div class="brand-sub">Email: facturacion@mercadoexpress.com</div>
              </td>
              <td class="invoice-title">
                <h1>Factura Electrónica de Venta</h1>
                <div style="font-size: 15px; font-weight: 700; color: #0d9488; margin-top: 4px;">No. ${invoiceNumber}</div>
                <div class="badge-paid">✓ PAGADA</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Fecha: ${issueDate}</div>
                <div style="font-size: 12px; color: #64748b;">Pedido: #${orderNumber}</div>
              </td>
            </tr>
          </table>

          <table class="info-grid">
            <tr>
              <td class="info-box">
                <h3>Datos del Adquirente / Cliente</h3>
                <p><strong>Nombre:</strong> ${clientName}</p>
                <p><strong>Email:</strong> ${clientEmail}</p>
                <p><strong>Teléfono:</strong> ${clientPhone}</p>
                <p><strong>Dirección:</strong> ${clientAddress}</p>
                <p><strong>Ciudad / Depto:</strong> ${clientCity}</p>
              </td>
              <td style="width: 4%;"></td>
              <td class="info-box">
                <h3>Detalles de la Transacción</h3>
                <p><strong>Método de Pago:</strong> ${paymentMethodLabel}</p>
                <p><strong>Estado del Pago:</strong> Aprobado / Completado</p>
                <p><strong>Moneda:</strong> COP (Pesos Colombianos)</p>
                <p><strong>Tipo de Operación:</strong> Comercio Electrónico B2C</p>
                <p><strong>Despacho:</strong> Montería (Bodega Central)</p>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Descripción del Producto</th>
                <th style="width: 70px; text-align: center;">Cant.</th>
                <th style="width: 120px; text-align: right;">Precio Unit.</th>
                <th style="width: 120px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td style="color: #64748b;">Subtotal (Base gravable):</td>
              <td style="text-align: right; font-weight: 600;">$${Math.round(subtotal).toLocaleString('es-CO')}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">IVA (19%):</td>
              <td style="text-align: right; font-weight: 600;">$${Math.round(tax).toLocaleString('es-CO')}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Costo de Envío:</td>
              <td style="text-align: right; font-weight: 600;">
                ${shippingCost === 0 ? 'Gratis ($0)' : `$${shippingCost.toLocaleString('es-CO')}`}
              </td>
            </tr>
            <tr class="total-row">
              <td>TOTAL PAGADO:</td>
              <td style="text-align: right; color: #0d9488;">$${total.toLocaleString('es-CO')} COP</td>
            </tr>
          </table>

          <div class="footer-note">
            <p><strong>CUFE:</strong> 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f</p>
            <p>Resolución de Facturación Electrónica DIAN No. 18764000001 de 2026. Rango autorizado: INV-1 hasta INV-1000000. Vigencia: 24 meses.</p>
            <p style="margin-top: 6px; font-weight: 600; color: #0f172a;">¡Gracias por comprar en MercadoExpress! Para cualquier duda, contáctanos a soporte@mercadoexpress.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success('Abriendo diálogo para guardar en PDF...');
    } catch (err) {
      console.error(err);
      toast.error('Error generando el documento');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div 
      className="modal-backdrop animate-fade-in" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F172A',
          border: '1px solid rgba(45, 212, 191, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(13, 148, 136, 0.2)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden'
        }}
      >
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(30, 41, 59, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} className="text-gradient" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Factura Electrónica de Venta</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                N° {invoiceNumber} • Pedido #{orderNumber}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={handleDownloadPDF} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              disabled={downloading}
            >
              <Download size={16} /> Descargar en PDF
            </button>
            <button 
              onClick={onClose} 
              className="btn btn-outline"
              style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Body (Scrollable) */}
        <div style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Status & Issuer Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1.5rem',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Building2 size={20} style={{ color: 'var(--primary-light)' }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>MercadoExpress Colombia S.A.S.</h4>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <div><strong>NIT:</strong> 901.458.723-1 (IVA Régimen Común)</div>
                <div><strong>Sede Principal:</strong> Montería, Córdoba - Colombia</div>
                <div><strong>Contacto:</strong> facturacion@mercadoexpress.com</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                border: '1px solid var(--success)',
                padding: '0.35rem 0.85rem',
                borderRadius: '2rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '0.5rem'
              }}>
                <CheckCircle size={15} /> PAGADA
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /> {issueDate}</div>
                <div><CreditCard size={13} style={{ display: 'inline', marginRight: '4px' }} /> {paymentMethodLabel}</div>
              </div>
            </div>
          </div>

          {/* Client & Shipping Grid */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Adquirente / Cliente
              </h5>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong style={{ color: 'var(--text-main)' }}>Nombre:</strong> {clientName}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>Email:</strong> {clientEmail}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>Teléfono:</strong> {clientPhone}</div>
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Destino de Envío
              </h5>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong style={{ color: 'var(--text-main)' }}>Dirección:</strong> {clientAddress}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>Departamento:</strong> {clientCity}</div>
                <div><strong style={{ color: 'var(--text-main)' }}>Zona Logística:</strong> {order.shipping_zone || 'Colombia Nacional'}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontSize: '1rem' }}>
              Detalle de Productos Facturados ({order.items?.length || 0})
            </h5>
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Producto</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Cant.</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Precio Unit.</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-main)' }}>
                        {item.product_name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                        ${Number(item.unit_price).toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-light)' }}>
                        ${(Number(item.unit_price) * item.quantity).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown & Totals */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1.5rem',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Subtotal (Base gravable):</span>
                <span>${Math.round(subtotal).toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>IVA (19% discriminado):</span>
                <span>${Math.round(tax).toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Costo de Envío:</span>
                <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit', fontWeight: shippingCost === 0 ? 600 : 400 }}>
                  {shippingCost === 0 ? 'Envío Gratis' : `$${shippingCost.toLocaleString('es-CO')}`}
                </span>
              </div>
              <div style={{
                borderTop: '2px solid var(--border-color)',
                paddingTop: '0.75rem',
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--accent-color)'
              }}>
                <span>Total Factura:</span>
                <span>${total.toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          </div>

          {/* Legal DIAN Note */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: '1.5',
            padding: '1rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div><strong>CUFE:</strong> 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b</div>
            <div>Resolución DIAN No. 18764000001 de 2026. Documento equivalente para soporte de costos y deducciones.</div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          background: 'rgba(30, 41, 59, 0.6)'
        }}>
          <button onClick={onClose} className="btn btn-outline">
            Cerrar
          </button>
          <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Descargar en PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
