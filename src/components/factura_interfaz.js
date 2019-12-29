import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import ReactPrint from 'react-to-print';
import ImprimirRecibo from './imprimir_recibo';
import Url_base from './funciones_extras';
import '../css/dashboard.css';

class FacturaInterfaz extends React.Component{

    constructor(props){
        super(props);
        this.state={procedimientos_imprimir:[],config:'normal',data_factura:[],valor:true,factura:{precio_estatus:0,id:0},procedimientos:[],total:0,recibos:[],mensaje:""};
    }

    componentDidMount(){

        this.cargar_factura(this.props.id_factura);
        this.cargar_procedimientos(this.props.id_factura);
        this.cargar_recibos(this.props.id_factura);
    }

    cargar_procedimientos=(id_factura)=>{

        Axios.get(`${Url_base.url_base}/api/cargar_procedimientos_de_factura/${id_factura}`).then(data=>{

            this.setState({procedimientos:data.data});

        }).catch(error=>{
                console.log(error);
        });

    }
    
    cargar_recibos=(id_factura)=>{

        Axios.get(`${Url_base.url_base}/api/cargar_recibos/${id_factura}`).then(data=>{
                this.setState({recibos:data.data});
        }).catch(error=>{
                Alertify.error("error al cargar los recibos");
        });

    }
    
    descontar(id_factura){
            
        Alertify.prompt("Descuento manual","Digite la cantidad que le quiere descontar a la facutra.","",function(event,value){

                Axios.get(`${Url_base.url_base}/api/descontar_precio_factura/${id_factura}/${value}`).then(data=>{
                    Alertify.success("Descuento aplicado con exito");
                }).catch(error=>{
                    Alertify.error("No se pudo aplicar el descuento con exito");
                })

        },function(error){

            Alertify.message("Descuento cancelado...");
        });
        
    }

    imprimir_factura=(id_recibo,id_factura)=>{
            
        Axios.get(`${Url_base.url_base}/api/imprimir_recibo/${id_recibo}/${id_factura}`).then(data=>{
                this.setState({config:'imprimir_recibo',data_factura:data.data.recibo,procedimientos_imprimir:data.data.procedimientos});
        }).catch(error=>{
                Alertify.error("No se pudo imprimir el recibo");
        });

    }

    actualizar_recibo(id_recibo){
        
            Alertify.prompt("Autenticación","Para mayor seguiridad y poder tener acceso a editar el recibo digite su contraseña de administracion en este campo.","",function(event,value){

                alert(value);

            },function(error){

            }).set("type","password");

    }

    eliminar_recibo(id_recibo,id_factura){

        Alertify.confirm("Eliminar Recibo","Estas seguro que quieres eliminar este recibo?",function(){
                    Axios.get(`${Url_base.url_base}/api/eliminar_recibo/${id_recibo}/${id_factura}`).then(data=>{
                            Alertify.success("Recibo eliminado correctamente..");
                            document.getElementById(id_recibo).remove();
                    }).catch(error=>{
                            Alertify.error("No se pudo eliminar el recibo..");
                    });
        },function(){
                Alertify.message("BYE");
        });
    }

    procesar_pago=(id_factura,precio_estatus)=>{

            Alertify.confirm("Kadosh","Deseas realizar un pago de esta factura?",function(){
                            
                    Alertify.prompt("Pagando factura","<select id='seleccionar_pago'><option value='1'>EFECTIVO</option><option value='2'>TARGETA</option><option value='3'>CHEQUE</option></select> <p>Seleccione el tipo de pago</button>","$RD 00.00",function(event,value){
                        
                        let option = document.getElementById("seleccionar_pago").value;

                        if(option==1){

                            Axios.get(`${Url_base.url_base}/api/pagar_recibo/${id_factura}/${value}/efectivo/${precio_estatus}`).then(data=>{
                                            Alertify.success("Pago realizado con exito");
                                            this.setState({mensaje:data});
                            }).catch(error=>{
                                  Alertify.error("No se pudo procesar el pago correctamente");
                            });
                            
                        }else if(option==2){
                            Alertify.message("has seleccionado pago en targeta");

                        }else if(option==3){
                            Alertify.message("has seleccionado pago para cheques");
                        }else{
                            
                            Alertify.error("Numeracion de pago incorrecta");
                        }
                        
 
                    },function(){
                            Alertify.message("Pago cancelado");
                    }).set('type','text');

            },function(){

            });


    }

    cargar_factura=(id_factura)=>{
            
            Axios.get(`${Url_base.url_base}/api/cargar_factura/${id_factura}`).then(data=>{
                    this.setState({factura:data.data[0]});
            }).catch(error=>{
                    Alertify.message("No se pudo cargar la factura");
            });
    }   

    render(){
        if(this.state.config=='imprimir_recibo'){
        
               return  <ImprimirRecibo data_recibo={this.state.data_factura} procedimientos_i={this.state.procedimientos_imprimir}/>
        }

        return (<div className="col-md-4"> 
          
                <h2>Factura y sus detalles</h2>
                <h3>Estado actual <p style={{color:'#36b836'}}>$RD {this.state.factura.precio_estatus}</p></h3><hr/>
                <h4>Ingresado por: ({this.state.factura.nombre} {this.state.factura.apellido})</h4>
                <div>
                    <table className="table">
                        <tr>
                            <td>Nombre</td>
                            <td>Cantidad</td>
                            <td>Total</td>
                        </tr>
                    {  this.state.procedimientos.map((data=>(

                            <tr>
                                <td>{data.nombre}</td>
                                <td>{data.cantidad}</td>
                                <td>$RD {data.total}</td>
                                <td style={{display:'none'}}>{this.state.total+= data.total/2} </td>
                            </tr>
                      )))     
                    }
                    </table>
                    <button className="btn btn-success" onClick={()=>this.procesar_pago(this.props.id_factura,this.state.factura.precio_estatus)}>Pagar</button>&nbsp;
                    <button className="btn btn-primary" onClick={()=>this.descontar(this.props.id_factura)}>Descontar</button>&nbsp;
                    <button className="btn btn-dark">X</button><strong>&nbsp;&nbsp;&nbsp;TOTAL $RD {this.state.total}</strong> <hr/>
                    <h2>Pagos Realizados</h2>
                    <table className="table boxslider">
                        <tr>
                            <td>Monto</td>
                            <td>Concepto de pago</td>
                            <td>Tipo de pago</td>
                            <td>Editar</td>
                            <td>Eliminar</td>
                            <td>Imprimir</td>
                        </tr>
                           {
                               this.state.recibos.map((data=>(

                                    <tr id={this.data.id}>
                                        <td>{data.monto}</td>
                                        <td>{data.concepto_pago}</td>
                                        <td>{data.tipo_de_pago}</td>
                                        <td><button className="btn btn-primary" onClick={()=>this.actualizar_recibo(data.id)}>Actualizar</button></td>
                                        <td><button className="btn btn-success" onClick={()=>this.eliminar_recibo(data.id,this.props.id_factura)}>Eliminar</button></td>
                                        <td><button class="btn btn" onClick={()=>this.imprimir_factura(data.id,this.props.id_factura)}>Imprimir</button></td>
                                    </tr> 

                               )))

                           }
                            
                    </table>
                </div>

        </div>);
    }


}

export default FacturaInterfaz;