
import React from 'react';
import Axios from 'axios';
import alertify from 'alertifyjs';
import Core from './funciones_extras';
import PerfilPaciente from './perfil_paciente';
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



import { Link, Redirect } from 'react-router-dom';


class VisualizarPresupuesto extends React.Component {



        constructor(props) {

                super(props);

                this.state = {
                        select: null, paciente: {},
                        presupuesto: {
                                id: 0, factura: "", nombre: "",
                                paciente_id: "", doctor_id: "",
                                procedimientos: [[]]
                        },
                        doctore: []
                }

        }

        componentDidMount() {


                this.Cargar_presupuesto(this.props.match.params.id_presupuesto);
                Core.cargar_paciente(this, this.props.match.params.id);
                Core.cargar_doctor(this, this.props.match.params.id_doc);


        }
      generarPDFyEnviarWhatsAppPresupuesto = () => {
                try {
                        const elemento = document.getElementById('presupuesto');

                        html2canvas(elemento, { scale: 2 })
                        .then(canvas => {
                                const imgData = canvas.toDataURL('image/png');

                                const pdf = new jsPDF('p', 'mm', 'a4');
                                const imgProps = pdf.getImageProperties(imgData);
                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

                                const pdfBlob = pdf.output('blob');

                                // Preparar FormData
                                const formData = new FormData();
                                formData.append('pdf', pdfBlob, 'presupuesto.pdf');

                                // Subir el PDF al servidor
                                return Axios.post(`${Core.url_base}/api/subir_recibo_temp`, formData);
                        })
                        .then(response => {
                                const pdfUrl = response.data.url;

                                const telefono = this.state.paciente.telefono
                                ? this.state.paciente.telefono.replace(/\D/g, '')
                                : '';

                                const mensaje =
                                `Hola 👋, aquí tienes tu presupuesto de tratamiento de ${Core.Config.name_company}:\n` +
                                pdfUrl;

                                const wsLink =
                                `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

                                window.open(wsLink, '_blank');

                                alertify.success('Presupuesto generado y listo para compartir por WhatsApp');
                        })
                        .catch(error => {
                                console.error(error);
                                alertify.error('Error al generar el PDF');
                        });
                } catch (error) {
                        console.error(error);
                        alertify.error('Error interno al generar el PDF');
                }
                };


     

      generarPDFyEnviarPresupuesto = () => {
                const pdf = new jsPDF("p", "mm", "a4");

                // --- ENCABEZADO ---
                pdf.setFontSize(16);
                pdf.text(Core.Config.name_company || "CLÍNICA DENTAL", 105, 20, { align: "center" });

                pdf.setFontSize(11);
                pdf.text(`Dirección: ${Core.Config.app_address || ""}`, 10, 30);
                pdf.text(`Teléfono: ${Core.Config.app_phone || ""}`, 10, 35);

                pdf.setFontSize(15);
                pdf.text("PLAN DE TRATAMIENTO / PRESUPUESTO", 105, 50, { align: "center" });

                pdf.setFontSize(12);
                pdf.text(
                        `Doctor: ${this.state.doctore.nombre} ${this.state.doctore.apellido}`,
                        105,
                        60,
                        { align: "center" }
                );

                pdf.text(
                        `Paciente: ${this.state.paciente.nombre} ${this.state.paciente.apellido}`,
                        10,
                        70
                );

                // --- TABLA ---
                autoTable(pdf, {
                        startY: 80,
                        head: [["PROCEDIMIENTO", "CANTIDAD", "PRECIO", "MONTO"]],
                        body: this.state.presupuesto.procedimientos.map(p => [
                        p.nombre_procedimiento,
                        p.cantidad,
                        new Intl.NumberFormat().format(p.total / p.cantidad),
                        new Intl.NumberFormat().format(p.total)
                        ]),
                        theme: "grid",
                        headStyles: { fillColor: [14, 43, 82] },
                        styles: { fontSize: 10 }
                });

                // --- TOTAL ---
                const y = pdf.lastAutoTable.finalY + 10;
                pdf.setFontSize(14);
                pdf.text(
                        `TOTAL RD$: ${new Intl.NumberFormat().format(this.state.presupuesto.total)}`,
                        190,
                        y,
                        { align: "right" }
                );

                // --- Aclaración de precios (destacada) ---
                pdf.setFillColor(254, 243, 199); // fondo amarillo claro
                pdf.rect(20, y + 10, 170, 12, 'F');
                pdf.setDrawColor(245, 158, 11);
                pdf.setLineWidth(0.5);
                pdf.rect(20, y + 10, 170, 12, 'S');
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(146, 64, 14);
                pdf.text("Presupuesto sujeto a cambios", 105, y + 18, { align: "center" });
                pdf.setTextColor(0, 0, 0);
                pdf.setFont('helvetica', 'normal');

                // --- Convertir a Blob ---
                const pdfBlob = pdf.output("blob");

                // --- Enviar por correo ---
                const formData = new FormData();
                formData.append("pdf", pdfBlob, "presupuesto.pdf");

                // 📌 Aquí sigues enviando el logo solo en el request
                formData.append("logo_compania", Core.Config.app_logo);

                formData.append("email", this.state.paciente.correo_electronico || "");
                formData.append("asunto", `Presupuesto de Tratamiento - ${Core.Config.name_company}`);
                formData.append("nombre_compania", Core.Config.name_company);
                formData.append("direccion_compania", Core.Config.app_address);
                formData.append("telefono_compania", Core.Config.app_phone);

                Axios.post(`${Core.url_base}/api/enviar_presupuesto`, formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                })
                        .then(response => {
                        alertify.success("Presupuesto enviado por correo.");
                        })
                        .catch(error => {
                        console.error("Error en el envío:", error);
                        alertify.error("Error al conectarse con el servidor.");
                        });
                };





        Imprimir() {
                const ficha = document.getElementById("presupuesto");
                const contenido = ficha.innerHTML;

                const ventimp = window.open('', 'popimpr', 'width=900,height=700');

                ventimp.document.write(`
                <html>
                <head>
                        <title>Impresión</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <style>
                        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 24px; background: #fff; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; border-radius: 8px; overflow: hidden; }
                        th, td { padding: 12px; text-align: center; }
                        th { background-color: #0e2b52; color: white; font-weight: 600; }
                        td { border-bottom: 1px solid #e2e8f0; }
                        .presupuesto-aviso { margin-top: 20px; padding: 14px 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; text-align: center; font-weight: bold; color: #92400e; font-size: 15px; }
                        </style>
                </head>
                <body onload="window.print(); setTimeout(() => window.close(), 100);">
                        ${contenido}
                </body>
                </html>
                `);

                ventimp.document.close();
        }


        Cargar_presupuesto = (id_prespusto) => {


                Axios.get(`${Core.url_base}/api/cargar_presupuesto/${id_prespusto}`).then(data => {

                        console.log("Datos correcto", data.data);
                        // El backend ahora devuelve un objeto completo con created_at
                        this.setState({ presupuesto: data.data });
                        console.log("Presupuesto cargado", this.state.presupuesto);

                }).catch(error => {

                        alertify.message(error);

                });

        }


        retroceder = () => {


                this.setState({ select: 'perfil' });

        }




        render() {





                if (this.state.select == 'perfil') {


                        return <Redirect to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doc}`} />

                }

                let count = this.state.presupuesto.procedimientos.length;
                let precio_total = 0;
                console.log("datt", count);

                // alert(this.state.procedimientos.length);
                /*
                        this.state.presupuesto.procedimientos.forEach(element => {
                
                                count++;
                                console.log("datagrama aqui--->",element[count].nombre_procedimiento);
                
                        });
                
                */

                console.log(this.state.presupuesto.factura);

                try {

                        let factura = JSON.parse(this.state.presupuesto.factura);

                        // console.log("B SSSS",factura);

                } catch (e) {

                        console.log("error", e);
                        console.log("LA FACTURA", this.state.presupuesto.factura);
                }

                return (

                        <>
                        <style>{`
                                .presupuesto-container-arriba { margin-top: -25px !important; padding-top: 5px !important; }
                                .btn-presupuesto-retroceder, .presupuesto-btn-correo, .presupuesto-btn-whatsapp, .presupuesto-btn-imprimir { cursor: pointer; transition: all 0.2s ease; }
                                .btn-presupuesto-retroceder:hover { background: #e2e8f0 !important; color: #334155 !important; transform: translateY(-1px); }
                                .btn-presupuesto-retroceder:active { transform: translateY(0); }
                                .presupuesto-btn-correo:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45) !important; }
                                .presupuesto-btn-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45) !important; }
                                .presupuesto-btn-imprimir:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14, 43, 82, 0.45) !important; }
                                .presupuesto-btn-correo:active, .presupuesto-btn-whatsapp:active, .presupuesto-btn-imprimir:active { transform: translateY(0); }
                        `}</style>
                        <div className='col-md-9 col-lg-8 presupuesto-container-arriba' style={{
                                margin: "auto",
                                marginTop: "-25px",
                                padding: "0",
                                paddingTop: "5px",
                                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                                maxWidth: "800px",
                                alignSelf: "flex-start"
                        }}>
                                <div id="presupuesto" style={{
                                        background: "#fff",
                                        borderRadius: "16px",
                                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                                        overflow: "hidden",
                                        border: "1px solid #e8ecf1"
                                }}>
                                        {/* Header */}
                                        <div style={{ padding: "20px 32px", borderBottom: "1px solid #e8ecf1" }}>
                                                <img src={Core.Config.app_logo} width="120" style={{ display: "block", margin: "0 auto 16px" }} alt="Logo" />
                                                <div style={{ textAlign: "right", fontSize: "13px", color: "#64748b" }}>
                                                        <strong>Fecha:</strong> {
                                                                this.state.presupuesto.created_at 
                                                                        ? new Date(this.state.presupuesto.created_at).toLocaleDateString('es-ES', { 
                                                                                year: 'numeric', 
                                                                                month: 'long', 
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                        })
                                                                        : (this.state.presupuesto.fecha || 'N/A')
                                                        }
                                                </div>
                                        </div>

                                        {/* Título */}
                                        <div style={{
                                                textAlign: "center",
                                                fontWeight: "700",
                                                fontSize: "18px",
                                                background: "linear-gradient(135deg, #0e2b52 0%, #1e3a5f 100%)",
                                                color: "#fff",
                                                padding: "16px 24px",
                                                letterSpacing: "0.5px"
                                        }}>
                                                PLAN DE TRATAMIENTO / PRESUPUESTO
                                        </div>

                                        {/* Info médico y paciente */}
                                        <div style={{ padding: "24px 32px 20px" }}>
                                                <div style={{ fontWeight: "600", textAlign: "center", fontSize: "15px", color: "#334155", marginBottom: "12px" }}>
                                                        {Core.formatearNombreDoctor ? Core.formatearNombreDoctor(this.state.doctore) : `DR. ${this.state.doctore.nombre} ${this.state.doctore.apellido}`}
                                                </div>
                                                <div style={{ fontSize: "15px", color: "#475569", padding: "12px 16px", background: "#f8fafc", borderRadius: "10px" }}>
                                                        <strong style={{ color: "#0e2b52" }}>Paciente:</strong> {this.state.paciente.nombre} {this.state.paciente.apellido}
                                                </div>
                                        </div>

                                        {/* Tabla */}
                                        <div style={{ padding: "0 32px 24px" }}>
                                                <table style={{
                                                        width: "100%",
                                                        borderCollapse: "separate",
                                                        borderSpacing: "0",
                                                        borderRadius: "12px",
                                                        overflow: "hidden",
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
                                                }}>
                                                        <thead>
                                                                <tr>
                                                                        <th style={{ padding: "14px 12px", backgroundColor: "#0e2b52", color: "#fff", textAlign: "center", fontSize: "12px", fontWeight: "600" }}>PROCEDIMIENTO</th>
                                                                        <th style={{ padding: "14px 12px", backgroundColor: "#0e2b52", color: "#fff", textAlign: "center", fontSize: "12px", fontWeight: "600" }}>CANTIDAD</th>
                                                                        <th style={{ padding: "14px 12px", backgroundColor: "#0e2b52", color: "#fff", textAlign: "center", fontSize: "12px", fontWeight: "600" }}>PRECIO</th>
                                                                        <th style={{ padding: "14px 12px", backgroundColor: "#0e2b52", color: "#fff", textAlign: "center", fontSize: "12px", fontWeight: "600" }}>MONTO</th>
                                                                        <th style={{ padding: "14px 12px", backgroundColor: "#0e2b52", color: "#fff", textAlign: "center", fontSize: "12px", fontWeight: "600" }}>TOTAL</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {this.state.presupuesto.procedimientos.map((data, i) => (
                                                                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                                                                                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px", color: "#334155" }}>{data.nombre_procedimiento}</td>
                                                                                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" }}>{data.cantidad}</td>
                                                                                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" }}>{new Intl.NumberFormat().format((data.total / data.cantidad))}</td>
                                                                                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", textAlign: "center", fontSize: "14px" }}>{new Intl.NumberFormat().format(data.total)}</td>
                                                                                <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}></td>
                                                                        </tr>
                                                                ))}
                                                                <tr style={{ backgroundColor: "#0e2b52", color: "#fff", fontWeight: "700" }}>
                                                                        <td colSpan="4" style={{ padding: "14px 12px", textAlign: "right", fontSize: "14px" }}>TOTAL RD$</td>
                                                                        <td style={{ padding: "14px 12px", textAlign: "center", fontSize: "15px" }}>{new Intl.NumberFormat().format(this.state.presupuesto.total)}</td>
                                                                </tr>
                                                        </tbody>
                                                </table>

                                                {/* Aviso destacado - Presupuesto sujeto a cambios */}
                                                <div style={{
                                                        marginTop: "20px",
                                                        padding: "14px 20px",
                                                        background: "#fef3c7",
                                                        border: "2px solid #f59e0b",
                                                        borderRadius: "12px",
                                                        textAlign: "center"
                                                }}>
                                                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#92400e" }}>⚠️ Presupuesto sujeto a cambios</span>
                                                </div>
                                        </div>
                                </div>

                                {/* Botones */}
                                <div className="mt-4 d-flex flex-wrap justify-content-between align-items-center" style={{ gap: "20px", marginTop: "28px" }}>
                                        <button 
                                                onClick={this.retroceder} 
                                                className='btn btn-presupuesto-retroceder' 
                                                style={{ 
                                                        background: '#f1f5f9', 
                                                        color: '#475569', 
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px', 
                                                        padding: '12px 24px', 
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}>
                                                <i className="fas fa-arrow-left me-2" style={{ opacity: 0.8 }}></i> Retroceder
                                        </button>
                                        <div className="d-flex flex-wrap align-items-center" style={{ gap: "16px" }}>
                                                <button 
                                                        className='btn presupuesto-btn-correo' 
                                                        onClick={this.generarPDFyEnviarPresupuesto} 
                                                        style={{ 
                                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '12px', 
                                                                padding: '12px 24px',
                                                                fontWeight: '600',
                                                                fontSize: '14px',
                                                                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
                                                        }}>
                                                        <i className="fas fa-envelope me-2"></i> Correo
                                                </button>
                                                <button 
                                                        className='btn presupuesto-btn-whatsapp' 
                                                        onClick={this.generarPDFyEnviarWhatsAppPresupuesto} 
                                                        style={{ 
                                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '12px', 
                                                                padding: '12px 24px',
                                                                fontWeight: '600',
                                                                fontSize: '14px',
                                                                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
                                                        }}>
                                                        <i className="fab fa-whatsapp me-2" style={{ fontSize: '16px' }}></i> WhatsApp
                                                </button>
                                                <button 
                                                        onClick={this.Imprimir} 
                                                        className='btn presupuesto-btn-imprimir' 
                                                        style={{ 
                                                                background: 'linear-gradient(135deg, #0e2b52 0%, #1e3a5f 100%)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '12px', 
                                                                padding: '12px 24px',
                                                                fontWeight: '600',
                                                                fontSize: '14px',
                                                                boxShadow: '0 4px 14px rgba(14, 43, 82, 0.35)'
                                                        }}>
                                                        <i className="fas fa-print me-2"></i> Imprimir
                                                </button>
                                        </div>
                                </div>
                        </div>
                        </>
                );


        }





}

export default VisualizarPresupuesto;