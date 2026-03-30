import React from 'react';
import Axios from 'axios';
import '../css/dashboard.css';
import Alertify from 'alertifyjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Core from './funciones_extras';
import { Redirect,Link } from 'react-router-dom/cjs/react-router-dom.min';

class ImprimirRecibo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      monto_total: 0,
      redirectPerfil: false,
      recibo: {},
      config: {
        tipo_numero_factura: 'comprobante' // Valor por defecto
      }
    };
  }

  componentDidMount() {
    Alertify.message("Cargando recibo...");
    const { id_factura, id_recibo } = this.props.match.params;
    this.cargar_factura(id_factura);
    this.cargar_recibo(id_recibo);
    this.cargar_configuracion();
  }

  cargar_configuracion = async () => {
    try {
      const { data } = await Axios.get(`${Core.url_base}/api/configs`);
      if (data && data.length > 0) {
        const config = data[0];
        this.setState({
          config: {
            tipo_numero_factura: config.tipo_numero_factura || 'comprobante',
            prefijo_factura: config.prefijo_factura || ''
          }
        });
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      // Usar Core.Config como fallback
      this.setState({
        config: {
          tipo_numero_factura: Core.Config?.tipo_numero_factura || 'comprobante'
        }
      });
    }
  }

  retroceder = () => {
      return <Redirect to={`/perfil_paciente/${this.props.match.params.id_paciente}`} />;
    
  };

  generarPdfBlobRecibo = async () => {
    const elemento = document.getElementById('recibo');
    if (!elemento) {
      throw new Error('No se encontró el contenido del recibo.');
    }

    // Captura completa del recibo; luego se pagina en A4.
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      windowWidth: elemento.scrollWidth,
      windowHeight: elemento.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Si el recibo es largo, crea páginas adicionales sin recortar contenido.
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  };

generarPDFyEnviarWhatsApp = async () => {
    try {
      const pdfBlob = await this.generarPdfBlobRecibo();
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'recibo.pdf');

      const response = await Axios.post(`${Core.url_base}/api/subir_recibo_temp`, formData);
      const htmlUrl = response.data.view_url || response.data.url;
      const pdfUrl = response.data.url || response.data.view_url;

      let telefono = this.state.recibo.factura?.paciente?.telefono?.replace(/\D/g, '') || '';
      // Normalizar a formato internacional si solo viene el número local (Rep. Dom. = 1 + 10 dígitos)
      if (telefono.length === 10) telefono = `1${telefono}`;

      // Evitar emojis/símbolos que algunos WhatsApp no muestran correctamente
      const empresa = (Core.Config.name_company || 'la clínica')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const mensaje = `Hola, aqui tienes tu recibo de pago de ${empresa}.\n\nVer recibo: ${htmlUrl}\nDescargar PDF: ${pdfUrl}`;
      const wsLink = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

      window.open(wsLink, '_blank');
      Alertify.success('PDF generado y listo para compartir por WhatsApp');
    } catch (error) {
      console.error(error);
      Alertify.error('Error al generar el PDF');
    }
  };


  Imprimir = () => {
    const ficha = document.getElementById("recibo");
    const logoURL = Core.Config.app_logo;

    const ventimp = window.open('', 'popimpr');
    ventimp.document.write(`
      <html>
      <head>
        <title>Recibo</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #fff;
          }
          .recibo-container {
            max-width: 700px;
            margin: auto;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 25px;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 15px;
          }
          .logo-container img {
            width: 100px;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="recibo-container">
          <div class="logo-container">
            <img src="${logoURL}" alt="Logo" />
          </div>
          ${ficha.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    ventimp.document.close();
  };



  cargar_factura = async (id_factura) => {
    try {
      const { data } = await Axios.get(`${Core.url_base}/api/cargar_factura/${id_factura}`);
      console.log(data[0]);
      // La factura se carga pero no se usa directamente, se accede a través de recibo.factura
      // this.setState({ factura: data[0] || {} });

    } catch (error) {
      Alertify.error("Error cargando factura. Reintentando...");
      setTimeout(() => this.cargar_factura(id_factura), 2000);
    }
  };

  cargar_recibo = async (id_recibo) => {
    try {
      const { data } = await Axios.get(`${Core.url_base}/api/cargar_recibo/${id_recibo}`);
      this.setState({ recibo: data || {} });
    } catch (error) {
      Alertify.error("Error cargando recibo. Reintentando...");
      setTimeout(() => this.cargar_recibo(id_recibo), 2000);
    }
  };

  generarPDFyEnviar = async () => {
    try {
      const emailPaciente = (this.state.recibo?.factura?.paciente?.correo_electronico || '').trim();
      if (!emailPaciente) {
        Alertify.warning('El paciente no tiene correo electrónico registrado.');
        return;
      }

      const pdfBlob = await this.generarPdfBlobRecibo();
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'recibo.pdf');
      formData.append('email', emailPaciente);
      formData.append('asunto', `Recibo de Pago - ${Core.Config.name_company}`);
      formData.append('nombre_compania', Core.Config.name_company);
      formData.append('logo_compania', Core.Config.app_logo);
      formData.append('direccion_compania', Core.Config.app_address);
      formData.append('telefono_compania', Core.Config.app_phone);

      await Axios.post(`${Core.url_base}/api/enviar_recibo`, formData);

      Alertify.success('Recibo enviado por correo correctamente');
    } catch (error) {
      console.error(error);
      const d = error.response?.data;
      const msg =
        (d && (d.message || d.error)) ||
        error.message ||
        'Error al generar o enviar el PDF';
      Alertify.error(String(msg));
    }
  };

  render() {
    const { recibo, redirectPerfil } = this.state;
    const procedimientos = JSON.parse(recibo.procedimientos || "[]");
    const monto_total = procedimientos.reduce((acc, item) => acc + (item.total || 0), 0);

    if (redirectPerfil) {
      const idPaciente = this.state.recibo?.factura?.paciente_id || this.props.match.params.id_factura;
      return <Redirect to={`/perfil_paciente/${idPaciente}`} />;
    }

    return (
      <div
        className="col-md-9 d-flex flex-column align-items-center"
        style={{
          margin: '0 auto',
          padding: '20px',
          minHeight: '100vh',
          background: 'transparent'
        }}
      >
        <style>{`
          .recibo-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 14px;
          }
          .recibo-action-btn {
            border: none;
            border-radius: 12px;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 600;
            min-width: 170px;
            color: #fff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          }
          .recibo-action-btn:hover {
            transform: translateY(-1px);
            filter: brightness(1.03);
          }
          .recibo-action-btn:active {
            transform: translateY(0);
          }
          .recibo-action-btn--print {
            background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          }
          .recibo-action-btn--back {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          }
          .recibo-action-btn--mail {
            background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
          }
          .recibo-action-btn--ws {
            background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
          }
          @media (max-width: 768px) {
            .recibo-action-btn {
              width: 100%;
              min-width: 0;
            }
          }
        `}</style>
        {/* Logo solo visible en pantalla */}
        <div className="text-center mb-3 d-print-none">
          <img
            src={Core.Config.app_logo}
            alt="Logo"
            style={{
              width: '120px',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Botones */}
        <div className="recibo-actions d-print-none">
          <button className="recibo-action-btn recibo-action-btn--print" onClick={this.Imprimir}>
            <i className="fas fa-print" aria-hidden="true"></i>
            Imprimir Recibo
          </button>
          <Link to={`/perfil_paciente/${this.props.match.params.id_factura}/${this.props.match.params.id_doctor || ''}`} >
            <button className="recibo-action-btn recibo-action-btn--back">
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              Volver al Perfil
            </button>
          </Link>

          <button onClick={this.generarPDFyEnviar} className="recibo-action-btn recibo-action-btn--mail">
            <i className="fas fa-paper-plane" aria-hidden="true"></i>
            Enviar por Correo
          </button>

          <button onClick={this.generarPDFyEnviarWhatsApp} className="recibo-action-btn recibo-action-btn--ws">
            <i className="fab fa-whatsapp" aria-hidden="true"></i>
            Compartir por WhatsApp
          </button>
        </div>

        {/* Recibo */}
        <div
          id="recibo"
          className="card shadow"
          style={{
            width: '100%',
            maxWidth: '700px',
            background: '#fff',
            borderRadius: '12px',
            padding: '25px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <strong style={{ fontSize: '16px' }}>
              {Core.Config.name_company}<br />
              <span style={{ fontSize: '14px' }}>
                {Core.Config.app_address}<br />Santo Domingo, R.D
              </span>
            </strong>
            <p>TEL: {Core.Config.app_phone} &nbsp;&nbsp; RNC: {Core.Config.rnc_company}</p>
          </div>

          <hr />
          <p style={{ textAlign: 'center' }}>
            <strong>
              {this.state.config?.tipo_numero_factura === 'factura' 
                ? 'FACTURA AUTORIZADA POR LA DGII' 
                : 'COMPROBANTE AUTORIZADO POR LA DGII'}
            </strong>
          </p>
          <hr />

          <p><strong>Fecha de pago:</strong> {recibo.fecha_pago}</p>
          <p>
            {this.state.config?.tipo_numero_factura === 'factura' ? (
              <>
                <strong>Factura:</strong> {recibo.codigo_recibo}
              </>
            ) : (
              <>
                <strong>Número de Comprobante:</strong> {recibo.codigo_recibo}
              </>
            )}
          </p>

          <hr />
          <p style={{ textAlign: 'center' }}><strong>FACTURA PARA CONSUMIDOR</strong></p>
          <hr />

          <p><strong>Lista de procedimientos:</strong></p>
          <div style={{ marginLeft: '20px' }}>
            {procedimientos.map((data, idx) => (
              <div key={idx}>
                <strong style={{ display: 'block', marginBottom: '5px' }}>
                  {data.nombre} x{data.cantidad} - RD$ {new Intl.NumberFormat().format(data.total)}
                </strong>
              </div>
            ))}
          </div>

          <br />
          <p><strong>Total:</strong> RD$ {new Intl.NumberFormat().format(monto_total)}</p>
          <p><strong>Monto Pagado:</strong> RD$ {new Intl.NumberFormat().format(recibo.monto || 0)}</p>
          <p><strong>Resto a pagar:</strong> RD$ {new Intl.NumberFormat().format(recibo.estado_actual || 0)}</p>
          <p><strong>Tipo de pago:</strong> {recibo.concepto_pago}</p>

          <hr />
          <p><strong>Doctor:</strong> {this.state.recibo?.factura?.doctor?.nombre || ''} {this.state.recibo?.factura?.doctor?.apellido || ''}</p>
                    <p><strong>Paciente:</strong> {this.state.recibo?.factura?.paciente?.nombre || ''} {this.state.recibo?.factura?.paciente?.apellido || ''}</p>
          <div style={{ textAlign: 'right', marginTop: '50px' }}>
            <strong>Firma __________________________________</strong>
          </div>
        </div>
      </div>
    );
  }
}

export default ImprimirRecibo;
