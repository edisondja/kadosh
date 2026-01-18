import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import { Link } from 'react-router-dom';
import VisualizarPresupuesto from './visualizar_presupuesto';

class Presupuestos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            presupuestos: [],
            mostrarVista: false,
            presupuestoSeleccionado: null,
            busqueda: ''
        };
    }

    componentDidMount() {
        this.cargarPresupuestos();
    }

    cargarPresupuestos = () => {
        Axios.get(`${Core.url_base}/api/listar_todos_presupuestos`)
            .then(response => {
                this.setState({ presupuestos: response.data || [] });
            })
            .catch(error => {
                console.error("Error al cargar presupuestos:", error);
                Alertify.error("Error al cargar los presupuestos");
            });
    }

    verPresupuesto = (presupuesto) => {
        this.setState({
            mostrarVista: true,
            presupuestoSeleccionado: presupuesto
        });
    }

    volverLista = () => {
        this.setState({
            mostrarVista: false,
            presupuestoSeleccionado: null
        });
    }

    eliminarPresupuesto = (presupuestoId, nombre) => {
        Alertify.confirm(
            'Eliminar Presupuesto',
            `¿Está seguro que desea eliminar el presupuesto "${nombre}"?`,
            () => {
                Axios.post(`${Core.url_base}/api/eliminar_presupuesto`, {
                    presupuesto_id: presupuestoId
                })
                .then(response => {
                    Alertify.success("Presupuesto eliminado correctamente");
                    this.cargarPresupuestos();
                })
                .catch(error => {
                    console.error("Error al eliminar presupuesto:", error);
                    Alertify.error("Error al eliminar el presupuesto");
                });
            },
            () => {}
        );
    }

    buscarPresupuesto = (e) => {
        const busqueda = e.target.value.toLowerCase();
        this.setState({ busqueda });
    }

    render() {
        const { presupuestos, mostrarVista, presupuestoSeleccionado, busqueda } = this.state;

        // Filtrar presupuestos por búsqueda
        const presupuestosFiltrados = presupuestos.filter(p => 
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.paciente && (
                p.paciente.nombre.toLowerCase().includes(busqueda) ||
                (p.paciente.apellido && p.paciente.apellido.toLowerCase().includes(busqueda))
            ))
        );

        if (mostrarVista && presupuestoSeleccionado) {
            return (
                <VisualizarPresupuesto
                    id_paciente={presupuestoSeleccionado.paciente_id}
                    id_presupuesto={presupuestoSeleccionado.id}
                    nombre_presupuesto={presupuestoSeleccionado.nombre}
                    onVolver={this.volverLista}
                />
            );
        }

        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
                <div className="col-md-10 mt-4" style={{ backgroundColor: '#f5f5f7', minHeight: '100vh', padding: '30px', borderRadius: '16px' }}>
                    {/* Header estilo macOS */}
                    <div className="card border-0 shadow-lg mb-4" style={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        overflow: 'hidden'
                    }}>
                        <div className="card-body text-white p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '15px',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '20px',
                                        fontSize: '28px'
                                    }}>
                                        <i className="fas fa-file-invoice-dollar"></i>
                                    </div>
                                    <div>
                                        <h3 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                            Presupuestos
                                        </h3>
                                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                            Gestiona todos los presupuestos del sistema
                                        </p>
                                    </div>
                                </div>
                                <Link to="/cargar_pacientes">
                                    <button 
                                        className="btn"
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            color: 'white',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'all 0.3s ease',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.3)';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.2)';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="fas fa-plus me-2"></i>Crear Presupuesto
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body p-3">
                            <div className="input-group">
                                <span className="input-group-text" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px 0 0 12px'
                                }}>
                                    <i className="fas fa-search"></i>
                                </span>
                                <input 
                                    type='text' 
                                    onChange={this.buscarPresupuesto} 
                                    className='form-control' 
                                    placeholder='Buscar presupuesto por nombre o paciente...' 
                                    style={{
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '0 12px 12px 0',
                                        padding: '12px 16px',
                                        fontSize: '15px',
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
                        </div>
                    </div>

                    {/* Lista de presupuestos estilo macOS */}
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body p-0">
                            {presupuestosFiltrados.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-file-invoice-dollar fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                                    <h5 className="text-muted mb-2">
                                        {busqueda ? 'No se encontraron presupuestos' : 'No hay presupuestos registrados'}
                                    </h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                        {busqueda ? 'Intenta con otra búsqueda' : 'Crea un nuevo presupuesto desde el perfil de un paciente'}
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ 
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            <tr>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Nombre</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Paciente</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Fecha Creado</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none',
                                                    textAlign: 'center'
                                                }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {presupuestosFiltrados.map(data => (
                                                <tr 
                                                    key={data.id}
                                                    style={{ 
                                                        transition: 'all 0.2s ease',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                    }}
                                                >
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#495057' }}>
                                                        {data.nombre}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                        {data.paciente ? `${data.paciente.nombre} ${data.paciente.apellido || ''}` : 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#6c757d', fontSize: '14px' }}>
                                                        {data.created_at ? new Date(data.created_at).toLocaleDateString('es-ES', { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : '-'}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                        <div className="d-flex justify-content-center" style={{ gap: '10px' }}>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => this.verPresupuesto(data)}
                                                                title="Ver presupuesto"
                                                                style={{
                                                                    background: '#17a2b8',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'scale(1.1)';
                                                                    e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = 'scale(1)';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            {data.paciente_id && data.doctor_id && (
                                                                <Link to={`/editar_presupuesto/${data.paciente_id}/${data.id}/${data.doctor_id}`}>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        title="Editar presupuesto"
                                                                        style={{
                                                                            background: '#ffc107',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '8px',
                                                                            padding: '6px 12px',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.transform = 'scale(1.1)';
                                                                            e.target.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.3)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.transform = 'scale(1)';
                                                                            e.target.style.boxShadow = 'none';
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-edit"></i>
                                                                    </button>
                                                                </Link>
                                                            )}
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => this.eliminarPresupuesto(data.id, data.nombre)}
                                                                title="Eliminar presupuesto"
                                                                style={{
                                                                    background: '#dc3545',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'scale(1.1)';
                                                                    e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = 'scale(1)';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Presupuestos;
