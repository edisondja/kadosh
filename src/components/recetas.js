import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';
import jsPDF from 'jspdf';

class Recetas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recetas: [],
            mostrarFormulario: false,
            recetaActual: null,
            modoEdicion: false,
            medicamentos: [],
            mostrarEnviarEmail: false,
            emailDestino: ''
        };
    }

    componentDidMount() {
        if (this.props.idPaciente) {
            this.cargarRecetas();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.idPaciente !== this.props.idPaciente && this.props.idPaciente) {
            this.cargarRecetas();
        }
    }

    cargarRecetas = () => {
        Core.listar_recetas_paciente(this.props.idPaciente).then(data => {
            this.setState({ recetas: data });
        }).catch(error => {
            console.error("Error al cargar recetas:", error);
        });
    }

    abrirFormulario = (receta = null) => {
        this.setState({
            recetaActual: receta || {
                medicamentos: [],
                indicaciones: '',
                diagnostico: '',
                fecha: new Date().toISOString().split('T')[0]
            },
            medicamentos: receta ? [...receta.medicamentos] : [],
            mostrarFormulario: true,
            modoEdicion: receta !== null
        });
    }

    cerrarFormulario = () => {
        this.setState({
            mostrarFormulario: false,
            recetaActual: null,
            medicamentos: [],
            modoEdicion: false
        });
    }

    agregarMedicamento = () => {
        this.setState({
            medicamentos: [...this.state.medicamentos, {
                nombre: '',
                cantidad: '',
                dosis: '',
                frecuencia: '',
                duracion: ''
            }]
        });
    }

    actualizarMedicamento = (index, campo, valor) => {
        const medicamentos = [...this.state.medicamentos];
        medicamentos[index][campo] = valor;
        this.setState({ medicamentos });
    }

    eliminarMedicamento = (index) => {
        const medicamentos = this.state.medicamentos.filter((_, i) => i !== index);
        this.setState({ medicamentos });
    }

    guardarReceta = () => {
        const { recetaActual, medicamentos } = this.state;

        // Validar que hay un paciente
        if (!this.props.idPaciente) {
            Alertify.error("No se ha especificado un paciente");
            return;
        }

        // Validar que hay un doctor
        if (!this.props.idDoctor) {
            Alertify.error("No se ha especificado un doctor");
            return;
        }

        if (medicamentos.length === 0) {
            Alertify.error("Debe agregar al menos un medicamento");
            return;
        }

        // Validar que todos los medicamentos tengan los campos requeridos
        const medicamentosIncompletos = medicamentos.some(m => 
            !m.nombre || !m.cantidad || !m.dosis || !m.frecuencia || !m.duracion
        );

        if (medicamentosIncompletos) {
            Alertify.error("Complete todos los campos de los medicamentos");
            return;
        }

        // Validar que la fecha existe
        if (!recetaActual.fecha) {
            Alertify.error("Debe especificar una fecha para la receta");
            return;
        }

        const datos = {
            id_paciente: parseInt(this.props.idPaciente),
            id_doctor: parseInt(this.props.idDoctor || 1),
            medicamentos: medicamentos,
            indicaciones: recetaActual.indicaciones || '',
            diagnostico: recetaActual.diagnostico || '',
            fecha: recetaActual.fecha
        };

        console.log('Datos a enviar:', datos);

        if (this.state.modoEdicion) {
            Core.actualizar_receta(this.state.recetaActual.id, datos).then(() => {
                Alertify.success("Receta actualizada correctamente");
                this.cerrarFormulario();
                this.cargarRecetas();
            }).catch(error => {
                Alertify.error("Error al actualizar receta");
            });
        } else {
            Core.crear_receta(datos).then((response) => {
                Alertify.success(response.message || "Receta creada correctamente");
                this.cerrarFormulario();
                this.cargarRecetas();
            }).catch(error => {
                // El error ya se muestra en la función crear_receta
                console.error("Error al crear receta:", error);
            });
        }
    }

    eliminarReceta = (id) => {
        Alertify.confirm(
            "¿Está seguro de eliminar esta receta?",
            () => {
                Core.eliminar_receta(id).then(() => {
                    Alertify.success("Receta eliminada");
                    this.cargarRecetas();
                }).catch(error => {
                    Alertify.error("Error al eliminar receta");
                });
            }
        );
    }

    imprimirReceta = (id) => {
        window.open(`${Core.url_base}/api/ver_receta_pdf/${id}`, '_blank');
    }

    descargarReceta = (id) => {
        window.location.href = `${Core.url_base}/api/imprimir_receta/${id}`;
    }

    abrirEnviarEmail = (receta) => {
        this.setState({
            mostrarEnviarEmail: true,
            recetaActual: receta,
            emailDestino: ''
        });
    }

    cerrarEnviarEmail = () => {
        this.setState({
            mostrarEnviarEmail: false,
            emailDestino: ''
        });
    }

    enviarRecetaEmail = () => {
        const { emailDestino, recetaActual } = this.state;

        if (!emailDestino || !emailDestino.includes('@')) {
            Alertify.error("Ingrese un email válido");
            return;
        }

        Core.enviar_receta_email(recetaActual.id, emailDestino).then(() => {
            Alertify.success("Receta enviada por email correctamente");
            this.cerrarEnviarEmail();
        }).catch(error => {
            Alertify.error("Error al enviar receta");
        });
    }

    render() {
        const { recetas, mostrarFormulario, recetaActual, medicamentos, modoEdicion, mostrarEnviarEmail, emailDestino } = this.state;

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
                <div className="container-fluid mt-4" style={{ backgroundColor: '#f5f5f7', minHeight: '100vh', padding: '30px' }}>
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
                                    <i className="fas fa-prescription"></i>
                                </div>
                                <div>
                                    <h3 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                        Recetas Médicas
                                    </h3>
                                    <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                        Gestiona las recetas médicas del paciente
                                    </p>
                                </div>
                            </div>
                            <button
                                className="btn"
                                onClick={() => this.abrirFormulario()}
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
                                <i className="fas fa-plus me-2"></i>Nueva Receta
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de recetas estilo macOS */}
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="card-body p-0">
                        {recetas.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-prescription fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                                <h5 className="text-muted mb-2">No hay recetas registradas</h5>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                    Crea una nueva receta médica para este paciente
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
                                            }}>Código</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Fecha</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Doctor</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Medicamentos</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Diagnóstico</th>
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
                                        {recetas.map(receta => (
                                            <tr key={receta.id} style={{ 
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
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                    <span className="badge" style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 600,
                                                        fontSize: '12px'
                                                    }}>
                                                        {receta.codigo_receta}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                    {new Date(receta.fecha).toLocaleDateString('es-ES', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057', fontWeight: 500 }}>
                                                    {receta.doctor ? 
                                                        `Dr. ${receta.doctor.nombre} ${receta.doctor.apellido || ''}` : 
                                                        <span className="text-muted">N/A</span>
                                                    }
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                    <span className="badge bg-light text-dark" style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontWeight: 500,
                                                        fontSize: '12px'
                                                    }}>
                                                        <i className="fas fa-pills me-1"></i>
                                                        {receta.medicamentos ? receta.medicamentos.length : 0} medicamento(s)
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#6c757d', fontSize: '14px' }}>
                                                    {receta.diagnostico ? 
                                                        (receta.diagnostico.length > 50 ? 
                                                            receta.diagnostico.substring(0, 50) + '...' : 
                                                            receta.diagnostico
                                                        ) : 
                                                        <span className="text-muted">-</span>
                                                    }
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <div className="d-flex justify-content-center" style={{ gap: '10px' }}>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => this.imprimirReceta(receta.id)}
                                                            title="Ver PDF"
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
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => this.descargarReceta(receta.id)}
                                                            title="Descargar PDF"
                                                            style={{
                                                                background: '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 12px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.1)';
                                                                e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => this.abrirEnviarEmail(receta)}
                                                            title="Enviar por Email"
                                                            style={{
                                                                background: '#667eea',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 12px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.1)';
                                                                e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            <i className="fas fa-envelope"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => this.abrirFormulario(receta)}
                                                            title="Editar"
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
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => this.eliminarReceta(receta.id)}
                                                            title="Eliminar"
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

                {/* Modal para crear/editar receta - Estilo macOS */}
                {mostrarFormulario && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            overflowY: 'auto',
                            padding: '20px',
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                this.cerrarFormulario();
                            }
                        }}
                    >
                        <div style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '20px',
                            width: '90%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'slideUp 0.3s ease-out'
                        }}>
                            {/* Header con gradiente */}
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '24px 32px',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        <i className="fas fa-prescription"></i>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '22px' }}>
                                            {modoEdicion ? 'Editar Receta' : 'Nueva Receta Médica'}
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                                            {modoEdicion ? 'Modifica los datos de la receta' : 'Complete los datos para crear una nueva receta'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={this.cerrarFormulario}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        width: '32px',
                                        height: '32px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                        e.target.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            {/* Contenido del modal */}
                            <div style={{
                                padding: '32px',
                                overflowY: 'auto',
                                flex: 1,
                                background: '#f8f9fa'
                            }}>
                                {/* Fecha */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: '#495057'
                                    }}>
                                        Fecha <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={recetaActual.fecha}
                                        onChange={(e) => this.setState({
                                            recetaActual: { ...recetaActual, fecha: e.target.value }
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                            backgroundColor: 'white'
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

                                {/* Diagnóstico */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: '#495057'
                                    }}>
                                        Diagnóstico
                                    </label>
                                    <textarea
                                        value={recetaActual.diagnostico || ''}
                                        onChange={(e) => this.setState({
                                            recetaActual: { ...recetaActual, diagnostico: e.target.value }
                                        })}
                                        rows="3"
                                        placeholder="Ingrese el diagnóstico del paciente..."
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            backgroundColor: 'white'
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

                                {/* Medicamentos */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <label style={{
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            color: '#495057',
                                            margin: 0
                                        }}>
                                            Medicamentos <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={this.agregarMedicamento}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px 20px',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                            }}
                                        >
                                            <i className="fas fa-plus"></i>
                                            Agregar Medicamento
                                        </button>
                                    </div>
                                    
                                    {medicamentos.map((med, index) => (
                                        <div key={index} style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            marginBottom: '16px',
                                            border: '2px solid #f0f0f0',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#f0f0f0';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                        }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '16px'
                                            }}>
                                                <h6 style={{
                                                    margin: 0,
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    color: '#495057',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <i className="fas fa-pills" style={{ color: '#667eea' }}></i>
                                                    Medicamento #{index + 1}
                                                </h6>
                                                <button
                                                    onClick={() => this.eliminarMedicamento(index)}
                                                    style={{
                                                        background: '#fee',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        width: '32px',
                                                        height: '32px',
                                                        color: '#dc3545',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = '#fcc';
                                                        e.target.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = '#fee';
                                                        e.target.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6" style={{ marginBottom: '16px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        fontWeight: 500,
                                                        fontSize: '13px',
                                                        color: '#6c757d'
                                                    }}>
                                                        Nombre del Medicamento <span style={{ color: '#dc3545' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={med.nombre}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'nombre', e.target.value)}
                                                        placeholder="Ej: Amoxicilina 500mg"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: '2px solid #e0e0e0',
                                                            fontSize: '14px',
                                                            transition: 'all 0.2s ease',
                                                            outline: 'none',
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#667eea';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#e0e0e0';
                                                            e.target.style.boxShadow = 'none';
                                                            e.target.style.backgroundColor = '#fafafa';
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-3" style={{ marginBottom: '16px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        fontWeight: 500,
                                                        fontSize: '13px',
                                                        color: '#6c757d'
                                                    }}>
                                                        Cantidad <span style={{ color: '#dc3545' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={med.cantidad}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'cantidad', e.target.value)}
                                                        placeholder="Ej: 20 tabletas"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: '2px solid #e0e0e0',
                                                            fontSize: '14px',
                                                            transition: 'all 0.2s ease',
                                                            outline: 'none',
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#667eea';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#e0e0e0';
                                                            e.target.style.boxShadow = 'none';
                                                            e.target.style.backgroundColor = '#fafafa';
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-3" style={{ marginBottom: '16px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        fontWeight: 500,
                                                        fontSize: '13px',
                                                        color: '#6c757d'
                                                    }}>
                                                        Dosis <span style={{ color: '#dc3545' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={med.dosis}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'dosis', e.target.value)}
                                                        placeholder="Ej: 1 tableta"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: '2px solid #e0e0e0',
                                                            fontSize: '14px',
                                                            transition: 'all 0.2s ease',
                                                            outline: 'none',
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#667eea';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#e0e0e0';
                                                            e.target.style.boxShadow = 'none';
                                                            e.target.style.backgroundColor = '#fafafa';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6" style={{ marginBottom: '16px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        fontWeight: 500,
                                                        fontSize: '13px',
                                                        color: '#6c757d'
                                                    }}>
                                                        Frecuencia <span style={{ color: '#dc3545' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={med.frecuencia}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'frecuencia', e.target.value)}
                                                        placeholder="Ej: Cada 8 horas"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: '2px solid #e0e0e0',
                                                            fontSize: '14px',
                                                            transition: 'all 0.2s ease',
                                                            outline: 'none',
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#667eea';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#e0e0e0';
                                                            e.target.style.boxShadow = 'none';
                                                            e.target.style.backgroundColor = '#fafafa';
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-6" style={{ marginBottom: '16px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        fontWeight: 500,
                                                        fontSize: '13px',
                                                        color: '#6c757d'
                                                    }}>
                                                        Duración <span style={{ color: '#dc3545' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={med.duracion}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'duracion', e.target.value)}
                                                        placeholder="Ej: 7 días"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: '2px solid #e0e0e0',
                                                            fontSize: '14px',
                                                            transition: 'all 0.2s ease',
                                                            outline: 'none',
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#667eea';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                            e.target.style.backgroundColor = 'white';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#e0e0e0';
                                                            e.target.style.boxShadow = 'none';
                                                            e.target.style.backgroundColor = '#fafafa';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Indicaciones Adicionales */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: '#495057'
                                    }}>
                                        Indicaciones Adicionales
                                    </label>
                                    <textarea
                                        value={recetaActual.indicaciones || ''}
                                        onChange={(e) => this.setState({
                                            recetaActual: { ...recetaActual, indicaciones: e.target.value }
                                        })}
                                        rows="4"
                                        placeholder="Ingrese indicaciones adicionales para el paciente..."
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            backgroundColor: 'white'
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

                            {/* Footer con botones */}
                            <div style={{
                                padding: '20px 32px',
                                background: '#f8f9fa',
                                borderTop: '1px solid #e0e0e0',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '16px'
                            }}>
                                <button
                                    onClick={this.cerrarFormulario}
                                    style={{
                                        background: 'white',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: '#495057',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#c0c0c0';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#e0e0e0';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={this.guardarReceta}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 32px',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                    }}
                                >
                                    <i className="fas fa-save me-2"></i>
                                    Guardar Receta
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para enviar por email */}
                {mostrarEnviarEmail && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1001
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            width: '400px'
                        }}>
                            <h4>Enviar Receta por Email</h4>
                            <div className="form-group">
                                <label>Email del Destinatario *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={emailDestino}
                                    onChange={(e) => this.setState({ emailDestino: e.target.value })}
                                    placeholder="ejemplo@email.com"
                                />
                            </div>
                            <div className="d-flex justify-content-end" style={{ gap: '12px' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={this.cerrarEnviarEmail}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={this.enviarRecetaEmail}
                                >
                                    <i className="fas fa-paper-plane"></i> Enviar
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

export default Recetas;
