
import React from 'react';
import Axios from 'axios';
import alertify from 'alertifyjs';
import Core  from './funciones_extras';
import PerfilPaciente from './perfil_paciente';

class VisualizarPresupuesto extends React.Component{



        constructor(props){

               super(props);
        
               this.state={select:null,paciente:{},presupuesto:{id:0,factura:"",nombre:"",paciente_id:"",doctor_id:"",procedimientos:[[]]}}

        }

        componentDidMount(){

                this.Cargar_presupuesto(this.props.id_presupuesto);
                Core.cargar_paciente(this,this.props.id_paciente);
                        
               
        }


                
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


        Cargar_presupuesto=(id_prespusto)=>{


                Axios.get(`${Core.url_base}/api/cargar_presupuesto/${id_prespusto}`).then(data=>{
        
                        console.log("Datos correcto",data.data);
                        this.setState({presupuesto:data.data});
                        console.log("Presupuesto cargado",this.state.presupuesto);

                }).catch(error=>{
        
                alertify.message(error);
        
                });

        }

        
        retroceder=()=>{


                this.setState({select:'perfil'});
        
        }
        

    

       render(){





        if(this.state.select=='perfil'){


                return <PerfilPaciente  id_paciente={this.props.id_paciente}/>

        }

        let count = this.state.presupuesto.procedimientos.length;
        let precio_total = 0;
        console.log("datt",count);

       // alert(this.state.procedimientos.length);
/*
        this.state.presupuesto.procedimientos.forEach(element => {

                count++;
                console.log("datagrama aqui--->",element[count].nombre_procedimiento);

        });

*/

        console.log(this.state.presupuesto.factura);

        try{

        let factura  = JSON.parse(this.state.presupuesto.factura);

        // console.log("B SSSS",factura);

        }catch(e){

                console.log("error",e);
                console.log("LA FACTURA",this.state.presupuesto.factura);
        }

           return (
                <div className='col-md-8' style={{ margin: "auto", padding: "30px", fontFamily: "Arial, sans-serif", border: "1px solid #ccc" }}>
                <div id="presupuesto">
                <div style={{ textAlign: "right", fontSize: "14px" }}>{this.state.presupuesto.fecha}</div>

                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "20px", backgroundColor: "#222", color: "#fff", padding: "10px", marginTop: "10px" }}>
                        PLAN DE TRATAMIENTO / PRESUPUESTO
                </div>

                <div style={{ fontWeight: "bold", textAlign: "center", marginTop: "10px" }}>
                        DR. ALEXANDER DE JESUS ABREU
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

                <button onClick={this.Imprimir} className='btn btn-success'>
                        <i className="fas fa-print me-1"></i> Imprimir
                </button>
                </div>
                </div>
                );


       }





}

export default VisualizarPresupuesto;