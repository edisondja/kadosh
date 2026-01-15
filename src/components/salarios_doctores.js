import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';

class SalariosDoctores extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            doctores: [],
            salarios: [],
            mostrarFormulario: false,
            salarioActual: null,
            modoEdicion: false
        };
    }

    componentDidMount() {
        this.cargarDoctores();
        this.cargarSalarios();
    }

    cargarDoctores = () => {
        Core.cargar_doctores(this).then(() => {
            if (this.state.doctores) {
                // Los doctores ya están en el estado
            }
        });
    }

    cargarSalarios = () => {
        Core.listar_salarios_doctores().then(data => {
            this.setState({ salarios: data });
        }).catch(error => {
            console.error("Error al cargar salarios:", error);
        });
    }

    abrirFormulario = (salario = null, doctor = null) => {
        this.setState({
            salarioActual: salario || {
                doctor_id: doctor ? doctor.id : '',
                salario: '',
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: '',
                comentarios: ''
            },
            mostrarFormulario: true,
            modoEdicion: salario !== null
        });
    }

    cerrarFormulario = () => {
        this.setState({
            mostrarFormulario: false,
            salarioActual: null,
            modoEdicion: false
        });
    }

    guardarSalario = () => {
        const salario = this.state.salarioActual;

        if (!salario.doctor_id || !salario.salario || !salario.fecha_inicio) {
            Alertify.error("Complete todos los campos requeridos");
            return;
        }

        const datos = {
            ...salario,
            salario: parseFloat(salario.salario)
        };

        if (this.state.modoEdicion) {
            datos.id = salario.id;
        }

        Core.guardar_salario_doctor(datos).then(response => {
            Alertify.success(this.state.modoEdicion ? "Salario actualizado" : "Salario asignado");
            this.cerrarFormulario();
            this.cargarSalarios();
        }).catch(error => {
            Alertify.error("Error al guardar salario");
            console.error(error);
        });
    }

    eliminarSalario = (id) => {
        Alertify.confirm(
            "¿Está seguro de desactivar este salario?",
            () => {
                Core.eliminar_salario_doctor(id).then(() => {
                    Alertify.success("Salario desactivado");
                    this.cargarSalarios();
                }).catch(error => {
                    Alertify.error("Error al eliminar salario");
                });
            }
        );
    }

    render() {
        const { salarios, mostrarFormulario, salarioActual, modoEdicion } = this.state;

        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>
                        <i className="fas fa-user-md"></i> Gestión de Salarios de Doctores
                    </h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => this.abrirFormulario()}
                    >
                        <i className="fas fa-plus"></i> Asignar Salario
                    </button>
                </div>

                <div className="card shadow">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Salarios Activos</h5>
                    </div>
                    <div className="card-body">
                        {salarios.length === 0 ? (
                            <p className="text-muted text-center">No hay salarios registrados</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Doctor</th>
                                            <th>Salario</th>
                                            <th>Fecha Inicio</th>
                                            <th>Fecha Fin</th>
                                            <th>Comentarios</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salarios.map(salario => (
                                            <tr key={salario.id}>
                                                <td>
                                                    {salario.doctor ? 
                                                        `${salario.doctor.nombre} ${salario.doctor.apellido || ''}` : 
                                                        'N/A'
                                                    }
                                                </td>
                                                <td>
                                                    RD$ {new Intl.NumberFormat('es-DO').format(salario.salario)}
                                                </td>
                                                <td>{new Date(salario.fecha_inicio).toLocaleDateString()}</td>
                                                <td>
                                                    {salario.fecha_fin ? 
                                                        new Date(salario.fecha_fin).toLocaleDateString() : 
                                                        'Indefinido'
                                                    }
                                                </td>
                                                <td>{salario.comentarios || '-'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary mr-2"
                                                        onClick={() => this.abrirFormulario(salario)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => this.eliminarSalario(salario.id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
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

                {/* Modal para agregar/editar salario */}
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
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            width: '500px'
                        }}>
                            <h4>{modoEdicion ? 'Editar Salario' : 'Asignar Salario'}</h4>
                            <div className="form-group">
                                <label>Doctor *</label>
                                <select
                                    className="form-control"
                                    value={salarioActual.doctor_id}
                                    onChange={(e) => this.setState({
                                        salarioActual: { ...salarioActual, doctor_id: parseInt(e.target.value) }
                                    })}
                                    disabled={modoEdicion}
                                >
                                    <option value="">Seleccionar doctor...</option>
                                    {this.state.doctores && this.state.doctores.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.nombre} {doctor.apellido || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salario (RD$) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={salarioActual.salario}
                                    onChange={(e) => this.setState({
                                        salarioActual: { ...salarioActual, salario: e.target.value }
                                    })}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha Inicio *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={salarioActual.fecha_inicio}
                                    onChange={(e) => this.setState({
                                        salarioActual: { ...salarioActual, fecha_inicio: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha Fin (Opcional)</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={salarioActual.fecha_fin || ''}
                                    onChange={(e) => this.setState({
                                        salarioActual: { ...salarioActual, fecha_fin: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Comentarios</label>
                                <textarea
                                    className="form-control"
                                    value={salarioActual.comentarios || ''}
                                    onChange={(e) => this.setState({
                                        salarioActual: { ...salarioActual, comentarios: e.target.value }
                                    })}
                                    rows="3"
                                />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button
                                    className="btn btn-secondary mr-2"
                                    onClick={this.cerrarFormulario}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={this.guardarSalario}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default SalariosDoctores;
