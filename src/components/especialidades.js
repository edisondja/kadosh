import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';

class Especialidades extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            especialidades: [],
            mostrarFormulario: false,
            especialidadActual: null,
            modoEdicion: false,
            filtroEstado: 'activas', // 'activas', 'inactivas', 'todas'
            cargando: false,
            buscador: ''
        };
    }

    componentDidMount() {
        this.cargarEspecialidades();
    }

    cargarEspecialidades = () => {
        this.setState({ cargando: true });
        if (this.state.filtroEstado === 'todas') {
            Core.listar_todas_especialidades().then(data => {
                this.setState({ especialidades: data, cargando: false });
            }).catch(error => {
                console.error("Error al cargar especialidades:", error);
                this.setState({ cargando: false });
            });
        } else if (this.state.filtroEstado === 'inactivas') {
            Core.listar_todas_especialidades().then(data => {
                const inactivas = data.filter(esp => !esp.estado);
                this.setState({ especialidades: inactivas, cargando: false });
            }).catch(error => {
                console.error("Error al cargar especialidades:", error);
                this.setState({ cargando: false });
            });
        } else {
            Core.listar_especialidades().then(data => {
                this.setState({ especialidades: data, cargando: false });
            }).catch(error => {
                console.error("Error al cargar especialidades:", error);
                this.setState({ cargando: false });
            });
        }
    }

    abrirFormulario = (especialidad = null) => {
        this.setState({
            especialidadActual: especialidad || {
                nombre: '',
                descripcion: '',
                estado: true
            },
            mostrarFormulario: true,
            modoEdicion: especialidad !== null
        });
    }

    cerrarFormulario = () => {
        this.setState({
            mostrarFormulario: false,
            especialidadActual: null,
            modoEdicion: false
        });
    }

    handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState({
            especialidadActual: {
                ...this.state.especialidadActual,
                [name]: type === 'checkbox' ? checked : value
            }
        });
    }

    handleBuscar = (e) => {
        this.setState({ buscador: e.target.value });
    }

    guardarEspecialidad = () => {
        const { especialidadActual, modoEdicion } = this.state;

        if (!especialidadActual.nombre || especialidadActual.nombre.trim() === '') {
            Alertify.error("El nombre de la especialidad es requerido");
            return;
        }

        const datos = {
            nombre: especialidadActual.nombre.trim(),
            descripcion: especialidadActual.descripcion || '',
            estado: especialidadActual.estado !== undefined ? especialidadActual.estado : true
        };

        if (modoEdicion) {
            Core.actualizar_especialidad(especialidadActual.id, datos).then((response) => {
                Alertify.success(response.message || "Especialidad actualizada correctamente");
                this.cerrarFormulario();
                this.cargarEspecialidades();
            }).catch(error => {
                console.error("Error al actualizar especialidad:", error);
            });
        } else {
            Core.crear_especialidad(datos).then((response) => {
                Alertify.success(response.message || "Especialidad creada correctamente");
                this.cerrarFormulario();
                this.cargarEspecialidades();
            }).catch(error => {
                console.error("Error al crear especialidad:", error);
            });
        }
    }

    eliminarEspecialidad = (id) => {
        Alertify.confirm(
            "¿Está seguro de eliminar esta especialidad?",
            "Si hay doctores usando esta especialidad, solo se desactivará.",
            () => {
                Core.eliminar_especialidad(id).then((response) => {
                    Alertify.success(response.message || "Especialidad eliminada correctamente");
                    this.cargarEspecialidades();
                }).catch(error => {
                    Alertify.error("Error al eliminar especialidad");
                    console.error(error);
                });
            },
            () => {
                Alertify.message("Cancelado");
            }
        );
    }

    activarEspecialidad = (id) => {
        Core.activar_especialidad(id).then((response) => {
            Alertify.success(response.message || "Especialidad activada correctamente");
            this.cargarEspecialidades();
        }).catch(error => {
            Alertify.error("Error al activar especialidad");
            console.error(error);
        });
    }

    cambiarFiltro = (filtro) => {
        this.setState({ filtroEstado: filtro, buscador: '' }, () => {
            this.cargarEspecialidades();
        });
    }

    getEspecialidadesFiltradas = () => {
        const { especialidades, buscador } = this.state;
        if (!buscador) return especialidades;
        
        const busqueda = buscador.toLowerCase();
        return especialidades.filter(esp => 
            esp.nombre.toLowerCase().includes(busqueda) ||
            (esp.descripcion && esp.descripcion.toLowerCase().includes(busqueda))
        );
    }

    render() {
        const { mostrarFormulario, especialidadActual, modoEdicion, filtroEstado, cargando, buscador } = this.state;
        const especialidadesFiltradas = this.getEspecialidadesFiltradas();
        const totalActivas = this.state.especialidades.filter(esp => esp.estado).length;
        const totalInactivas = this.state.especialidades.filter(esp => !esp.estado).length;

        return (
            <div className="container-fluid mt-4" style={{ padding: '20px' }}>
                {/* Header con título y botón */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1" style={{ 
                            fontWeight: '600', 
                            color: '#1d1d1f',
                            fontSize: '28px'
                        }}>
                            <i className="fas fa-user-md me-2" style={{ color: '#007aff' }}></i>
                            Gestión de Especialidades
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                            Administra las especialidades médicas disponibles para los doctores
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => this.abrirFormulario()}
                        style={{
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
                        }}
                    >
                        <i className="fas fa-plus me-2"></i>
                        Nueva Especialidad
                    </button>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            color: 'white',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-2" style={{ opacity: 0.9, fontSize: '13px', fontWeight: '500' }}>
                                            ESPECIALIDADES ACTIVAS
                                        </h6>
                                        <h3 className="mb-0" style={{ fontSize: '32px', fontWeight: '700' }}>
                                            {totalActivas}
                                        </h3>
                                    </div>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm" style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '16px',
                            color: 'white',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-2" style={{ opacity: 0.9, fontSize: '13px', fontWeight: '500' }}>
                                            ESPECIALIDADES INACTIVAS
                                        </h6>
                                        <h3 className="mb-0" style={{ fontSize: '32px', fontWeight: '700' }}>
                                            {totalInactivas}
                                        </h3>
                                    </div>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        <i className="fas fa-ban"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm" style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            borderRadius: '16px',
                            color: 'white',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-2" style={{ opacity: 0.9, fontSize: '13px', fontWeight: '500' }}>
                                            TOTAL REGISTRADAS
                                        </h6>
                                        <h3 className="mb-0" style={{ fontSize: '32px', fontWeight: '700' }}>
                                            {this.state.especialidades.length}
                                        </h3>
                                    </div>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        <i className="fas fa-list"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
                    <div className="card-body p-4">
                        <div className="row align-items-center">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <label className="form-label fw-bold mb-2" style={{ fontSize: '14px', color: '#6e6e73' }}>
                                    <i className="fas fa-filter me-2"></i>Filtrar por Estado
                                </label>
                                <div className="btn-group w-100" role="group" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                    <button
                                        type="button"
                                        className={`btn ${filtroEstado === 'activas' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => this.cambiarFiltro('activas')}
                                        style={{ 
                                            borderRadius: filtroEstado === 'activas' ? '12px 0 0 12px' : '0',
                                            fontWeight: '600',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fas fa-check-circle me-2"></i>Activas
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${filtroEstado === 'inactivas' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => this.cambiarFiltro('inactivas')}
                                        style={{ 
                                            borderRadius: '0',
                                            fontWeight: '600',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fas fa-ban me-2"></i>Inactivas
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${filtroEstado === 'todas' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => this.cambiarFiltro('todas')}
                                        style={{ 
                                            borderRadius: filtroEstado === 'todas' ? '0 12px 12px 0' : '0',
                                            fontWeight: '600',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="fas fa-list me-2"></i>Todas
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                    <span className="input-group-text bg-white border-end-0" style={{ border: '1px solid #d1d1d6' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Buscar por nombre o descripción..."
                                        value={buscador}
                                        onChange={this.handleBuscar}
                                        style={{
                                            border: '1px solid #d1d1d6',
                                            borderRadius: '0 12px 12px 0',
                                            padding: '12px 16px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de especialidades */}
                <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="card-body p-0">
                        {cargando ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="mt-3 text-muted">Cargando especialidades...</p>
                            </div>
                        ) : especialidadesFiltradas.length === 0 ? (
                            <div className="text-center py-5 px-4">
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    fontSize: '32px',
                                    color: 'white'
                                }}>
                                    <i className="fas fa-user-md"></i>
                                </div>
                                <h5 className="mb-2" style={{ color: '#1d1d1f', fontWeight: '600' }}>
                                    {buscador ? 'No se encontraron resultados' : 'No hay especialidades registradas'}
                                </h5>
                                <p className="text-muted mb-4">
                                    {buscador 
                                        ? 'Intenta con otros términos de búsqueda' 
                                        : 'Comienza agregando tu primera especialidad médica'
                                    }
                                </p>
                                {!buscador && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => this.abrirFormulario()}
                                        style={{ borderRadius: '12px', padding: '10px 24px' }}
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Agregar Primera Especialidad
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}>
                                        <tr>
                                            <th style={{ 
                                                padding: '16px 20px', 
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                border: 'none',
                                                color: '#ffffff !important'
                                            }}>
                                                <i className="fas fa-tag me-2" style={{ color: '#ffffff' }}></i>Nombre
                                            </th>
                                            <th style={{ 
                                                padding: '16px 20px', 
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                border: 'none',
                                                color: '#ffffff !important'
                                            }}>
                                                <i className="fas fa-align-left me-2" style={{ color: '#ffffff' }}></i>Descripción
                                            </th>
                                            <th style={{ 
                                                padding: '16px 20px', 
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                border: 'none',
                                                textAlign: 'center',
                                                color: '#ffffff !important'
                                            }}>
                                                <i className="fas fa-info-circle me-2" style={{ color: '#ffffff' }}></i>Estado
                                            </th>
                                            <th style={{ 
                                                padding: '16px 20px', 
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                border: 'none',
                                                textAlign: 'center',
                                                color: '#ffffff !important'
                                            }}>
                                                <i className="fas fa-calendar me-2" style={{ color: '#ffffff' }}></i>Fecha
                                            </th>
                                            <th style={{ 
                                                padding: '16px 20px', 
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                border: 'none',
                                                textAlign: 'center',
                                                width: '150px',
                                                color: '#ffffff !important'
                                            }}>
                                                <i className="fas fa-cog me-2" style={{ color: '#ffffff' }}></i>Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {especialidadesFiltradas.map((especialidad, index) => (
                                            <tr 
                                                key={especialidad.id}
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    borderBottom: index < especialidadesFiltradas.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                    background: 'white'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#f8f9fa';
                                                    e.currentTarget.style.transform = 'scale(1.01)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                                                    <div className="d-flex align-items-center">
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: especialidad.estado 
                                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '18px',
                                                            marginRight: '12px',
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                        }}>
                                                            <i className="fas fa-user-md"></i>
                                                        </div>
                                                        <div>
                                                            <strong style={{ 
                                                                fontSize: '16px', 
                                                                color: '#1d1d1f',
                                                                fontWeight: '600'
                                                            }}>
                                                                {especialidad.nombre}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                                                    <div style={{
                                                        maxWidth: '300px',
                                                        color: '#6e6e73',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {especialidad.descripcion ? (
                                                            <span>{especialidad.descripcion.length > 60 
                                                                ? especialidad.descripcion.substring(0, 60) + '...' 
                                                                : especialidad.descripcion}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontStyle: 'italic' }}>
                                                                Sin descripción
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <span 
                                                        className={`badge`}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            background: especialidad.estado 
                                                                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
                                                                : 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                                                            color: 'white',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                        }}
                                                    >
                                                        <i className={`fas ${especialidad.estado ? 'fa-check-circle' : 'fa-ban'} me-1`}></i>
                                                        {especialidad.estado ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '14px', color: '#6e6e73' }}>
                                                        <i className="far fa-calendar me-2"></i>
                                                        {new Date(especialidad.created_at).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => this.abrirFormulario(especialidad)}
                                                            title="Editar"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                marginRight: '4px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 6px rgba(245, 87, 108, 0.3)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.5)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 87, 108, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        {especialidad.estado ? (
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => this.eliminarEspecialidad(especialidad.id)}
                                                                title="Desactivar"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '8px 12px',
                                                                    transition: 'all 0.2s ease',
                                                                    boxShadow: '0 2px 6px rgba(238, 9, 121, 0.3)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(238, 9, 121, 0.5)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(238, 9, 121, 0.3)';
                                                                }}
                                                            >
                                                                <i className="fas fa-ban"></i>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => this.activarEspecialidad(especialidad.id)}
                                                                title="Activar"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '8px 12px',
                                                                    transition: 'all 0.2s ease',
                                                                    boxShadow: '0 2px 6px rgba(17, 153, 142, 0.3)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.5)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(17, 153, 142, 0.3)';
                                                                }}
                                                            >
                                                                <i className="fas fa-check"></i>
                                                            </button>
                                                        )}
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

                {/* Modal para crear/editar especialidad */}
                {mostrarFormulario && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1050,
                        backdropFilter: 'blur(4px)',
                        animation: 'fadeIn 0.3s ease'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            this.cerrarFormulario();
                        }
                    }}
                    >
                        <div style={{
                            backgroundColor: 'white',
                            padding: '0',
                            borderRadius: '20px',
                            width: '550px',
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            animation: 'slideUp 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header del modal */}
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '24px 30px',
                                color: 'white'
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="mb-0" style={{ fontWeight: '600', fontSize: '22px' }}>
                                            <i className="fas fa-user-md me-2"></i>
                                            {modoEdicion ? 'Editar Especialidad' : 'Nueva Especialidad'}
                                        </h4>
                                        <p className="mb-0 mt-1" style={{ fontSize: '13px', opacity: 0.9 }}>
                                            {modoEdicion ? 'Modifica los datos de la especialidad' : 'Completa el formulario para crear una nueva especialidad'}
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-sm"
                                        onClick={this.cerrarFormulario}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            border: 'none',
                                            color: 'white',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                            e.currentTarget.style.transform = 'rotate(90deg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                            e.currentTarget.style.transform = 'rotate(0deg)';
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Body del modal */}
                            <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                                <div className="form-group mb-4">
                                    <label className="form-label fw-bold mb-2" style={{ 
                                        fontSize: '14px', 
                                        color: '#1d1d1f',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <i className="fas fa-tag me-2" style={{ color: '#667eea' }}></i>
                                        Nombre de la Especialidad <span style={{ color: '#ff3b30' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={especialidadActual.nombre || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="Ej: Odontólogo General, Ortodoncista, etc."
                                        required
                                        style={{
                                            borderRadius: '12px',
                                            padding: '14px 18px',
                                            border: '2px solid #e5e5ea',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e5ea';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label className="form-label fw-bold mb-2" style={{ 
                                        fontSize: '14px', 
                                        color: '#1d1d1f',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <i className="fas fa-align-left me-2" style={{ color: '#667eea' }}></i>
                                        Descripción
                                    </label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion"
                                        value={especialidadActual.descripcion || ''}
                                        onChange={this.handleInputChange}
                                        rows="4"
                                        placeholder="Describe brevemente esta especialidad médica (opcional)"
                                        style={{
                                            borderRadius: '12px',
                                            padding: '14px 18px',
                                            border: '2px solid #e5e5ea',
                                            fontSize: '15px',
                                            resize: 'vertical',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e5ea';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                    <small className="text-muted" style={{ fontSize: '12px' }}>
                                        <i className="fas fa-info-circle me-1"></i>
                                        Esta descripción ayudará a identificar mejor la especialidad
                                    </small>
                                </div>

                                {modoEdicion && (
                                    <div className="form-group mb-4">
                                        <div className="card" style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e5e5ea',
                                            background: '#f8f9fa'
                                        }}>
                                            <div className="card-body p-3">
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        name="estado"
                                                        checked={especialidadActual.estado || false}
                                                        onChange={this.handleInputChange}
                                                        id="estadoEspecialidad"
                                                        style={{
                                                            width: '50px',
                                                            height: '26px',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    <label className="form-check-label fw-bold ms-3" htmlFor="estadoEspecialidad" style={{
                                                        fontSize: '15px',
                                                        color: '#1d1d1f',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <i className="fas fa-power-off me-2"></i>
                                                        Especialidad Activa
                                                    </label>
                                                </div>
                                                <small className="text-muted d-block mt-2 ms-5" style={{ fontSize: '12px' }}>
                                                    Las especialidades inactivas no aparecerán al agregar nuevos doctores
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-end gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #e5e5ea' }}>
                                    <button
                                        className="btn"
                                        onClick={this.cerrarFormulario}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontWeight: '600',
                                            background: '#f2f2f7',
                                            color: '#1d1d1f',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e5e5ea';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f2f2f7';
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={this.guardarEspecialidad}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '12px 28px',
                                            fontWeight: '600',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                        }}
                                    >
                                        <i className={`fas ${modoEdicion ? 'fa-save' : 'fa-plus'} me-2`}></i>
                                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { 
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to { 
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        );
    }
}

export default Especialidades;
