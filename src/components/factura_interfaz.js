import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import ReactPrint from 'react-to-print';
import ImprimirRecibo from './imprimir_recibo';
import Url_base from './funciones_extras';
import SweetAlert from 'sweetalert2-react';
import VerFacturas from './ver_facturas';
import ReactDOMServer from 'react-dom/server';
import {Redirect,Link} from 'react-router-dom';


import '../css/dashboard.css';

class FacturaInterfaz extends React.Component {

    constructor(props){
        super(props);
        this.state={descuentos_aplicados:0,contador:false,paciente:{},
        procedimientos_imprimir:[],config:'normal',data_factura:[],
        valor:true,factura:{precio_estatus:0,id:0}
        ,procedimientos:[],monto_total:0,recibos:[],mensaje:""};

        
    }

    componentDidMount(){


        this.cargar_factura(this.props.match.params.id_factura);
        this.cargar_procedimientos(this.props.match.params.id_factura);
        this.cargar_recibos(this.props.match.params.id_factura);
        Url_base.cargar_paciente(this,this.props.match.params.id);
        this.cargar_descuentos_de_facutra(this.props.match.params.id_factura,"solo_texto");
       // this.cargar_monto();
        Url_base.cargar_procedimientos_de_factura(this,this.props.match.params.id_factura);
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

eliminar_recibo(id_recibo, id_factura, monto) {
    Alertify.prompt(
        "Eliminar Factura",
        "Digite la contraseña admin para eliminar esta factura",
        "",
        (event, value) => {
            if (Url_base.password == value) {
                Alertify.confirm(
                    "Eliminar Recibo",
                    "¿Estás seguro que quieres eliminar este recibo?",
                    () => {
                        Axios.get(`${Url_base.url_base}/api/eliminar_recibo/${id_recibo}/${id_factura}`)
                            .then(data => {
                                Alertify.success("Recibo eliminado correctamente.");

                                // Recargar datos del componente
                                this.cargar_recibos(this.props.match.params.id_factura);
                                
                                // Actualizar precio en factura
                                this.setState(prevState => ({
                                    factura: {
                                        ...prevState.factura,
                                        precio_estatus: prevState.factura.precio_estatus + monto
                                    }
                                }));

                                // Si necesitas forzar actualización de otros elementos:
                                // this.cargar_factura(this.props.match.params.id_factura);
                                // o setState extra para forzar render
                            })
                            .catch(error => {
                                Alertify.error("No se pudo eliminar el recibo.");
                            });
                    },
                    () => {
                        Alertify.message("Operación cancelada.");
                    }
                );
            }
        },
        function (error) {
            Alertify.error("Cancelado o error al ingresar la contraseña.");
        }
    ).set('type', 'password');
}


    validar_pago(estado_actual,monto){

        var resultado = estado_actual - monto;
        
        if(resultado<0){
            Alertify.error("Erorr Pago excedido");
            
            return false;
        }

        return true;
    }

procesar_pago = (id_factura, precio_estatus) => {
    const monto_total = this.state.monto_total;
    const procedimientos = JSON.stringify(this.state.procedimientos);

   const enviarPago = (cantidad, concepto_pago, tipo_de_pago = '') => {
    const monto = parseFloat(cantidad.toString().replace(/[^0-9.-]+/g, ""));
    const procedimientos = this.state.procedimientos;


    Axios.post(`${Url_base.url_base}/api/pagar_recibo`, {
                id_factura,
                monto,
                tipo_de_pago:tipo_de_pago,
                estado_actual: precio_estatus,
                concepto_pago:concepto_pago,
                total: this.state.monto_total,
                procedimientos
            })
            .then(data => {
                Alertify.success("Pago realizado con éxito");
                this.setState({
                    mensaje: "Payment success",
                    factura: {
                        precio_estatus: this.state.factura.precio_estatus - monto
                    }
                });
                this.cargar_recibos(this.props.match.params.id_factura);
            })
            .catch(error => {
                console.error(error.response?.data || error);
                Alertify.error("No se pudo procesar el pago correctamente");
                this.setState({ mensaje: error.message || error.toString() });
            });
        };


   Alertify.prompt(
    "Pagando factura",
    `
    <select id='seleccionar_pago'>
        <option value='1'>EFECTIVO</option>
        <option value='2'>TARJETA</option>
        <option value='3'>TRANSFERENCIA</option>
        <option value='4'>CHEQUE</option>
        <option value='5'>PAGO MIXTO</option>
    </select>
    <p>Seleccione el tipo de pago</p>
    `,
    "$RD 00.00",
    async (event, value) => {
        const option = document.getElementById("seleccionar_pago").value;

        switch (option) {
            case '1': // EFECTIVO
                enviarPago(value, 'efectivo', 'ef');
                break;

            case '2': { // TARJETA
                const codigo_tarjeta = prompt("Digite el código de la tarjeta", "xxxx-xxxx-xxxx");
                const cantidad_tarjeta = prompt("Ingrese la cantidad que se pagó con tarjeta", "$RD 0.00");
                Alertify.message("Código: " + codigo_tarjeta);
                enviarPago(cantidad_tarjeta,"tarjeta" ,'tj');
                break;
            }

            case '3': // TRANSFERENCIA
                enviarPago(value, 'transferencia', 'ts');
                break;

            case '4': // CHEQUE
                enviarPago(value, 'cheque', 'ch');
                break;

            case '5': { // PAGO MIXTO
                const monto_efectivo = prompt("Ingrese el monto pagado en efectivo", "$RD 0.00");
                const monto_tarjeta = prompt("Ingrese el monto pagado con tarjeta", "$RD 0.00");

                const efectivo = parseFloat(monto_efectivo.replace(/[^0-9.-]+/g, ""));
                const tarjeta = parseFloat(monto_tarjeta.replace(/[^0-9.-]+/g, ""));

                const monto_total = efectivo + tarjeta;

                if (monto_total > 0) {

                    const formatoPeso = new Intl.NumberFormat('es-DO', {
                        style: 'currency',
                        currency: 'DOP',
                        minimumFractionDigits: 2
                    });

                    const descripcion_extra = `Pago Mixto / ${formatoPeso.format(efectivo)} en efectivo / en tarjeta ${formatoPeso.format(tarjeta)}`;
                    enviarPago(monto_total, descripcion_extra,'mxt') ;
                }
                break;
            }

            default:
                Alertify.error("Método de pago no reconocido");
                break;
        }
    },
    () => {
        Alertify.message("Pago cancelado");
    }
).set('type', 'text');

};



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
        
               return  <ImprimirRecibo id_paciente={this.props.match.params.id} data_recibo={this.state.data_factura} procedimientos_i={this.state.procedimientos_imprimir}/>
        
            }else if(this.state.config=="ver_facturas"){

               return (
                    <Redirect
                    to={`/ver_facturas/${this.props.match.params.id}/${this.props.match.params.id_doc}`}
                    />);
            
            }else if(this.state.config=="editar_factura"){

               // return <EditarFactura id_factura={this.props.id_factura}/>


                  return (
                    <Redirect
                    to={`/editar_factura/${this.props.match.params.id}/${this.props.match.params.id_doc}`}
                    />);
            }

        return (<div className="col-md-10 mac-style-container">
                <h4>
                    Factura y sus detalles

                    <Link to={`/ver_facturas/${this.props.match.params.id}`}>   
                        <button className="btn btn-primary" onClick={this.retroceder} style={{ float: 'right' }}>
                            Retroceder
                        </button>
                    </Link>
                  
                </h4>
                <h4>
                    Estado actual <p className="mac-style-highlight" id="estado_actual">$RD {this.state.factura.precio_estatus}</p>
                </h4>
                <hr />
                <h5>
                    Estudiante: ({this.state.paciente.nombre} {this.state.paciente.apellido}) &nbsp;&nbsp;&nbsp;&nbsp;
                    Curso: ({this.state.factura.nombre} {this.state.factura.apellido})
                </h5>

                <table className="table">
                    <thead>
                    <tr>
                        <th>Procedimiento</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.procedimientos.map((data) => (
                        <tr key={data.nombre}>
                        <td>{data.nombre}</td>
                        <td>{data.cantidad}</td>
                        <td>$RD {new Intl.NumberFormat().format(data.total)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="2"><strong>Total</strong></td>
                        <td><strong>$RD {new Intl.NumberFormat().format(this.state.monto_total)}</strong></td>
                    </tr>
                    </tbody>
                </table>

                <div className="my-3">
                    <button className="btn btn-success" onClick={() => this.procesar_pago(this.props.match.params.id_factura, this.state.factura.precio_estatus)}>Pagar</button>&nbsp;
                    <button className="btn btn-primary" onClick={() => this.descontar(this.props.match.params.id_factura)}>Descontar</button>&nbsp;
                    
                    <Link to={`/editar_factura/${this.props.match.params.id}/${this.props.match.params.id_factura}`}>
                        <button className="btn btn-dark" >Editar</button>&nbsp;
                    </Link>
                    
                    <button className="btn btn-dark" onClick={() => this.cargar_descuentos_de_facutra(this.props.match.params.id_factura)}>Ver descuentos</button>
                </div>

                <hr /><br />
                <h2>Pagos Realizados</h2>
                <div className="mac-style-count">
                    Cantidad de descuentos aplicados en esta factura ({this.state.descuentos_aplicados})
                </div>

                <div className="tableflow">
                    <table className="table boxslider">
                    <thead>
                        <tr>
                        <th>Monto</th>
                        <th>Concepto de pago</th>
                        <th>Tipo de pago</th>
                        <th>Fecha de pago</th>
                        <th>Imprimir</th>
                        <th>Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.recibos.map((data) => (
                        <tr key={data.id} id={data.id}>
                            <td>$RD {new Intl.NumberFormat().format(data.monto)}</td>
                            <td>{data.concepto_pago}</td>
                            <td>{data.tipo_de_pago}</td>
                            <td>{data.fecha_pago}</td>
                            <td>
                                <Link to={`/imprimir_recibo/${data.id}/${this.props.match.params.id_factura}`}>
                                    <button className="btn btn-success">Imprimir</button>
                                </Link>
                            </td> 
    
                            <td><button className="btn btn" onClick={() => this.eliminar_recibo(data.id, this.props.match.params.id_factura, data.monto)}>Eliminar</button></td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
                );
    }


}

export default FacturaInterfaz;