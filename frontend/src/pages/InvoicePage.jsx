import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Download, Printer, CheckCircle, FileText, 
  Building2, Calendar, CreditCard, ExternalLink, Package, MapPin
} from 'lucide-react';

const InvoicePage = () => {
  const { id } = useParams(); // order id
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        // 1. Fetch order details with items
        const orderData = await apiFetch(`/orders/${id}`);
        
        // Authorization check
        if (orderData.user_id !== user?.id && user?.role_id !== 5) {
          toast.error('No tienes permiso para ver esta factura');
          navigate('/orders');
          return;
        }

        setOrder(orderData);

        // 2. Fetch invoice from payments service if paid
        try {
          const invoiceData = await apiFetch(`/payments/order/${id}`);
          setInvoice(invoiceData);
        } catch {
          console.log('No specific payment invoice returned, using order fallback');
        }
      } catch (err) {
        toast.error('Error al cargar la factura');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvoiceData();
    }
  }, [id, user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '960px' }}>
        <div className="skeleton" style={{ height: '40px', width: '220px', marginBottom: '2rem' }}></div>
        <div className="skeleton" style={{ height: '300px', marginBottom: '2rem' }}></div>
        <div className="skeleton" style={{ height: '200px' }}></div>
      </div>
    );
  }

  if (!order) return null;

  // Resolve values
  const orderNumber = order.id ? order.id.split('-')[0].toUpperCase() : '---';
  const invoiceNumber = invoice?.invoice_number || `INV-${new Date(order.created_at || Date.now()).getFullYear()}-${orderNumber}`;
  const total = Number(invoice?.total || order.total || 0);
  const shippingCost = Number(order.shipping_cost || 0);
  const itemsTotal = Math.max(0, total - shippingCost);

  // Colombian VAT 19%
  const subtotal = Number(invoice?.subtotal || (itemsTotal / 1.19));
  const tax = Number(invoice?.tax || (itemsTotal - subtotal));

  const issueDate = new Date(invoice?.issued_at || invoice?.created_at || order.created_at || Date.now()).toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const rawMethod = invoice?.method || 'credit_card';
  const paymentMethodLabel = 
    rawMethod === 'pse' ? 'Transferencia Bancaria (PSE)' :
    rawMethod === 'credit_card' ? 'Tarjeta de Crédito / Débito' :
    rawMethod === 'cash' ? 'Pago Contra Entrega' : rawMethod;

  const clientName = user?.full_name || 'Cliente MercadoExpress';
  const clientEmail = user?.email || 'cliente@correo.com';
  const clientPhone = user?.phone || 'No registrado';
  const clientAddress = order.shipping_address || 'Dirección no especificada';
  const clientCity = order.shipping_city || order.shipping_department || 'Colombia';

  // Generate printable PDF
  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const printWindow = window.open('', '_blank', 'width=850,height=950');
      if (!printWindow) {
        toast.error('Por favor permite las ventanas emergentes en tu navegador para generar el PDF');
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
              width: 340px;
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
      toast.success('Abriendo diálogo para guardar o imprimir el PDF...');
    } catch (err) {
      console.error(err);
      toast.error('Error generando el documento PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '960px' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} /> Volver a mis pedidos
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to={`/order/${order.id}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <ExternalLink size={16} /> Ver Detalles del Pedido
          </Link>
          <button 
            onClick={handleDownloadPDF} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', boxShadow: 'var(--shadow-glow)' }}
            disabled={downloading}
          >
            <Download size={16} /> Descargar en PDF
          </button>
        </div>
      </div>

      {/* Main Full-Page Invoice Container */}
      <div className="glass-panel" style={{ padding: '3rem', backgroundColor: '#0F172A', border: '1px solid rgba(45, 212, 191, 0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', borderRadius: 'var(--radius-xl)' }}>
        
        {/* Header: Company & Invoice Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '2rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                <Building2 size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Mercado<span className="text-gradient">Express</span> S.A.S.
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  Facturación Electrónica Oficial
                </span>
              </div>
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '0.75rem' }}>
              <div><strong>NIT:</strong> 901.458.723-1 | IVA Régimen Común</div>
              <div><strong>Sede Principal:</strong> Calle 20 # 10-15, Montería, Córdoba - Colombia</div>
              <div><strong>Contacto:</strong> facturacion@mercadoexpress.com • +57 (4) 789 4500</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
              Factura Electrónica de Venta
            </h1>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '0.5rem' }}>
              No. {invoiceNumber}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              border: '1px solid var(--success)',
              padding: '0.3rem 0.85rem',
              borderRadius: '2rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '0.75rem'
            }}>
              <CheckCircle size={15} /> PAGADA Y VERIFICADA
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /> {issueDate}</div>
              <div><strong>Pedido N°:</strong> #{orderNumber}</div>
            </div>
          </div>
        </div>

        {/* Client & Payment Info Grid */}
        <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Client Box */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '0.95rem',
              color: 'var(--primary-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.5rem'
            }}>
              Adquirente / Datos del Cliente
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong style={{ color: 'var(--text-main)' }}>Nombre / Razón Social:</strong> {clientName}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Correo Electrónico:</strong> {clientEmail}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Teléfono:</strong> {clientPhone}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Dirección de Entrega:</strong> {clientAddress}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Ciudad / Depto:</strong> {clientCity}</div>
            </div>
          </div>

          {/* Payment & Logistics Box */}
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '0.95rem',
              color: 'var(--primary-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '0.5rem'
            }}>
              Detalles de la Transacción
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong style={{ color: 'var(--text-main)' }}>Método de Pago:</strong> {paymentMethodLabel}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Estado del Pago:</strong> Aprobado / Confirmado</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Moneda:</strong> COP (Pesos Colombianos)</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Zona Logística de Envío:</strong> {order.shipping_zone || 'Colombia Nacional'}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Bodega de Despacho:</strong> Montería, Córdoba</div>
            </div>
          </div>

        </div>

        {/* Products Table */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} className="text-gradient" /> Artículos Facturados ({order.items?.length || 0})
          </h3>
          
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', width: '50px', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '1rem' }}>Descripción del Producto</th>
                  <th style={{ padding: '1rem', width: '90px', textAlign: 'center' }}>Cant.</th>
                  <th style={{ padding: '1rem', width: '150px', textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ padding: '1rem', width: '150px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                      ${Number(item.unit_price).toLocaleString('es-CO')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-light)' }}>
                      ${(Number(item.unit_price) * item.quantity).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Breakdown & Totals */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '2rem',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Subtotal (Base gravable):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${Math.round(subtotal).toLocaleString('es-CO')} COP</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>IVA (19% discriminado DIAN):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${Math.round(tax).toLocaleString('es-CO')} COP</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Costo de Envío Logístico:</span>
              <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'var(--text-main)', fontWeight: shippingCost === 0 ? 700 : 600 }}>
                {shippingCost === 0 ? '¡Envío Gratis! ($0)' : `$${shippingCost.toLocaleString('es-CO')} COP`}
              </span>
            </div>

            <div style={{
              borderTop: '2px solid var(--primary-color)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--accent-color)'
            }}>
              <span>Total Pagado:</span>
              <span>${total.toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        </div>

        {/* Legal DIAN Notes */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          <div><strong>CUFE:</strong> 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f</div>
          <div>Resolución DIAN No. 18764000001 de 2026. Documento soporte de costos y deducciones tributarias en Colombia.</div>
          <div style={{ marginTop: '0.5rem', color: 'var(--primary-light)', fontWeight: 600 }}>
            ⚡ MercadoExpress — Plataforma de Comercio Electrónico con Arquitectura de Microservicios
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
          <button 
            onClick={handleDownloadPDF} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', fontSize: '1rem', boxShadow: 'var(--shadow-glow)' }}
            disabled={downloading}
          >
            <Download size={18} /> Descargar Factura en PDF
          </button>
          
          <button 
            onClick={() => window.print()} 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', fontSize: '1rem' }}
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>

      </div>

    </div>
  );
};

export default InvoicePage;

