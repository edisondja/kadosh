import React from 'react';
import Axios from 'axios';
import '../css/dashboard.css';
import Alertify from 'alertifyjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Core from './funciones_extras';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';

class ImprimirRecibo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            monto_total: 0,
            redirectPerfil: false,
            factura: {},
            recibo: {}
        };
    }

    componentDidMount() {
        Alertify.message("Cargando recibo...");
        const { id_factura, id_recibo } = this.props.match.params;
        this.cargar_factura(id_factura);
        this.cargar_recibo(id_recibo);


    }

    retroceder = () => {
        this.setState({ redirectPerfil: true });
    };

 Imprimir = () => {
        const ficha = document.getElementById("recibo");

        // Abrir nueva ventana
        const ventimp = window.open('', 'popimpr', 'width=800,height=600');

        // Obtener todos los estilos de la página actual
        const estilos = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
            .map(hoja => hoja.outerHTML)
            .join('\n');

        // Escribir contenido completo con estilos
        ventimp.document.write(`
            <html>
                <head>
                    <title>Imprimir</title>
                    ${estilos}
                    <style>
                        /* Ajustes opcionales para impresión */
                        img { max-width: 100%; height: auto; }
                        body { margin: 0; padding: 10px; font-family: sans-serif; }
                    </style>
                </head>
                <body>
                    ${ficha.outerHTML}
                </body>
            </html>
        `);

        ventimp.document.close();

        // Esperar a que cargue todo antes de imprimir
        ventimp.onload = () => {
            ventimp.focus();
            ventimp.print();
            ventimp.close();
        };
    };


    cargar_factura = async (id_factura) => {
        try {
            const { data } = await Axios.get(`${Core.url_base}/api/cargar_factura/${id_factura}`);
            console.log("Factura:", data);
            this.setState({ factura: data[0] || {} });
        } catch (error) {
            Alertify.error("Error cargando factura. Reintentando...");
            setTimeout(() => this.cargar_factura(id_factura), 2000);
        }
    };

    cargar_recibo = async (id_recibo) => {
        try {
            const { data } = await Axios.get(`${Core.url_base}/api/cargar_recibo/${id_recibo}`);

            console.log("Recibo:", data);
            this.setState({ recibo: data|| {} });


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
            formData.append('email', this.state.recibo.factura.paciente.correo_electronico || '');
            formData.append('asunto', 'Recibo de Pago - Clínica Kadosh');

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

        // Calcular total en cada render sin modificar state
        const monto_total = procedimientos.reduce((acc, item) => acc + (item.total || 0), 0);

        if (redirectPerfil) {
            return <Redirect to={`/perfil_paciente/${this.props.match.params.id_paciente}`} />;
        }

        return (
            <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <button className="btn btn-primary" onClick={this.Imprimir} title="Imprimir">
                        <i className="fas fa-print"></i>
                    </button>

                    <button onClick={this.retroceder} className="btn btn-primary" title="Retroceder">
                        <i className="fas fa-arrow-left"></i>
                    </button>

                    <button onClick={this.generarPDFyEnviar} className="btn btn-success" title="Generar PDF y Enviar por Correo">
                        <i className="fas fa-file-pdf"></i> Enviar PDF
                    </button>
                </div>
                <hr />

                <div className="card" id="recibo" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <img src="/static/media/logo.e32bde04.jpg" alt="Logo" width="100"/><hr/>
                        <strong style={{ fontSize: '16px' }}>
                            COLEGIO LUCES DEL FUTURO<br />
                            <span style={{ fontSize: '14px' }}>Calle David #38, Residencial Antonia, Manoguayabo, Santo Domingo Oeste, República Dominicana</span>
                        </strong>
                        <p>TEL: 809-564-0566 &nbsp;</p>
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
                    <p><strong>Curso:</strong> {this.state.recibo?.factura?.doctor?.nombre || ''} {this.state.recibo?.factura?.doctor?.apellido || ''}</p>
                    <p><strong>Estudiante:</strong> {this.state.recibo?.factura?.paciente?.nombre || ''} {this.state.recibo?.factura?.paciente?.apellido || ''}</p>

                    <div style={{ textAlign: 'right', marginTop: '50px' }}>
                        <strong>Firma __________________________________</strong>
                    </div>
                </div>
            </div>
        );
    }
}

export default ImprimirRecibo;
