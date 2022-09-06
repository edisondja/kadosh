import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import ReactPrint from 'react-to-print';
import ImprimirRecibo from './imprimir_recibo';
import Url_base from './funciones_extras';
import SweetAlert from 'sweetalert2-react';
import VerFacturas from './ver_facturas';
import EditarFactura from './editar_factura';
import ReactDOMServer from 'react-dom/server';
import '../css/dashboard.css';

class FacturaInterfaz extends React.Component {

    constructor(props){
        super(props);
        this.state={descuentos_aplicados:0,contador:false,paciente:{},procedimientos_imprimir:[],config:'normal',data_factura:[],valor:true,factura:{precio_estatus:0,id:0},procedimientos:[],monto_total:0,recibos:[],mensaje:""};
    }

    componentDidMount(){

        this.cargar_factura(this.props.id_factura);
        this.cargar_procedimientos(this.props.id_factura);
        this.cargar_recibos(this.props.id_factura);
        Url_base.cargar_paciente(this,this.props.id_paciente);
        this.cargar_descuentos_de_facutra(this.props.id_factura,"solo_texto");
       // this.cargar_monto();
        Url_base.cargar_procedimientos_de_factura(this,this.props.id_factura);
    }

    cargar_monto=()=>{
       this.setState({monto_total:0});

    }


    cargar_procedimientos=(id_factura)=>{

        Axios.get(`${Url_base.url_base}/api/cargar_procedimientos_de_factura/${id_factura}`).then(data=>{

            this.setState({procedimientos:data.data});

        }).catch(error=>{
                console.log(error);
                Alertify.message("Reconectando...");
                this.cargar_descuentos_de_facutra(id_factura);

        });

    }
    
    cargar_recibos=(id_factura)=>{

        Axios.get(`${Url_base.url_base}/api/cargar_recibos/${id_factura}`).then(data=>{
                this.setState({recibos:data.data});
        }).catch(error=>{
                Alertify.error("error al cargar los recibos");
                Alertify.message("Reconectando ..");
                this.cargar_recibos(id_factura);
        });

    }
    
    descontar=(id_factura)=>{
            
        Alertify.confirm("Descuento manual",`
        <input type='number' class='form-control col-md-5' id="descontar" placeholder='Digite el monto'>
        <hr/><textarea cols='30' class='form-control' id="comentario" placeholder='Comentario de descuento'></textarea>`,
        
        function(e){

            let descuento = parseInt(document.getElementById('descontar').value);
            let comentario = document.getElementById('comentario').value;
            
           // var clock = this.validar_pago(this.state.factura.precio_estatus,descuento);

           // if(clock==true){
                Axios.get(`${Url_base.url_base}/api/descontar_precio_factura/${id_factura}/${descuento}/${comentario}`).then(data=>{
                    Alertify.success("Descuento aplicado con exito");
                    this.setState({factura:{precio_estatus:this.state.factura.precio_estatus-descuento}});

                }).catch(error=>{
                    //Alertify.error("No se pudo aplicar el descuento con exito");
                    console.log(error);
                })
           // }


        },function(e){



        }).set('resizable',true).resizeTo(500,300);



        
    }


    imprimir_factura=(id_recibo,id_factura)=>{
            
        Axios.get(`${Url_base.url_base}/api/imprimir_recibo/${id_recibo}/${id_factura}`).then(data=>{
                this.setState({config:'imprimir_recibo',data_factura:data.data.recibo,procedimientos_imprimir:data.data.procedimientos});
        }).catch(error=>{
                Alertify.error("No se pudo imprimir el recibo");
        });

    }

    cargar_descuentos_de_facutra(id_factura,config='generar_vista_descuento'){



        Axios.get(`${Url_base.url_base}/api/consultar_descuentos/${id_factura}`).then(data=>{
            let descuentos="";
            
            if(config=="generar_vista_descuento"){
                    data.data.forEach(data=>{

                            descuentos+=`
                                <tr id="fila${data.id}">
                                    <td>${Intl.NumberFormat('en-IN', {style: 'currency',currency: 'DOP', minimumFractionDigits: 2}).format(data.monto)}</td>
                                    <td>${data.comentario}</td>
                                    <td>${data.created_at}</td>
                                    <td><button class='btn-danger' id='${data.id}' value='${data.monto}'>Borrar</button></td>
                            </tr>`;
                            
                                
                    });

                    Alertify.confirm("Descuentos en esta factura",`<p style='color:#9319d3;'>Descuentos aplicados</p>
                    <div id="panel_descuento"><table class="table">
                        <tr>
                            <th>Monto de descuento</th>
                            <th>Comentario</th>
                            <th>Fecha</th>
                            <th>Eliminar</th>
                        </tr>
                        ${descuentos}
                    </table>
                    </div>
                    `,function(){},function(){}).set('resizable',true).resizeTo(500,500); 

                    
                    let panel_descuento = document.getElementById("panel_descuento");
                    let btn_borrar = panel_descuento.querySelectorAll(".btn-danger");

                    
                    btn_borrar.forEach(botones=>{


                            botones.addEventListener('click',function(e){

                                    /*---[e.target.id]:aqui se encuentra guardado el id del registro de descuento que 
                                        queremos eliminar.

                                    --[e.target.value]:En este atributo guardamos la cantidad del monto que se descuento para restablecerlo
                                    */
                                    let id_descuento_actual = e.target.id;

                                    Alertify.confirm("Borrar descuento","<hr/>Estas seguro que deseas eliminar este descuento?",function(){
                                        
                                        let descuento = {
                                            id_descuento:id_descuento_actual
                                        };
            
                                        Axios.post(`${Url_base.url_base}/api/eliminar_descuento`,descuento).then(data=>{
            
                                        //   document.getElementById(`fila${id_descuento_actual}`).remove();
            
                                            console.log(data);
                                            Alertify.message("Descuento eliminado");
            
                                        }).catch(error=>{
            
                                            Alertify.message("Error no se pudo eliminar el descuento");
            
                                        });

                                    },function(){});

                                

                            });
                        
            });

        }else{

                this.setState({descuentos_aplicados:data.data.length});
        }

        }).catch(error=>{
 
            Alertify.error("Error al cargar descuentos de la factura");

        });


    }

    actualizar_recibo(id_recibo){
        
            Alertify.prompt("Autenticación","Para mayor seguiridad y poder tener acceso a editar el recibo digite su contraseña de administracion en este campo.","",function(event,value){

                alert(value);

            },function(error){

            }).set("type","password");

    }


    eliminar_recibo(id_recibo,id_factura,monto){


        Alertify.prompt("Eliminar Factura","Digite la contraseña admin para eliminar esta factura","",
        function(event,value){
                if(Url_base.password==value){
                            Alertify.confirm("Eliminar Recibo","Estas seguro que quieres eliminar este recibo?",()=>{
                                Axios.get(`${Url_base.url_base}/api/eliminar_recibo/${id_recibo}/${id_factura}`).then(data=>{
                                        Alertify.success("Recibo eliminado correctamente..");
                                            this.cargar_recibos(this.props.id_factura);
                                            this.setState({factura:{precio_estatus:this.state.factura.precio_estatus+monto}});
                                        }).catch(error=>{
                                    Alertify.error("No se pudo eliminar el recibo..");
                                });
                    },()=>{
                            Alertify.message("BYE");
                    });
    
                }
        },function(error){
    
        }).set('type','password');

     
    }

    validar_pago(estado_actual,monto){

        var resultado = estado_actual - monto;
        
        if(resultado<0){
            Alertify.error("Erorr Pago excedido");
            
            return false;
        }

        return true;
    }

    procesar_pago=(id_factura,precio_estatus)=>{


           // return console.log(this.state.procedimientos+" Monto:"+this.state.monto_total);
            let monto_total =this.state.monto_total;
            let procedimientos = this.state.procedimientos;
            procedimientos = JSON.stringify(procedimientos);
            

          //  return console.log(procedimientos);


            Alertify.confirm("Kadosh","Deseas realizar un pago de esta factura?",()=>{
                            
                    Alertify.prompt("Pagando factura",`<select id='seleccionar_pago'><option value='1'>EFECTIVO</option><option value='3'>TRANSFERENCIA</option><option value='2'>TARJETA</option><option value='3'>CHEQUE</option></select> <p>Seleccione el tipo de pago</button>`,"$RD 00.00",(event,value)=>{
                        
                        
                        let option = document.getElementById("seleccionar_pago").value;

                        if(option==1){
                            //let pay = this.validar_pago(this.state.factura.precio_estatus,value);

                           // if(pay==true){
                                Axios.get(`${Url_base.url_base}/api/pagar_recibo/${id_factura}/${value}/efectivo/${precio_estatus}/ef/${monto_total}/${procedimientos}`).then(data=>{
                                                Alertify.success("Pago realizado con exito");
                                                this.setState({mensaje:"Payment success",factura:{precio_estatus:this.state.factura.precio_estatus-value}});
                                                this.cargar_recibos(this.props.id_factura);
                                                console.log(data);

                                }).catch(error=>{
                                    Alertify.error("No se pudo procesar el pago correctamente");
                                    this.setState({mensaje:error});
                                });
                            //}
                            
                        }else if(option==2){
                            let codigo_targeta =prompt("Digite el codigo","x-x-x-x-x");

                                Alertify.message("Este es su codigo "+codigo_targeta);
                                
                                let cantidad_pagada = prompt("Ingrese la cantidad que se pago","$RD 0.00");
                              //  let pay = this.validar_pago(this.state.factura.precio_estatus,cantidad_pagada);
                             //   if(pay==true){
                                    Axios.get(`${Url_base.url_base}/api/pagar_recibo/${id_factura}/${cantidad_pagada}/tarjeta/${precio_estatus}/${codigo_targeta}/${monto_total}/${procedimientos}`).then(data=>{
                                        Alertify.success("Pago realizado con exito");
                                        this.setState({mensaje:"Payment success",factura:{precio_estatus:this.state.factura.precio_estatus-value}});
                                        this.cargar_recibos(this.props.id_factura);
                                    }).catch(error=>{
                                        Alertify.error("No se pudo procesar el pago correctamente");
                                        this.setState({mensaje:error});
                                    });
                             //   }
                        }else if(option==3){

                            Alertify.message("Usted selecciono pago por transferencia");

                           // let pay = this.validar_pago(this.state.factura.precio_estatus,value);

                            //if(pay==true){
                                Axios.get(`${Url_base.url_base}/api/pagar_recibo/${id_factura}/${value}/transferencia/${precio_estatus}/ts/${monto_total}/${procedimientos}`).then(data=>{
                                                Alertify.success("Pago realizado con exito");
                                                this.setState({mensaje:"Payment success",factura:{precio_estatus:this.state.factura.precio_estatus-value}});
                                                this.cargar_recibos(this.props.id_factura);
                                }).catch(error=>{
                                    Alertify.error("No se pudo procesar el pago correctamente");
                                    this.setState({mensaje:error});
                                });
                           // }




                        }else{
                            
                            Alertify.error("Numeracion de pago incorrecta");
                        }
                        
 
                    },function(){
                            Alertify.message("Pago cancelado");
                    }).set('type','text');

            },function(){

            });
    }

    editar_factura=()=>{
        this.setState({config:'editar_factura'});
    }

    eliminar_descuento(id_descuento){
    
       console.log(id_descuento);
        Axios.post({
            url:`${Url_base.url_base}/eliminar_descuento/`,
            method:'post',
            data:{
                id_descuento:id_descuento
            }
        }).then(data=>{
                Alertify.message("Descuento borrado con exito");
        }).catch(error=>{
                Alertify.error("Error al eliminar descuento");
        });


    }

    cargar_factura=(id_factura)=>{
            
            Axios.get(`${Url_base.url_base}/api/cargar_factura/${id_factura}`).then(data=>{
                    this.setState({factura:data.data[0]});
            }).catch(error=>{
                    Alertify.message("No se pudo cargar la factura");
                    Alertify.message("Reconectando...");
                    this.cargar_factura(id_factura);
            });
    }   

    retroceder=()=>{

        this.setState({config:'ver_facturas'});
    }

    render(){
            if(this.state.config=='imprimir_recibo'){
        
               return  <ImprimirRecibo id_paciente={this.props.id_paciente} data_recibo={this.state.data_factura} procedimientos_i={this.state.procedimientos_imprimir}/>
        
            }else if(this.state.config=="ver_facturas"){

                return <VerFacturas id_paciente={this.props.id_paciente} />
            
            }else if(this.state.config=="editar_factura"){

                return <EditarFactura id_factura={this.props.id_factura}/>
            }

        return (<div className="col-md-10"><br/> 
                <h4>Factura y sus detalles</h4><button className="btn btn-primary" onClick={this.retroceder} style={{float:'right'}}>Retroceder</button>
                <h4>Estado actual <p style={{color:'#36b836'}} id="estado_actual">$RD {this.state.factura.precio_estatus}</p></h4><hr/>
                <h5>Paciente: ({this.state.paciente.nombre} {this.state.paciente.apellido}) &nbsp;&nbsp;&nbsp;&nbsp; Doctor: ({this.state.factura.nombre} {this.state.factura.apellido})</h5>
                <div>
                    <table className="table">
                        <tr>
                            <td>Procedimiento</td>
                            <td>Cantidad</td>
                            <td>Total</td>
                        </tr>
                    {  this.state.procedimientos.map((data=>(

                            <tr>
                                <td>{data.nombre}</td>
                                <td>{data.cantidad}</td>
                                <td>$RD {new Intl.NumberFormat().format(data.total)}</td>
                            </tr>
                      )))     
                    }
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th>$RD {new Intl.NumberFormat().format(this.state.monto_total)}</th>
                    </tr>
                    </table>
                    <button className="btn btn-success" onClick={()=>this.procesar_pago(this.props.id_factura,this.state.factura.precio_estatus)}>Pagar</button>&nbsp;
                    <button className="btn btn-primary" onClick={()=>this.descontar(this.props.id_factura)}>Descontar</button>&nbsp;
                    <button className="btn btn-dark" onClick={this.editar_factura}>Editar</button><strong>&nbsp;&nbsp;&nbsp;</strong>
                    <button className="btn btn-dark" onClick={()=>this.cargar_descuentos_de_facutra(this.props.id_factura)}>Ver descuentos</button>  <hr/>
                        <hr/><br/><br/><h2>Pagos Realizados</h2>
                        <div><strong style={{color:'#e91d82',marginLeft:'30%'}}>Cantidad de descuentos aplicados en esta factura ({this.state.descuentos_aplicados})</strong><hr/></div>
                    <div className="tableflow">
                    <table className="table boxslider">
                        <tr>
                            <td>Monto</td>
                            <td>Concepto de pago</td>
                            <td>Tipo de pago</td>
                            <td>Fecha de pago</td>
                            <td>Imprimir</td>
                            <td>Eliminar</td>
                        </tr>
                           {
                               this.state.recibos.map((data=>(
                                   

                                    <tr id={data.id}>
                                        <td>$RD {new Intl.NumberFormat().format(data.monto)}</td>
                                        <td>{data.concepto_pago}</td>
                                        <td>{data.tipo_de_pago}</td>
                                        <td>{data.fecha_pago}</td>
                                        <td><button class="btn btn-success" onClick={()=>this.imprimir_factura(data.id,this.props.id_factura)}>Imprimir</button></td>
                                        <td><button className="btn btn" onClick={()=>this.eliminar_recibo(data.id,this.props.id_factura,data.monto)}>Eliminar</button></td>
                                    </tr> 

                               )))

                           }
                            
                    </table>
                    </div>
                </div>

        </div>);
    }


}

export default FacturaInterfaz;