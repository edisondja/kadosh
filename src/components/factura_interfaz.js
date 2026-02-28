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
        this.state={
            descuentos_aplicados:0,
            descuentos:[],
            contador:false,
            paciente:{},
            procedimientos_imprimir:[],
            config:'normal',
            data_factura:[],
            valor:true,
            factura:{precio_estatus:0,id:0},
            procedimientos:[],
            monto_total:0,
            recibos:[],
            mensaje:"",
            // Estados para el modal de pago
            modal_pago_visible: false,
            tipo_pago: '1', // 1: Efectivo, 2: Tarjeta, 3: Transferencia, 4: Cheque, 5: Pago Mixto
            monto_pago: '',
            codigo_tarjeta: '',
            monto_efectivo: '',
            monto_tarjeta: '',
            id_factura_pago: null,
            precio_estatus_pago: 0
        };

        
    }

    // Función para reproducir sonido de caja registradora
    reproducirSonidoCajaRegistradora = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear una secuencia de sonidos que simula una caja registradora
            const beeps = [
                { frequency: 800, duration: 0.1, delay: 0 },
                { frequency: 1000, duration: 0.1, delay: 0.15 },
                { frequency: 1200, duration: 0.15, delay: 0.3 }
            ];

            beeps.forEach(beep => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = beep.frequency;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + beep.duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + beep.duration);
                }, beep.delay * 1000);
            });
        } catch (error) {
            // Si falla el audio, no hacer nada (silencioso)
            console.log('Audio no disponible');
        }
    };

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
            const self = this;
            Alertify.confirm("Descuento manual",`
        <input type='number' class='form-control col-md-5' id="descontar" placeholder='Digite el monto'>
        <hr/><textarea cols='30' class='form-control' id="comentario" placeholder='Comentario de descuento'></textarea>`,
        function(){
            let descuento = parseInt(document.getElementById('descontar').value, 10);
            let comentario = document.getElementById('comentario') ? document.getElementById('comentario').value : '';
            if (!descuento || isNaN(descuento)) {
                Alertify.warning("Ingrese un monto válido");
                return;
            }
            Axios.get(`${Url_base.url_base}/api/descontar_precio_factura/${id_factura}/${descuento}/${comentario || ''}`).then(()=>{
                Alertify.success("Descuento aplicado con éxito");
                self.setState({ factura: { ...self.state.factura, precio_estatus: self.state.factura.precio_estatus - descuento } });
                self.cargar_descuentos_de_facutra(id_factura, "solo_texto");
                self.cargar_factura(id_factura);
            }).catch((error)=>{
                Alertify.error("No se pudo aplicar el descuento");
                console.log(error);
            });
        }, function(){}).set('resizable',true).resizeTo(500,300);
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

this.setState({ descuentos: data.data || [] });
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
                this.setState({descuentos_aplicados:data.data.length, descuentos: data.data || []});
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
    // Obtener la clave secreta de la configuración
    Axios.get(`${Url_base.url_base}/api/configs`).then(configResponse => {
        const config = configResponse.data && configResponse.data.length > 0 ? configResponse.data[0] : null;
        const claveSecreta = config ? config.clave_secreta : null;

        if (!claveSecreta) {
            Alertify.error("No se ha configurado una clave secreta. Por favor configúrela primero en Configuración.");
            return;
        }

        Alertify.prompt(
            "Eliminar Recibo",
            "Digite la clave secreta para eliminar este recibo",
            "",
            (event, value) => {
                if (value === claveSecreta) {
                    Alertify.confirm(
                        "Eliminar Recibo",
                        "¿Estás seguro que quieres eliminar este recibo?",
                        () => {
                            const usuarioId = localStorage.getItem("id_usuario");
                            Axios.delete(`${Url_base.url_base}/api/eliminar_recibo/${id_recibo}/${id_factura}`, {
                                data: {
                                    clave_secreta: value,
                                    usuario_id: usuarioId
                                }
                            })
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
                } else {
                    Alertify.error("Clave secreta incorrecta");
                }
        },
        function (error) {
            Alertify.error("Cancelado o error al ingresar la clave secreta.");
        }
    ).set('type', 'password');
    }).catch(error => {
        Alertify.error("Error al cargar la configuración");
    });
}


    validar_pago(estado_actual,monto){

        var resultado = estado_actual - monto;
        
        if(resultado<0){
            Alertify.error("Erorr Pago excedido");
            
            return false;
        }

        return true;
    }

abrirModalPago = (id_factura, precio_estatus) => {
    this.setState({
        modal_pago_visible: true,
        id_factura_pago: id_factura,
        precio_estatus_pago: precio_estatus,
        tipo_pago: '1',
        monto_pago: '',
        codigo_tarjeta: '',
        monto_efectivo: '',
        monto_tarjeta: ''
    });
};

cerrarModalPago = () => {
    this.setState({
        modal_pago_visible: false,
        tipo_pago: '1',
        monto_pago: '',
        codigo_tarjeta: '',
        monto_efectivo: '',
        monto_tarjeta: ''
    });
};

procesar_pago = (id_factura, precio_estatus) => {
    this.abrirModalPago(id_factura, precio_estatus);
};

enviarPago = () => {
    const { id_factura_pago, precio_estatus_pago, tipo_pago, monto_pago, codigo_tarjeta, monto_efectivo, monto_tarjeta } = this.state;
    
    let monto = 0;
    let concepto_pago = '';
    let tipo_de_pago = '';

    switch (tipo_pago) {
        case '1': // EFECTIVO
            monto = parseFloat(monto_pago.toString().replace(/[^0-9.-]+/g, ""));
            if (!monto || monto <= 0) {
                Alertify.error("Por favor ingrese un monto válido");
                return;
            }
            concepto_pago = 'efectivo';
            tipo_de_pago = 'ef';
            break;

        case '2': // TARJETA
            monto = parseFloat(monto_pago.toString().replace(/[^0-9.-]+/g, ""));
            if (!monto || monto <= 0) {
                Alertify.error("Por favor ingrese un monto válido");
                return;
            }
            if (!codigo_tarjeta || codigo_tarjeta.trim() === '') {
                Alertify.error("Por favor ingrese el código de la tarjeta");
                return;
            }
            concepto_pago = `tarjeta - Código: ${codigo_tarjeta}`;
            tipo_de_pago = 'tj';
            break;

        case '3': // TRANSFERENCIA
            monto = parseFloat(monto_pago.toString().replace(/[^0-9.-]+/g, ""));
            if (!monto || monto <= 0) {
                Alertify.error("Por favor ingrese un monto válido");
                return;
            }
            concepto_pago = 'transferencia';
            tipo_de_pago = 'ts';
            break;

        case '4': // CHEQUE
            monto = parseFloat(monto_pago.toString().replace(/[^0-9.-]+/g, ""));
            if (!monto || monto <= 0) {
                Alertify.error("Por favor ingrese un monto válido");
                return;
            }
            concepto_pago = 'cheque';
            tipo_de_pago = 'ch';
            break;

        case '5': // PAGO MIXTO
            const efectivo = parseFloat(monto_efectivo.toString().replace(/[^0-9.-]+/g, ""));
            const tarjeta = parseFloat(monto_tarjeta.toString().replace(/[^0-9.-]+/g, ""));
            
            if (!efectivo || efectivo < 0) {
                Alertify.error("Por favor ingrese un monto válido en efectivo");
                return;
            }
            if (!tarjeta || tarjeta < 0) {
                Alertify.error("Por favor ingrese un monto válido en tarjeta");
                return;
            }
            
            monto = efectivo + tarjeta;
            if (monto <= 0) {
                Alertify.error("El monto total debe ser mayor a cero");
                return;
            }

            const formatoPeso = new Intl.NumberFormat('es-DO', {
                style: 'currency',
                currency: 'DOP',
                minimumFractionDigits: 2
            });

            concepto_pago = `Pago Mixto / ${formatoPeso.format(efectivo)} en efectivo / ${formatoPeso.format(tarjeta)} en tarjeta`;
            tipo_de_pago = 'mxt';
            break;

        default:
            Alertify.error("Método de pago no reconocido");
            return;
    }

    const usuarioId = localStorage.getItem("id_usuario");
    const procedimientos = this.state.procedimientos;

    Axios.post(`${Url_base.url_base}/api/pagar_recibo`, {
        id_factura: id_factura_pago,
        monto,
        tipo_de_pago: tipo_de_pago,
        estado_actual: precio_estatus_pago,
        concepto_pago: concepto_pago,
        total: this.state.monto_total,
        procedimientos,
        usuario_id: usuarioId
    })
    .then(data => {
        // Reproducir sonido de caja registradora
        this.reproducirSonidoCajaRegistradora();
        Alertify.success("Pago realizado con éxito");
        this.setState({
            mensaje: "Payment success",
            factura: {
                precio_estatus: this.state.factura.precio_estatus - monto
            },
            modal_pago_visible: false
        });
        this.cargar_recibos(this.props.match.params.id_factura);
        this.cargar_factura(this.props.match.params.id_factura);
    })
    .catch(error => {
        console.error(error.response?.data || error);
        Alertify.error("No se pudo procesar el pago correctamente");
        this.setState({ mensaje: error.message || error.toString() });
    });
};



    editar_factura=()=>{
        this.setState({config:'editar_factura'});
    }

    eliminar_descuento(id_descuento){
        Axios.post(`${Url_base.url_base}/api/eliminar_descuento`, { id_descuento: id_descuento })
            .then(() => {
                Alertify.message("Descuento borrado con éxito");
            })
            .catch(() => {
                Alertify.error("Error al eliminar descuento");
            });
    }

    eliminar_descuento_factura = (id_descuento) => {
        Alertify.confirm("Eliminar descuento", "¿Está seguro de eliminar este descuento?", () => {
            Axios.post(`${Url_base.url_base}/api/eliminar_descuento`, { id_descuento: id_descuento })
                .then(() => {
                    Alertify.success("Descuento eliminado");
                    this.cargar_descuentos_de_facutra(this.props.match.params.id_factura, "solo_texto");
                    this.cargar_factura(this.props.match.params.id_factura);
                })
                .catch(() => {
                    Alertify.error("Error al eliminar descuento");
                });
        }, function() {});
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

        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
                <div className="col-md-10" style={{ margin: '0 auto', padding: '20px' }}>
                    {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                }}>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>
                        <i className="fas fa-file-invoice-dollar me-2"></i>Factura y sus detalles
                    </h4>
                    <Link to={`/ver_facturas/${this.props.match.params.id}`}>
                        <button 
                            className="btn"
                            onClick={this.retroceder}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                        >
                            <i className="fas fa-arrow-left me-2"></i>Retroceder
                        </button>
                    </Link>
                </div>

                {/* Estado Actual */}
                <div style={{
                    marginBottom: '25px',
                    padding: '20px',
                    background: this.state.factura.precio_estatus > 0 
                        ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                        : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <h4 style={{ margin: 0, marginBottom: '10px', fontWeight: 600 }}>
                        Estado actual
                    </h4>
                    <p id="estado_actual" style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>
                        RD$ {new Intl.NumberFormat().format(this.state.factura.precio_estatus || 0)}
                    </p>
                </div>

                <hr style={{ margin: '25px 0', borderColor: '#e0e0e0' }} />

                {/* Información Paciente y Doctor */}
                <h5 style={{ marginBottom: '20px', fontWeight: 600, color: '#2d2d2f' }}>
                    Paciente: ({this.state.paciente.nombre} {this.state.paciente.apellido}) &nbsp;&nbsp;&nbsp;&nbsp;
                    Doctor: ({this.state.factura.nombre || 'N/A'} {this.state.factura.apellido || ''})
                </h5>

                {/* Tabla de Procedimientos */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0" style={{ margin: 0 }}>
                            <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                <tr>
                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Procedimiento</th>
                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Cantidad</th>
                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.procedimientos.map((data, index) => (
                                    <tr 
                                        key={data.nombre || index}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <td style={{ padding: '15px', color: '#2d2d2f' }}>{data.nombre}</td>
                                        <td style={{ padding: '15px', textAlign: 'center', color: '#495057' }}>{data.cantidad}</td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#28a745' }}>
                                            RD$ {new Intl.NumberFormat().format(data.total)}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
                                    <td colSpan="2" style={{ padding: '15px', fontWeight: 700, fontSize: '16px' }}><strong>Total</strong></td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 700, fontSize: '18px', color: '#667eea' }}>
                                        <strong>RD$ {new Intl.NumberFormat().format(this.state.monto_total)}</strong>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ marginBottom: '25px' }}>
                    <button 
                        className="btn"
                        onClick={() => this.procesar_pago(this.props.match.params.id_factura, this.state.factura.precio_estatus)}
                        disabled={this.state.factura.precio_estatus <= 0}
                        style={{
                            background: this.state.factura.precio_estatus <= 0 
                                ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
                                : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 600,
                            marginRight: '10px',
                            opacity: this.state.factura.precio_estatus <= 0 ? 0.5 : 1,
                            cursor: this.state.factura.precio_estatus <= 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (this.state.factura.precio_estatus > 0) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <i className="fas fa-money-bill-wave me-2"></i>Pagar
                    </button>
                    <button 
                        className="btn"
                        onClick={() => this.descontar(this.props.match.params.id_factura)}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 600,
                            marginRight: '10px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <i className="fas fa-percent me-2"></i>Descontar
                    </button>
                    <Link to={`/editar_factura/${this.props.match.params.id}/${this.props.match.params.id_factura}`}>
                        <button 
                            className="btn"
                            style={{
                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: 600,
                                marginRight: '10px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(45, 45, 47, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <i className="fas fa-edit me-2"></i>Editar
                        </button>
                    </Link>
                    <button 
                        className="btn"
                        onClick={() => this.cargar_descuentos_de_facutra(this.props.match.params.id_factura, 'solo_texto')}
                        style={{
                            background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <i className="fas fa-sync-alt me-2"></i>Actualizar descuentos ({this.state.descuentos_aplicados})
                    </button>
                </div>

                <hr style={{ margin: '25px 0', borderColor: '#e0e0e0' }} />

                {/* Historial de descuentos - Siempre visible en la factura */}
                <h2 style={{ marginBottom: '20px', fontWeight: 700, color: '#2d2d2f' }}>
                    <i className="fas fa-tags me-2" style={{ color: '#667eea' }}></i>Historial de descuentos
                </h2>
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', marginBottom: '24px' }}>
                    <div className="card-body p-0">
                        {this.state.descuentos && this.state.descuentos.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0" style={{ margin: 0 }}>
                                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                        <tr>
                                            <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Monto de descuento</th>
                                            <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Comentario</th>
                                            <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Fecha</th>
                                            <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.descuentos.map((d) => (
                                            <tr 
                                                key={d.id} 
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    borderBottom: '1px solid #f0f0f0'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                <td style={{ padding: '15px', fontWeight: 600, color: '#dc3545' }}>
                                                    RD$ {new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2 }).format(d.monto)}
                                                </td>
                                                <td style={{ padding: '15px', color: '#495057' }}>{d.comentario || '—'}</td>
                                                <td style={{ padding: '15px', color: '#6c757d' }}>
                                                    {d.created_at ? new Date(d.created_at).toLocaleDateString('es-DO', { dateStyle: 'short' }) : '—'}
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm"
                                                        onClick={() => this.eliminar_descuento_factura(d.id)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px 16px',
                                                            fontWeight: 600,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <i className="fas fa-trash me-1"></i>Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted mb-0 p-4" style={{ fontSize: '15px' }}>
                                <i className="fas fa-info-circle me-2"></i>No hay descuentos aplicados en esta factura.
                            </p>
                        )}
                    </div>
                </div>

                {/* Pagos Realizados */}
                <h2 style={{ marginBottom: '20px', fontWeight: 700, color: '#2d2d2f' }}>
                    <i className="fas fa-receipt me-2" style={{ color: '#667eea' }}></i>Pagos Realizados
                </h2>
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0" style={{ margin: 0 }}>
                                <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                    <tr>
                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Monto</th>
                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Concepto de pago</th>
                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Tipo de pago</th>
                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Fecha de pago</th>
                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Imprimir</th>
                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.recibos.map((data, index) => (
                                        <tr 
                                            key={data.id} 
                                            id={data.id}
                                            style={{
                                                transition: 'all 0.2s ease',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: 600, color: '#28a745' }}>
                                                RD$ {new Intl.NumberFormat().format(data.monto)}
                                            </td>
                                            <td style={{ padding: '15px', color: '#495057' }}>{data.concepto_pago || 'N/A'}</td>
                                            <td style={{ padding: '15px', color: '#495057' }}>{(data.tipo_de_pago || 'N/A').replace(/tarjeto/i, 'tarjeta')}</td>
                                            <td style={{ padding: '15px', color: '#6c757d' }}>{data.fecha_pago || 'N/A'}</td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <Link to={`/imprimir_recibo/${data.id}/${this.props.match.params.id_factura}/${this.props.match.params.id}/${this.state.factura.id}`}>
                                                    <button 
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px 16px',
                                                            fontWeight: 600,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <i className="fas fa-print me-1"></i>Imprimir
                                                    </button>
                                                </Link>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <button 
                                                    className="btn btn-sm"
                                                    onClick={() => this.eliminar_recibo(data.id, this.props.match.params.id_factura, data.monto)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '6px 16px',
                                                        fontWeight: 600,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <i className="fas fa-trash me-1"></i>Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal de Pago */}
                {this.state.modal_pago_visible && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999,
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={this.cerrarModalPago}
                    >
                        <div 
                            className="card border-0 shadow-lg"
                            style={{
                                width: '90%',
                                maxWidth: '500px',
                                borderRadius: '16px',
                                background: 'white',
                                animation: 'fadeIn 0.3s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div 
                                className="card-header border-0"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '16px 16px 0 0',
                                    padding: '20px',
                                    color: 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h5 className="mb-0" style={{ fontWeight: 700, margin: 0 }}>
                                        <i className="fas fa-money-bill-wave me-2"></i>Procesar Pago
                                    </h5>
                                    <button
                                        onClick={this.cerrarModalPago}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            border: 'none',
                                            color: 'white',
                                            borderRadius: '8px',
                                            width: '32px',
                                            height: '32px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontSize: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: '25px' }}>
                                {/* Tipo de Pago */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: 600, color: '#495057', marginBottom: '10px', display: 'block' }}>
                                        <i className="fas fa-credit-card me-2" style={{ color: '#667eea' }}></i>Tipo de Pago
                                    </label>
                                    <select
                                        className="form-control"
                                        value={this.state.tipo_pago}
                                        onChange={(e) => this.setState({ tipo_pago: e.target.value, monto_pago: '', codigo_tarjeta: '', monto_efectivo: '', monto_tarjeta: '' })}
                                        style={{
                                            padding: '18px 20px',
                                            borderRadius: '8px',
                                            border: '2px solid #e0e0e0',
                                            fontSize: '17px',
                                            fontWeight: 500,
                                            minHeight: '64px',
                                            height: 'auto',
                                            lineHeight: '1.6',
                                            transition: 'all 0.2s ease',
                                            background: 'white'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="1">EFECTIVO</option>
                                        <option value="2">TARJETA</option>
                                        <option value="3">TRANSFERENCIA</option>
                                        <option value="4">CHEQUE</option>
                                        <option value="5">PAGO MIXTO</option>
                                    </select>
                                </div>

                                {/* Monto Principal (para todos excepto pago mixto) */}
                                {this.state.tipo_pago !== '5' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '10px', display: 'block' }}>
                                            <i className="fas fa-dollar-sign me-2" style={{ color: '#28a745' }}></i>Monto a Pagar
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="RD$ 0.00"
                                            value={this.state.monto_pago}
                                            onChange={(e) => this.setState({ monto_pago: e.target.value })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '15px',
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Código de Tarjeta (solo para tarjeta) */}
                                {this.state.tipo_pago === '2' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '10px', display: 'block' }}>
                                            <i className="fas fa-hashtag me-2" style={{ color: '#667eea' }}></i>Código de Tarjeta
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="xxxx-xxxx-xxxx"
                                            value={this.state.codigo_tarjeta}
                                            onChange={(e) => this.setState({ codigo_tarjeta: e.target.value })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '15px',
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Montos para Pago Mixto */}
                                {this.state.tipo_pago === '5' && (
                                    <>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '10px', display: 'block' }}>
                                                <i className="fas fa-money-bill me-2" style={{ color: '#28a745' }}></i>Monto en Efectivo
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="RD$ 0.00"
                                                value={this.state.monto_efectivo}
                                                onChange={(e) => this.setState({ monto_efectivo: e.target.value })}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
                                                    fontSize: '15px',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '10px', display: 'block' }}>
                                                <i className="fas fa-credit-card me-2" style={{ color: '#667eea' }}></i>Monto en Tarjeta
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="RD$ 0.00"
                                                value={this.state.monto_tarjeta}
                                                onChange={(e) => this.setState({ monto_tarjeta: e.target.value })}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
                                                    fontSize: '15px',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Información del Estado Actual */}
                                <div style={{
                                    marginBottom: '20px',
                                    padding: '15px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: '#495057' }}>Estado Actual:</span>
                                        <span style={{ fontWeight: 700, color: '#667eea', fontSize: '18px' }}>
                                            RD$ {new Intl.NumberFormat().format(this.state.precio_estatus_pago || 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn"
                                        onClick={this.cerrarModalPago}
                                        style={{
                                            background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '12px 24px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>Cancelar
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={this.enviarPago}
                                        style={{
                                            background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '12px 24px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <i className="fas fa-check me-2"></i>Procesar Pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </>
        );
    }


}

export default FacturaInterfaz;