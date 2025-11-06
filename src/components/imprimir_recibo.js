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
      factura: {},
      recibo: {},
    };
  }

  componentDidMount() {
    Alertify.message("Cargando recibo...");
    const { id_factura, id_recibo,id,id_doc } = this.props.match.params;
    this.cargar_factura(id_factura);
    this.cargar_recibo(id_recibo);
  }

  retroceder = () => {
      return <Redirect to={`/perfil_paciente/${this.props.match.params.id_paciente}`} />;
    
  };

generarPDFyEnviarWhatsApp = async () => {
    try {
      const elemento = document.getElementById('recibo');
      const canvas = await html2canvas(elemento, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'recibo.pdf');

      const response = await Axios.post(`${Core.url_base}/api/subir_recibo_temp`, formData);
      const pdfUrl = response.data.url;

      const telefono = this.state.recibo.factura?.paciente?.telefono?.replace(/\D/g, '') || '';
      const mensaje = `Hola 👋, aquí tienes tu recibo de pago de ${Core.Config.name_company}:\n${pdfUrl}`;
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
    const logoURL = Core.LogoApp;

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
      this.setState({ factura: data[0] || {} });

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
      const elemento = document.getElementById('recibo');
      const canvas = await html2canvas(elemento, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'recibo.pdf');
      formData.append('email', this.state.recibo.factura?.paciente?.correo_electronico || '');
      formData.append('asunto', `Recibo de Pago - ${Core.Config.name_company}`);
      formData.append('nombre_compania', Core.Config.name_company);
      formData.append('logo_compania', Core.Config.app_logo);
      formData.append('direccion_compania', Core.Config.app_address);
      formData.append('telefono_compania', Core.Config.app_phone);

      await Axios.post(`${Core.url_base}/api/enviar_recibo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alertify.success('Recibo enviado por correo correctamente');
    } catch (error) {
      console.error(error);
      Alertify.error('Error al generar o enviar el PDF');
    }
  };

  render() {
    const { factura, recibo, redirectPerfil } = this.state;
    const procedimientos = JSON.parse(recibo.procedimientos || "[]");
    const monto_total = procedimientos.reduce((acc, item) => acc + (item.total || 0), 0);

    if (redirectPerfil) {
      return <Redirect to={`/perfil_paciente/${this.props.match.params.id}`} />;
    }

    return (
      <div
        className="col-md-9 d-flex flex-column align-items-center"
        style={{
          margin: '0 auto',
          padding: '20px',
          minHeight: '100vh',
          background: '#f9f9f9'
        }}
      >
        {/* Logo solo visible en pantalla */}
        <div className="text-center mb-3 d-print-none">
          <img
            src={Core.LogoApp}
            alt="Logo"
            style={{
              width: '120px',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Botones */}
        <div className="text-center mb-3 d-print-none">
          <button className="btn btn-primary me-2" onClick={this.Imprimir}>
            <i className="fas fa-print"></i> Imprimir
          </button>&nbsp;
          <Link to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doctor}`} >
            <button className="btn btn-secondary me-2">
            <i className="fas fa-arrow-left"></i> Volver
          </button>
          </Link>&nbsp;
     
          <button onClick={this.generarPDFyEnviar} className="btn btn-success">
            <i className="fas fa-file-pdf"></i> Enviar PDF
          </button>&nbsp;

          <button onClick={this.generarPDFyEnviarWhatsApp} className="btn btn-info">
            <i className="fab fa-whatsapp"></i> Enviar por WhatsApp
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
          <p style={{ textAlign: 'center' }}><strong>COMPROBANTE AUTORIZADO POR LA DGII</strong></p>
          <hr />

          <p><strong>Fecha de pago:</strong> {recibo.fecha_pago}</p>
          <p><strong>#</strong> {recibo.codigo_recibo}</p>

          <hr />
          <p><strong>FACTURA PARA CONSUMIDOR</strong></p>
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
