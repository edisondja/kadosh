
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

        generarPDFyEnviarPresupuesto = () => {




                // Crear el PDF
                const pdf = new jsPDF("p", "mm", "a4");

                // ENCABEZADO
                pdf.setFontSize(16);
                pdf.text(Core.Config.name_company || "CLÍNICA DENTAL", 105, 15, { align: "center" });

                pdf.setFontSize(11);
                pdf.text(`Dirección: ${Core.Config.app_address || ""}`, 10, 25);
                pdf.text(`Teléfono: ${Core.Config.app_phone || ""}`, 10, 30);
                /*pdf.text(`Fecha: ${this.state.presupuesto.fecha}`, 190, 25, { align: "right" });*/
                pdf.setFontSize(15);
                pdf.text("PLAN DE TRATAMIENTO / PRESUPUESTO", 105, 40, { align: "center" });

                pdf.setFontSize(12);
                pdf.text(`Doctor: ${this.state.doctore.nombre} ${this.state.doctore.apellido}`, 105, 50, { align: "center" });
                pdf.text(`Paciente: ${this.state.paciente.nombre} ${this.state.paciente.apellido}`, 10, 60);

                // TABLA
                autoTable(pdf, {
                        startY: 70,
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

                // TOTAL
                const y = pdf.lastAutoTable.finalY + 10;
                pdf.setFontSize(14);
                pdf.text(
                        `TOTAL RD$: ${new Intl.NumberFormat().format(this.state.presupuesto.total)}`,
                        190,
                        y,
                        { align: "right" }
                );

                // Convertir PDF a Blob
                const pdfBlob = pdf.output("blob");

                // FormData
                const formData = new FormData();
                formData.append("pdf", pdfBlob, "presupuesto.pdf");

                formData.append("email", this.state.paciente.correo_electronico || "");
                formData.append("asunto", `Presupuesto de Tratamiento - ${Core.Config.name_company}`);
                formData.append("nombre_compania", Core.Config.name_company);
                formData.append("logo_compania", Core.Config.app_logo);
                formData.append("direccion_compania", Core.Config.app_address);
                formData.append("telefono_compania", Core.Config.app_phone);

                // Enviar al backend 
                Axios.post(`${Core.url_base}/api/enviar_presupuesto`, formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                })
                        .then(response => {
                                console.log("Respuesta del servidor:", response.data);
                                if (response.data.status === "success") {
                                        alertify.success("Presupuesto enviado por correo correctamente.");
                                } else {
                                        alertify.error("Error al enviar el presupuesto.");
                                }
                        })
                        .catch(error => {
                                console.error("Error en el envío:", error);
                                alertify.error("Hubo un error al conectarse con el servidor.");
                        });
        }


        generarPDFyEnviarPresupuesto = () => {
                const pdf = new jsPDF("p", "mm", "a4");

                const logoUrl = Core.Config.app_logo;

                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = logoUrl;

                img.onload = () => {

                        // Insertar logo arriba centrado
                        const imgWidth = 50;
                        const imgHeight = (img.height / img.width) * imgWidth;
                        const pageWidth = pdf.internal.pageSize.getWidth();

                        pdf.addImage(img, 'PNG',
                                (pageWidth - imgWidth) / 2,
                                10,
                                imgWidth,
                                imgHeight
                        );

                        // ENCABEZADO
                        pdf.setFontSize(16);
                        pdf.text(Core.Config.name_company || "CLÍNICA DENTAL", 105, 30 + imgHeight, { align: "center" });

                        pdf.setFontSize(11);
                        pdf.text(`Dirección: ${Core.Config.app_address || ""}`, 10, 40 + imgHeight);
                        pdf.text(`Teléfono: ${Core.Config.app_phone || ""}`, 10, 45 + imgHeight);

                        pdf.setFontSize(15);
                        pdf.text("PLAN DE TRATAMIENTO / PRESUPUESTO",
                                105,
                                60 + imgHeight,
                                { align: "center" }
                        );

                        pdf.setFontSize(12);
                        pdf.text(
                                `Doctor: ${this.state.doctore.nombre} ${this.state.doctore.apellido}`,
                                105,
                                70 + imgHeight,
                                { align: "center" }
                        );
                        pdf.text(
                                `Paciente: ${this.state.paciente.nombre} ${this.state.paciente.apellido}`,
                                10,
                                80 + imgHeight
                        );

                        // TABLA
                        autoTable(pdf, {
                                startY: 90 + imgHeight,
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

                        // TOTAL
                        const y = pdf.lastAutoTable.finalY + 10;
                        pdf.setFontSize(14);
                        pdf.text(
                                `TOTAL RD$: ${new Intl.NumberFormat().format(this.state.presupuesto.total)}`,
                                190,
                                y,
                                { align: "right" }
                        );

                        // Convertir a Blob
                        const pdfBlob = pdf.output("blob");

                        // FormData
                        const formData = new FormData();
                        formData.append("pdf", pdfBlob, "presupuesto.pdf");

                        formData.append("email", this.state.paciente.correo_electronico || "");
                        formData.append("asunto", `Presupuesto de Tratamiento - ${Core.Config.name_company}`);
                        formData.append("nombre_compania", Core.Config.name_company);
                        formData.append("logo_compania", Core.Config.app_logo);
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
                        body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        }

                        table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                        }

                        th, td {
                        border: 1px solid #ccc;
                        padding: 8px;
                        text-align: center;
                        }

                        th {
                        background-color: #0e2b52;
                        color: white;
                        }

                        h3 {
                        text-align: center;
                        margin-bottom: 20px;
                        }

                        .titulo {
                        font-size: 20px;
                        font-weight: bold;
                        text-align: center;
                        background: #222;
                        color: white;
                        padding: 10px;
                        margin-bottom: 20px;
                        }
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

                        <div className='col-md-8' style={{ margin: "auto", padding: "30px", fontFamily: "Arial, sans-serif", border: "1px solid #ccc" }}>

                                <div id="presupuesto">
                                        <img src={Core.Config.app_logo} width={Core.Config.logo_width_login} style={{ display: "block", margin: "auto" }} /><br />
                                        <div style={{ textAlign: "right", fontSize: "14px" }}>{this.state.presupuesto.fecha}</div>

                                        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "20px", backgroundColor: "#222", color: "#fff", padding: "10px", marginTop: "10px" }}>
                                                PLAN DE TRATAMIENTO / PRESUPUESTO
                                        </div>

                                        <div style={{ fontWeight: "bold", textAlign: "center", marginTop: "10px" }}>
                                                DR. {this.state.doctore.nombre} {this.state.doctore.apellido}
                                        </div>

                                        <div style={{ marginTop: "10px", fontSize: "16px" }}>
                                                <strong>PACIENTE:</strong> {this.state.paciente.nombre} {this.state.paciente.apellido}
                                        </div>

                                        <br />

                                        <table className='table table-bordered' style={{ textAlign: "center", borderCollapse: "collapse" }}>
                                                <thead style={{ backgroundColor: "#0e2b52", color: "#fff" }}>
                                                        <tr>
                                                                <th>PROCEDIMIENTO</th>
                                                                <th>CANTIDAD</th>
                                                                <th>PRECIO</th>
                                                                <th>MONTO</th>
                                                                <th>TOTAL</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {this.state.presupuesto.procedimientos.map((data, i) => (
                                                                <tr key={i}>
                                                                        <td>{data.nombre_procedimiento}</td>
                                                                        <td>{data.cantidad}</td>
                                                                        <td>{new Intl.NumberFormat().format((data.total / data.cantidad))}</td>
                                                                        <td>{new Intl.NumberFormat().format(data.total)}</td>
                                                                        <td></td>
                                                                </tr>
                                                        ))}
                                                        <tr style={{ fontWeight: "bold" }}>
                                                                <td colSpan="4" style={{ textAlign: "right" }}>TOTAL RD$</td>
                                                                <td>{new Intl.NumberFormat().format(this.state.presupuesto.total)}</td>
                                                        </tr>
                                                </tbody>
                                        </table>
                                </div>

                                <div className="mt-3 d-flex justify-content-between">
                                        <button onClick={this.retroceder} className='btn btn-primary' style={{ background: '#2c008b', borderColor: 'purple' }}>
                                                <i className="fas fa-arrow-left me-1"></i> Retroceder
                                        </button>
                                        <button className='btn btn-primary' onClick={this.generarPDFyEnviarPresupuesto}>Enviar por correo</button>
                                        <button className='btn btn-success' onClick={this.generarPDFyEnviarWhatsAppPresupuesto}>Enviar por WhatsApp</button>
                                        <button onClick={this.Imprimir} className='btn btn-success'>
                                                <i className="fas fa-print me-1"></i> Imprimir
                                        </button>
                                </div>
                        </div>
                );


        }





}

export default VisualizarPresupuesto;