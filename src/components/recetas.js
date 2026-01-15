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
            <div className="container-fluid mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>
                        <i className="fas fa-prescription"></i> Recetas Médicas
                    </h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => this.abrirFormulario()}
                    >
                        <i className="fas fa-plus"></i> Nueva Receta
                    </button>
                </div>

                <div className="card shadow">
                    <div className="card-body">
                        {recetas.length === 0 ? (
                            <p className="text-muted text-center">No hay recetas registradas</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Fecha</th>
                                            <th>Doctor</th>
                                            <th>Medicamentos</th>
                                            <th>Diagnóstico</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recetas.map(receta => (
                                            <tr key={receta.id}>
                                                <td>{receta.codigo_receta}</td>
                                                <td>{new Date(receta.fecha).toLocaleDateString()}</td>
                                                <td>
                                                    {receta.doctor ? 
                                                        `Dr. ${receta.doctor.nombre} ${receta.doctor.apellido || ''}` : 
                                                        'N/A'
                                                    }
                                                </td>
                                                <td>{receta.medicamentos ? receta.medicamentos.length : 0} medicamento(s)</td>
                                                <td>
                                                    {receta.diagnostico ? 
                                                        (receta.diagnostico.length > 50 ? 
                                                            receta.diagnostico.substring(0, 50) + '...' : 
                                                            receta.diagnostico
                                                        ) : 
                                                        '-'
                                                    }
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-info"
                                                            onClick={() => this.imprimirReceta(receta.id)}
                                                            title="Ver PDF"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => this.descargarReceta(receta.id)}
                                                            title="Descargar PDF"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => this.abrirEnviarEmail(receta)}
                                                            title="Enviar por Email"
                                                        >
                                                            <i className="fas fa-envelope"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => this.abrirFormulario(receta)}
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => this.eliminarReceta(receta.id)}
                                                            title="Eliminar"
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

                {/* Modal para crear/editar receta */}
                {mostrarFormulario && (
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
                        zIndex: 1000,
                        overflowY: 'auto',
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            width: '90%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <h4>{modoEdicion ? 'Editar Receta' : 'Nueva Receta'}</h4>
                            
                            <div className="form-group">
                                <label>Fecha *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={recetaActual.fecha}
                                    onChange={(e) => this.setState({
                                        recetaActual: { ...recetaActual, fecha: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Diagnóstico</label>
                                <textarea
                                    className="form-control"
                                    value={recetaActual.diagnostico || ''}
                                    onChange={(e) => this.setState({
                                        recetaActual: { ...recetaActual, diagnostico: e.target.value }
                                    })}
                                    rows="3"
                                    placeholder="Ingrese el diagnóstico..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Medicamentos *</label>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-success mb-2"
                                    onClick={this.agregarMedicamento}
                                >
                                    <i className="fas fa-plus"></i> Agregar Medicamento
                                </button>
                                
                                {medicamentos.map((med, index) => (
                                    <div key={index} className="card mb-2">
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>Nombre del Medicamento *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={med.nombre}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'nombre', e.target.value)}
                                                        placeholder="Ej: Amoxicilina 500mg"
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <label>Cantidad *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={med.cantidad}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'cantidad', e.target.value)}
                                                        placeholder="Ej: 20 tabletas"
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <label>Dosis *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={med.dosis}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'dosis', e.target.value)}
                                                        placeholder="Ej: 1 tableta"
                                                    />
                                                </div>
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-md-6">
                                                    <label>Frecuencia *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={med.frecuencia}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'frecuencia', e.target.value)}
                                                        placeholder="Ej: Cada 8 horas"
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label>Duración *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={med.duracion}
                                                        onChange={(e) => this.actualizarMedicamento(index, 'duracion', e.target.value)}
                                                        placeholder="Ej: 7 días"
                                                    />
                                                </div>
                                                <div className="col-md-2 d-flex align-items-end">
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => this.eliminarMedicamento(index)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="form-group">
                                <label>Indicaciones Adicionales</label>
                                <textarea
                                    className="form-control"
                                    value={recetaActual.indicaciones || ''}
                                    onChange={(e) => this.setState({
                                        recetaActual: { ...recetaActual, indicaciones: e.target.value }
                                    })}
                                    rows="4"
                                    placeholder="Ingrese indicaciones adicionales para el paciente..."
                                />
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                <button
                                    className="btn btn-secondary mr-2"
                                    onClick={this.cerrarFormulario}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={this.guardarReceta}
                                >
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
                            <div className="d-flex justify-content-end">
                                <button
                                    className="btn btn-secondary mr-2"
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
        );
    }
}

export default Recetas;
