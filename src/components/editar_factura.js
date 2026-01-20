import React from 'react';
import Alertify from 'alertifyjs';
import Axios from 'axios';
import Core from './funciones_extras';
import '../css/dashboard.css';
import FacturaInterfaz from './factura_interfaz';
import {Link} from 'react-router-dom';

class FacturaEd extends React.Component{

        constructor(props){
            super(props);
            this.state = {
                data:[],
                factura:{},
                procedimientos_factura:[],
                total:0,
                procedimientos:[],
                opcion:false,
                mostrarModalCantidad: false,
                procedimientoSeleccionado: null,
                cantidadModal: '1',
                buscandoProcedimiento: ''
            };
        }

        componentDidMount(){
                Core.cargar_factura(this,this.props.match.params.id_factura);
                Core.cargar_procedimientos_de_factura(this,this.props.match.params.id_factura,"");
                Core.cargar_procedimientos(this,this.props.match.params.id_factura);
        }

        // Función para reproducir sonido al agregar procedimiento
        reproducirSonidoAgregar = () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
                console.log("Error al reproducir sonido:", error);
            }
        }

        buscar_procedimiento=(e)=> { 
            const buscar = e.target.value;
            this.setState({ buscandoProcedimiento: buscar });
            
            if (buscar.trim() === '') {
                this.setState({ procedimientos: [] });
                return;
            }

            Axios.get(`${Core.url_base}/api/buscar_procedimiento/${buscar}`).then(data=>{
                this.setState({procedimientos:data.data});
            }).catch(error=>{
                console.log("error al buscar procedimiento:", error);
            })
        }
        
        abrirModalCantidad = (procedimiento) => {
            this.setState({
                mostrarModalCantidad: true,
                procedimientoSeleccionado: procedimiento,
                cantidadModal: '1'
            });
        }

        cerrarModalCantidad = () => {
            this.setState({
                mostrarModalCantidad: false,
                procedimientoSeleccionado: null,
                cantidadModal: '1'
            });
        }

        agregar_procedimiento=()=>{
            if (!this.state.procedimientoSeleccionado) return;
            
            const cantidad = parseInt(this.state.cantidadModal) || 1;
            const valor_procedimiento = this.state.procedimientoSeleccionado.precio;
            const total = valor_procedimiento * cantidad;
            const id_factura = this.props.match.params.id_factura;
            const id_procedimiento = this.state.procedimientoSeleccionado.id;

            Axios.get(`${Core.url_base}/api/agregar_procedimiento_lista/${id_factura}/${id_procedimiento}/${total}/${cantidad}`).then(data=>{
                Alertify.success("Procedimiento agregado con éxito");
                this.reproducirSonidoAgregar();
                this.cerrarModalCantidad();
                this.componentDidMount();
            }).catch(error=>{
                Alertify.error("Error: no se pudo agregar el procedimiento a la factura");
                console.error(error);
            });
        }

        eliminar_procedimiento=(id_procedimiento,id_factura,totalidad)=>{

            Alertify.confirm("Eliminar procedimiento","¿Seguro que deseas eliminar este procedimiento de esta factura?",()=>{
                Axios.get(`${Core.url_base}/api/eliminar_procedimiento/lista/${id_procedimiento}/${id_factura}/${totalidad}`).then(data=>{
                    Alertify.success("Procedimiento eliminado con éxito");
                    this.componentDidMount();
                }).catch(error=>{
                    Alertify.error("Error al eliminar procedimiento");
                    console.error(error);
                })
            },()=>{
                // Cancelar
            });
        }

        retroceder=()=>{
            this.setState({
                opcion:'ver_factura'
            });
        }

        calcularTotal = () => {
            return this.state.procedimientos_factura.reduce((sum, proc) => sum + parseFloat(proc.total || 0), 0);
        }

        render(){

            if(this.state.opcion=='ver_factura'){
                return <FacturaInterfaz id_factura={this.props.match.params.id_factura} />
            }

            const totalFactura = this.calcularTotal();

            return(
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
                                <i className="fas fa-edit me-2"></i>Editar Factura
                            </h4>
                            <Link to={`/ver_factura/${this.props.match.params.id}/${this.props.match.params.id_factura}`}>
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

                        {/* Resumen Total */}
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
                                Total de la Factura
                            </h4>
                            <p style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>
                                RD$ {new Intl.NumberFormat().format(totalFactura.toFixed(2))}
                            </p>
                        </div>

                        <hr style={{ margin: '25px 0', borderColor: '#e0e0e0' }} />

                        {/* Lista de Procedimientos */}
                        <h2 style={{ marginBottom: '20px', fontWeight: 700, color: '#2d2d2f' }}>
                            <i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>Procedimientos en la Factura
                        </h2>
                        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                            <div className="card-body p-0">
                                {this.state.procedimientos_factura.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                        <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                        <p style={{ margin: 0, fontSize: '16px' }}>No hay procedimientos agregados</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0" style={{ margin: 0 }}>
                                            <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                                <tr>
                                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Procedimiento</th>
                                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Cantidad</th>
                                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Total</th>
                                                    <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Eliminar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.procedimientos_factura.map((data, index) => (
                                                    <tr 
                                                        key={data.id || index}
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
                                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                                            <button 
                                                                onClick={()=>this.eliminar_procedimiento(data.id_historial,data.id_factura,data.total)} 
                                                                className="btn btn-sm"
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
                                )}
                            </div>
                        </div>

                        <hr style={{ margin: '25px 0', borderColor: '#e0e0e0' }} />

                        {/* Agregar Procedimiento */}
                        <h2 style={{ marginBottom: '20px', fontWeight: 700, color: '#2d2d2f' }}>
                            <i className="fas fa-plus-circle me-2" style={{ color: '#28a745' }}></i>Agregar Procedimiento
                        </h2>
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                            <div className="card-body p-4">
                                    <div className="mb-4">
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            color: '#495057'
                                        }}>
                                            <i className="fas fa-search me-2" style={{ color: '#667eea' }}></i>
                                            Buscar Procedimiento
                                        </label>
                                        <input 
                                            type='text' 
                                            id="buscando"  
                                            onChange={this.buscar_procedimiento}
                                            value={this.state.buscandoProcedimiento}
                                            placeholder="Escriba el nombre del procedimiento..."
                                            className="form-control"
                                            style={{
                                                padding: '14px 18px',
                                                borderRadius: '12px',
                                                border: '2px solid #e0e0e0',
                                                fontSize: '15px',
                                                transition: 'all 0.2s ease',
                                                outline: 'none'
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

                                    {this.state.procedimientos.length > 0 && (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0" style={{ margin: 0 }}>
                                                <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                                    <tr>
                                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Procedimiento</th>
                                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Precio</th>
                                                        <th style={{ padding: '15px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Agregar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.procedimientos.map((data, index) => (
                                                        <tr 
                                                            key={data.id || index}
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
                                                            <td style={{ padding: '15px', color: '#2d2d2f' }}>
                                                                <strong>{data.nombre}</strong>
                                                            </td>
                                                            <td style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#28a745' }}>
                                                                RD$ {new Intl.NumberFormat().format(data.precio)}
                                                            </td>
                                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                                <button 
                                                                    onClick={()=>this.abrirModalCantidad(data)} 
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        padding: '6px 16px',
                                                                        fontWeight: 600,
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
                                                                    <i className="fas fa-plus me-1"></i>Agregar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {this.state.buscandoProcedimiento && this.state.procedimientos.length === 0 && (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                            <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                            <p style={{ margin: 0, fontSize: '16px' }}>No se encontraron procedimientos</p>
                                        </div>
                                    )}

                                    {!this.state.buscandoProcedimiento && (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                            <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                            <p style={{ margin: 0, fontSize: '16px' }}>Escriba en el campo de búsqueda para encontrar procedimientos</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal para cantidad */}
                            {this.state.mostrarModalCantidad && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 9999,
                                    backdropFilter: 'blur(5px)'
                                }} onClick={this.cerrarModalCantidad}>
                                    <div 
                                        className="card shadow-lg border-0"
                                        style={{
                                            borderRadius: '16px',
                                            maxWidth: '500px',
                                            width: '90%',
                                            background: 'white',
                                            animation: 'fadeIn 0.3s ease'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div 
                                            className="card-header border-0"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                borderRadius: '16px 16px 0 0',
                                                padding: '20px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h5 className="mb-0" style={{ fontWeight: 700, margin: 0 }}>
                                                    <i className="fas fa-plus-circle me-2"></i>Agregar Procedimiento
                                                </h5>
                                                <button
                                                    onClick={this.cerrarModalCantidad}
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
                                        <div className="card-body p-4">
                                            {this.state.procedimientoSeleccionado && (
                                                <>
                                                    <div className="mb-4" style={{
                                                        padding: '20px',
                                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                        borderRadius: '12px',
                                                        border: '2px solid rgba(102, 126, 234, 0.2)'
                                                    }}>
                                                        <p style={{ margin: 0, fontWeight: 600, color: '#495057', marginBottom: '8px' }}>
                                                            Procedimiento:
                                                        </p>
                                                        <h5 style={{ margin: 0, color: '#667eea', fontWeight: 700 }}>
                                                            {this.state.procedimientoSeleccionado.nombre}
                                                        </h5>
                                                        <p style={{ margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                                                            Precio unitario: <strong style={{ color: '#28a745' }}>
                                                                RD$ {new Intl.NumberFormat().format(this.state.procedimientoSeleccionado.precio)}
                                                            </strong>
                                                        </p>
                                                    </div>

                                                    <div className="mb-4">
                                                        <label style={{
                                                            display: 'block',
                                                            marginBottom: '10px',
                                                            fontWeight: 600,
                                                            fontSize: '15px',
                                                            color: '#495057'
                                                        }}>
                                                            <i className="fas fa-hashtag me-2" style={{ color: '#667eea' }}></i>
                                                            Cantidad <span style={{ color: '#dc3545' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={this.state.cantidadModal}
                                                            onChange={(e) => this.setState({ cantidadModal: e.target.value })}
                                                            className="form-control"
                                                            style={{
                                                                padding: '14px 18px',
                                                                borderRadius: '12px',
                                                                border: '2px solid #e0e0e0',
                                                                fontSize: '16px',
                                                                fontWeight: 600,
                                                                transition: 'all 0.2s ease',
                                                                outline: 'none'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#667eea';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e0e0e0';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>

                                                    {this.state.cantidadModal && !isNaN(this.state.cantidadModal) && parseInt(this.state.cantidadModal) > 0 && (
                                                        <div className="mb-4" style={{
                                                            padding: '15px',
                                                            background: '#f8f9fa',
                                                            borderRadius: '12px',
                                                            border: '1px solid #dee2e6'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 600, color: '#495057' }}>Total:</span>
                                                                <span style={{ fontWeight: 700, fontSize: '20px', color: '#667eea' }}>
                                                                    RD$ {new Intl.NumberFormat().format((this.state.procedimientoSeleccionado.precio * parseInt(this.state.cantidadModal || 1)).toFixed(2))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="card-footer border-0" style={{
                                            background: 'transparent',
                                            padding: '20px',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '10px'
                                        }}>
                                            <button
                                                onClick={this.cerrarModalCantidad}
                                                className="btn"
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
                                                onClick={this.agregar_procedimiento}
                                                disabled={!this.state.cantidadModal || isNaN(this.state.cantidadModal) || parseInt(this.state.cantidadModal) <= 0}
                                                className="btn"
                                                style={{
                                                    background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '12px 24px',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s ease',
                                                    opacity: (!this.state.cantidadModal || isNaN(this.state.cantidadModal) || parseInt(this.state.cantidadModal) <= 0) ? 0.5 : 1,
                                                    cursor: (!this.state.cantidadModal || isNaN(this.state.cantidadModal) || parseInt(this.state.cantidadModal) <= 0) ? 'not-allowed' : 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!e.target.disabled) {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <i className="fas fa-check me-2"></i>Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                </>
            );
        }
}

export default FacturaEd;
