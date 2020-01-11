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
                this.reportes(null);
        }

        
        Imprimir(){
            var ficha = document.getElementById("reportes");
            var ventimp = window.open(' ', 'popimpr');
            ventimp.document.write(ficha.innerHTML);
            ventimp.document.close();
            ventimp.print();
            ventimp.close();
        }

        reportes=(config='normal')=>{
            var fecha_inicial;
            var fecha_final;

            if(config=='normal'){
                fecha_inicial = document.getElementById('fecha_inicial').value;
                fecha_final = document.getElementById('fecha_final').value;
            }else {
                var f = new Date();
                fecha_inicial = f.getFullYear() + "-" + (f.getMonth() +1) + "-" + f.getDate();
                fecha_final = f.getFullYear() + "-" + (f.getMonth() +1) + "-" + f.getDate();
            }
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
                        <input id="fecha_final" type="date"/>&nbsp;<br/>
                        <br/><strong>ID PACIENTE</strong>&nbsp;
                        <input type="text" id="codigo_paciente" /><hr/>
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
                        <h4 style={{float:'right'}}>Ingresos total $RD {this.state.monto_total}</h4>

                   </div>
            )

        }

}

export default Reporte;