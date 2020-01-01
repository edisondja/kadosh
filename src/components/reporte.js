import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FuncionesExtras from './funciones_extras';
import FacturaInterfaz from './factura_interfaz';
import '../css/dashboard.css';

class Reporte extends React.Component{


        constructor(props){
            super(props);
            this.state={data:[],recibos:[],monto_total:0}
        }
    
        componentDidMount(){
               // this.cargar_recibos();
        }

        
        Imprimir(){
            var ficha = document.getElementById("reportes");
            var ventimp = window.open(' ', 'popimpr');
            ventimp.document.write(ficha.innerHTML);
            ventimp.document.close();
            ventimp.print();
            ventimp.close();
        }

        reportes=()=>{
            var fecha_inicial = document.getElementById('fecha_inicial').value;
            var fecha_final = document.getElementById('fecha_final').value;

           Axios.get(`${FuncionesExtras.url_base}/api/facturas_reportes/${fecha_inicial}/${fecha_final}`).then(data=>{

                this.setState({recibos:data.data.recibos,monto_total:data.data.monto_total});    

           }).catch(error=>{
                Alertify.error(error);
           })
        }
        
        render(){

            return (
                   <div className="col-md-8"><br/>
                       <h3>Reportes</h3><hr/>
                        <strong>Fecha Inicial</strong>&nbsp;
                        <input id="fecha_inicial"  type="date"/>&nbsp;
                        <strong>Fecha Final</strong>&nbsp;
                        <input id="fecha_final" type="date"/>&nbsp;
                        <button className="btn btn-primary" onClick={this.reportes}>Buscar</button>&nbsp;
                        <button className="btn btn-info" onClick={this.Imprimir}>Imprimir</button><br/><br/>
                        <div id="reportes" className="card interfaz_reporte">
                       <table className="table">
                        <tr>
                            <td>Codigo</td>
                            <td>Concepto de pago</td>
                            <td>Tipo de pago</td>
                            <td>Estado actual</td>
                            <td>Monto</td>
                            <td>Fecha de pago</td>
                        </tr>
                            {
                                this.state.recibos.map((data=>(
                                        
                                        <tr>
                                            <td>{data.codigo_recibo}</td>
                                            <td>{data.concepto_pago}</td>
                                            <td>{data.tipo_de_pago}</td>
                                            <td>{data.estado_actual}</td>
                                            <td>{data.monto}</td>
                                            <td>{data.fecha_pago}</td>
                                        </tr>
                                    
                                )))

                            }
                        </table>
                        </div>
                        <h4 style={{float:'right'}}>Ingresos total  {this.state.monto_total}</h4>

                   </div>
            )

        }

}

export default Reporte;