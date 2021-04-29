import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FuncionesExtras from './funciones_extras';
import FacturaInterfaz from './factura_interfaz';
import '../css/dashboard.css';
import { Doughnut,Bar} from 'react-chartjs-2';

class Reporte extends React.Component{ds


        constructor(props){
            super(props);
            this.state={data:[],contador:false,recibos:[],monto_total:0,valor:89,semena:[],Lunes:200,Martes:0,Miercoles:0,Jueves:0,Viernes:0,Sabado:0
           }
        }

        chartReference = {};
    
        componentDidMount(){
                console.log(this.chartReference);
                this.consultarDataSemana();
                this.reportes('normal');
               // this.setState({Lunes:this.state.semana[0].monto});
            
               // this.calcular_ingreso_semanal(this.state.recibos_semana);

               // console.log(this.state.recibos_semana);
        }

        ver_reportes=()=>{

            if(this.state.contador==true){
                document.getElementById('graficos').setAttribute('style','diplay');
                this.setState({contador:false});
                document.getElementById('boton_reportes').textContent='Reportes';


            }else{
            document.getElementById('graficos').setAttribute('style','display:none');
            document.getElementById('boton_reportes').textContent='Graficos';
            this.setState({contador:true});
            }

        }

        consultarDataSemana=(config='hoy')=>{
            let url= "";
                if(config=='hoy'){
                        
                    url =  `${FuncionesExtras.url_base}/api/ingresos_de_semana/hoy`;
                
                }else{
                    let fecha_semana = document.getElementById("fecha_semana").value;
                    url =  `${FuncionesExtras.url_base}/api/ingresos_de_semana/${fecha_semana}`;

                }

                Axios.get(`${url}`).then(data=>{  
                 //  this.setState({Lunes:data.data.Monday[0].monto});
                 this.setState({
                    Lunes:data.data.lunes,
                    Martes:data.data.martes,
                    Miercoles:data.data.miercoles,
                    Jueves:data.data.jueves,
                    Viernes:data.data.viernes,
                    Sabado:data.data.sabado
                  });


                }).catch(error=>{
                        Alertify.error("No se pudo cargar la data del mes");
                });
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
                var f = new Date();
                fecha_inicial = f.getFullYear() + "-" + (f.getMonth() +1) + "-" +f.getDate();
                fecha_final = fecha_final;
            }else if(config=='consultar_fechas'){
                fecha_inicial = document.getElementById('fecha_inicial').value;
                fecha_final = document.getElementById('fecha_final').value;  
              
            }
           Axios.get(`${FuncionesExtras.url_base}/api/facturas_reportes/${fecha_inicial}/${fecha_final}`).then(data=>{

                this.setState({recibos:data.data.recibos,monto_total:data.data.monto_total});    

           }).catch(error=>{
                Alertify.error(error);
           })
        }
        
        render(){
            const data = {
                labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
                datasets: [
                  {
                    label: 'Detalles de ingreso de la semana',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [this.state.Lunes, this.state.Martes, this.state.Miercoles, this.state.Jueves, this.state.Viernes,this.state.Sabado]
                  }
                ]
              };

            return (
                   <div className="col-md-9"><br/><br/>
                        <pre><input type="date" className="form-control col-md-3" id="fecha_semana"/>
                            <strong>Ingrese la fecha de la semana que quieres consultar los ingreso</strong>
                           
                        </pre>
                        <button className="btn btn-primary" onClick={()=>this.consultarDataSemana(true)}>Buscar</button>
                        <strong style={{float:'right'}}>Ingresos de hoy $RD  {new Intl.NumberFormat().format(this.state.monto_total)}</strong>
                        
                        <button className='btn btn-primary' id="boton_reportes" style={{marginLeft:30}} onClick={this.ver_reportes}>Ver Reportes</button>
                        <Bar  data={data} id="graficos"/>
                        
                        <h3>Reportes</h3><hr/>
                        <strong>Fecha Inicial</strong>&nbsp;
                        <input id="fecha_inicial"  type="date"/>&nbsp;
                        <strong>Fecha Final</strong>&nbsp;
                        <input id="fecha_final" type="date"/>&nbsp;<br/><hr/>
                        <button className="btn btn-primary" onClick={()=>this.reportes('consultar_fechas')}>Buscar</button>&nbsp;
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
                        <h4 style={{float:'right'}}>Ingresos total $RD  {new Intl.NumberFormat().format(this.state.monto_total)}</h4>

                   </div>
            )

        }

}

export default Reporte;