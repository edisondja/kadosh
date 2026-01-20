import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';

class AdministrarTenants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tenants: [],
            loading: true,
            modalVisible: false,
            modalEditarVisible: false,
            tenantSeleccionado: null,
            formData: {
                nombre: '',
                subdominio: '',
                database_name: '',
                fecha_vencimiento: '',
                activo: true,
                bloqueado: false,
                contacto_nombre: '',
                contacto_email: '',
                contacto_telefono: '',
                notas: ''
            },
            filtroEstado: 'todos',
            buscarTexto: ''
        };
    }

    componentDidMount() {
        this.cargarTenants();
    }

    cargarTenants = () => {
        this.setState({ loading: true });
        Axios.get(`${Core.url_base}/api/tenants`)
            .then(response => {
                this.setState({
                    tenants: response.data || [],
                    loading: false
                });
            })
            .catch(error => {
                console.error('Error al cargar tenants:', error);
                Alertify.error('Error al cargar la lista de tenants');
                this.setState({ loading: false, tenants: [] });
            });
    }

    abrirModalCrear = () => {
        this.setState({
            modalVisible: true,
            tenantSeleccionado: null,
            formData: {
                nombre: '',
                subdominio: '',
                database_name: '',
                fecha_vencimiento: '',
                activo: true,
                bloqueado: false,
                contacto_nombre: '',
                contacto_email: '',
                contacto_telefono: '',
                notas: ''
            }
        });
    }

    abrirModalEditar = (tenant) => {
        this.setState({
            modalEditarVisible: true,
            tenantSeleccionado: tenant,
            formData: {
                nombre: tenant.nombre || '',
                subdominio: tenant.subdominio || '',
                database_name: tenant.database_name || '',
                fecha_vencimiento: tenant.fecha_vencimiento ? tenant.fecha_vencimiento.split('T')[0] : '',
                activo: tenant.activo !== undefined ? tenant.activo : true,
                bloqueado: tenant.bloqueado !== undefined ? tenant.bloqueado : false,
                contacto_nombre: tenant.contacto_nombre || '',
                contacto_email: tenant.contacto_email || '',
                contacto_telefono: tenant.contacto_telefono || '',
                notas: tenant.notas || ''
            }
        });
    }

    cerrarModal = () => {
        this.setState({
            modalVisible: false,
            modalEditarVisible: false,
            tenantSeleccionado: null
        });
    }

    handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    }

    guardarTenant = () => {
        const { formData, tenantSeleccionado } = this.state;

        // Validaciones básicas
        if (!formData.nombre || !formData.subdominio || !formData.database_name) {
            Alertify.error('Por favor complete todos los campos requeridos');
            return;
        }

        const url = tenantSeleccionado 
            ? `${Core.url_base}/api/tenants/${tenantSeleccionado.id}`
            : `${Core.url_base}/api/tenants`;
        
        const method = tenantSeleccionado ? 'put' : 'post';

        Axios[method](url, formData)
            .then(response => {
                Alertify.success(tenantSeleccionado ? 'Tenant actualizado exitosamente' : 'Tenant creado exitosamente');
                this.cerrarModal();
                this.cargarTenants();
            })
            .catch(error => {
                console.error('Error al guardar tenant:', error);
                const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al guardar el tenant';
                Alertify.error(errorMessage);
            });
    }

    eliminarTenant = (id) => {
        Alertify.confirm(
            'Eliminar Tenant',
            '¿Está seguro que desea eliminar este tenant? Esta acción no se puede deshacer.',
            () => {
                Axios.delete(`${Core.url_base}/api/tenants/${id}`)
                    .then(() => {
                        Alertify.success('Tenant eliminado exitosamente');
                        this.cargarTenants();
                    })
                    .catch(error => {
                        console.error('Error al eliminar tenant:', error);
                        Alertify.error('Error al eliminar el tenant');
                    });
            },
            () => {
                Alertify.message('Operación cancelada');
            }
        );
    }

    obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'activo':
                return { background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)', color: 'white' };
            case 'vencido':
                return { background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white' };
            case 'por_vencer':
                return { background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', color: 'white' };
            case 'bloqueado':
                return { background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)', color: 'white' };
            case 'inactivo':
                return { background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)', color: 'white' };
            default:
                return { background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)', color: 'white' };
        }
    }

    obtenerTextoEstado = (estado) => {
        const estados = {
            'activo': 'Activo',
            'vencido': 'Vencido',
            'por_vencer': 'Por Vencer',
            'bloqueado': 'Bloqueado',
            'inactivo': 'Inactivo'
        };
        return estados[estado] || estado;
    }

    filtrarTenants = () => {
        const { tenants, filtroEstado, buscarTexto } = this.state;
        
        let filtrados = tenants;

        // Filtro por estado
        if (filtroEstado !== 'todos') {
            filtrados = filtrados.filter(t => t.estado === filtroEstado);
        }

        // Filtro por texto
        if (buscarTexto.trim() !== '') {
            const texto = buscarTexto.toLowerCase();
            filtrados = filtrados.filter(t => 
                (t.nombre && t.nombre.toLowerCase().includes(texto)) ||
                (t.subdominio && t.subdominio.toLowerCase().includes(texto)) ||
                (t.contacto_nombre && t.contacto_nombre.toLowerCase().includes(texto)) ||
                (t.contacto_email && t.contacto_email.toLowerCase().includes(texto))
            );
        }

        return filtrados;
    }

    render() {
        const { loading, modalVisible, modalEditarVisible, formData, filtroEstado, buscarTexto } = this.state;
        const tenantsFiltrados = this.filtrarTenants();

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
                            <i className="fas fa-building me-2"></i>Administración de Tenants
                        </h4>
                        <button
                            className="btn"
                            onClick={this.abrirModalCrear}
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
                            <i className="fas fa-plus me-2"></i>Nuevo Tenant
                        </button>
                    </div>

                    {/* Filtros y Búsqueda */}
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-search me-2" style={{ color: '#667eea' }}></i>Buscar
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por nombre, subdominio, contacto..."
                                        value={buscarTexto}
                                        onChange={(e) => this.setState({ buscarTexto: e.target.value })}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            border: '2px solid #e0e0e0',
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
                                <div className="col-md-6">
                                    <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-filter me-2" style={{ color: '#667eea' }}></i>Filtrar por Estado
                                    </label>
                                    <select
                                        className="form-control"
                                        value={filtroEstado}
                                        onChange={(e) => this.setState({ filtroEstado: e.target.value })}
                                        style={{
                                            padding: '18px 20px',
                                            borderRadius: '8px',
                                            border: '2px solid #e0e0e0',
                                            fontSize: '17px',
                                            fontWeight: 500,
                                            minHeight: '64px',
                                            height: 'auto',
                                            lineHeight: '1.6',
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
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="activo">Activo</option>
                                        <option value="por_vencer">Por Vencer</option>
                                        <option value="vencido">Vencido</option>
                                        <option value="bloqueado">Bloqueado</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Tenants */}
                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Cargando...</span>
                            </div>
                            <p className="mt-3" style={{ color: '#6c757d' }}>Cargando tenants...</p>
                        </div>
                    ) : tenantsFiltrados.length === 0 ? (
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                            <div className="card-body text-center p-5">
                                <i className="fas fa-building" style={{ fontSize: '48px', color: '#6c757d', opacity: 0.5, marginBottom: '15px' }}></i>
                                <p style={{ margin: 0, fontSize: '16px', color: '#6c757d' }}>
                                    {this.state.tenants.length === 0 
                                        ? 'No hay tenants registrados'
                                        : 'No se encontraron tenants con los filtros aplicados'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {tenantsFiltrados.map((tenant) => {
                                const colorEstado = this.obtenerColorEstado(tenant.estado);
                                const diasRestantes = tenant.dias_restantes;
                                
                                return (
                                    <div key={tenant.id} className="col-12 col-md-6 col-lg-4">
                                        <div className="card border-0 shadow-sm" style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            transition: 'all 0.2s ease',
                                            height: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e0e0e0';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                        }}>
                                            <div className="card-body p-4">
                                                {/* Header con Estado */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h5 style={{ margin: 0, marginBottom: '5px', fontWeight: 700, color: '#2d2d2f' }}>
                                                            {tenant.nombre}
                                                        </h5>
                                                        <small style={{ color: '#6c757d', fontSize: '12px' }}>
                                                            <i className="fas fa-globe me-1"></i>
                                                            {tenant.subdominio}
                                                        </small>
                                                    </div>
                                                    <span className="badge" style={{
                                                        ...colorEstado,
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {this.obtenerTextoEstado(tenant.estado)}
                                                    </span>
                                                </div>

                                                {/* Información de Vencimiento */}
                                                {tenant.fecha_vencimiento && (
                                                    <div style={{
                                                        marginBottom: '15px',
                                                        padding: '12px',
                                                        background: tenant.esta_vencido 
                                                            ? 'rgba(220, 53, 69, 0.1)'
                                                            : diasRestantes !== null && diasRestantes <= 7
                                                            ? 'rgba(255, 193, 7, 0.1)'
                                                            : 'rgba(102, 126, 234, 0.1)',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${tenant.esta_vencido 
                                                            ? 'rgba(220, 53, 69, 0.2)'
                                                            : diasRestantes !== null && diasRestantes <= 7
                                                            ? 'rgba(255, 193, 7, 0.2)'
                                                            : 'rgba(102, 126, 234, 0.2)'
                                                        }`
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '12px', color: '#495057', fontWeight: 600 }}>
                                                                <i className="fas fa-calendar-alt me-1"></i>
                                                                Vence:
                                                            </span>
                                                            <span style={{ fontSize: '13px', fontWeight: 700, color: tenant.esta_vencido ? '#dc3545' : '#495057' }}>
                                                                {new Date(tenant.fecha_vencimiento).toLocaleDateString('es-ES', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {diasRestantes !== null && (
                                                            <div style={{ marginTop: '5px', fontSize: '11px', color: '#6c757d' }}>
                                                                {tenant.esta_vencido 
                                                                    ? <span style={{ color: '#dc3545' }}>Vencido hace {Math.abs(diasRestantes)} día{diasRestantes !== -1 ? 's' : ''}</span>
                                                                    : <span>Días restantes: <strong>{diasRestantes}</strong></span>
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Información de Contacto */}
                                                {tenant.contacto_nombre && (
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
                                                            <i className="fas fa-user me-1"></i>Contacto:
                                                        </small>
                                                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#2d2d2f' }}>
                                                            {tenant.contacto_nombre}
                                                        </div>
                                                        {tenant.contacto_email && (
                                                            <div style={{ fontSize: '12px', color: '#667eea' }}>
                                                                <i className="fas fa-envelope me-1"></i>{tenant.contacto_email}
                                                            </div>
                                                        )}
                                                        {tenant.contacto_telefono && (
                                                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                                                <i className="fas fa-phone me-1"></i>{tenant.contacto_telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Base de Datos */}
                                                <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                    <small style={{ color: '#6c757d', fontSize: '11px', display: 'block', marginBottom: '3px' }}>
                                                        <i className="fas fa-database me-1"></i>Base de Datos:
                                                    </small>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#495057' }}>
                                                        {tenant.database_name}
                                                    </div>
                                                </div>

                                                {/* Botones de Acción */}
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => this.abrirModalEditar(tenant)}
                                                        style={{
                                                            flex: 1,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '8px 12px',
                                                            fontWeight: 600,
                                                            fontSize: '12px',
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
                                                        <i className="fas fa-edit me-1"></i>Editar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => this.eliminarTenant(tenant.id)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '8px 12px',
                                                            fontWeight: 600,
                                                            fontSize: '12px',
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Modal Crear/Editar Tenant */}
                    {(modalVisible || modalEditarVisible) && (
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
                            onClick={this.cerrarModal}
                        >
                            <div 
                                className="card shadow-lg border-0"
                                style={{
                                    borderRadius: '16px',
                                    maxWidth: '600px',
                                    width: '90%',
                                    maxHeight: '90vh',
                                    background: 'white',
                                    animation: 'fadeIn 0.3s ease',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
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
                                            <i className="fas fa-building me-2"></i>
                                            {modalEditarVisible ? 'Editar Tenant' : 'Nuevo Tenant'}
                                        </h5>
                                        <button
                                            onClick={this.cerrarModal}
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
                                <div className="card-body" style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Nombre del Tenant <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="Ej: Clínica Dental ABC"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-6">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Subdominio <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="subdominio"
                                                value={formData.subdominio}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="Ej: clinica1"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-6">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Nombre de Base de Datos <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="database_name"
                                                value={formData.database_name}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="Ej: tenant_clinica1"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-6">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                <i className="fas fa-calendar-alt me-2" style={{ color: '#667eea' }}></i>
                                                Fecha de Vencimiento
                                            </label>
                                            <input
                                                type="date"
                                                name="fecha_vencimiento"
                                                value={formData.fecha_vencimiento}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-12">
                                            <hr style={{ margin: '15px 0', borderColor: '#e0e0e0' }} />
                                            <h6 style={{ fontWeight: 600, color: '#495057', marginBottom: '15px' }}>
                                                Información de Contacto
                                            </h6>
                                        </div>
                                        <div className="col-md-4">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Nombre de Contacto
                                            </label>
                                            <input
                                                type="text"
                                                name="contacto_nombre"
                                                value={formData.contacto_nombre}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="Nombre del contacto"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-4">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Email de Contacto
                                            </label>
                                            <input
                                                type="email"
                                                name="contacto_email"
                                                value={formData.contacto_email}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="email@ejemplo.com"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-4">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Teléfono de Contacto
                                            </label>
                                            <input
                                                type="text"
                                                name="contacto_telefono"
                                                value={formData.contacto_telefono}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="Teléfono"
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
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
                                        <div className="col-md-12">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Notas
                                            </label>
                                            <textarea
                                                name="notas"
                                                value={formData.notas}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                rows="3"
                                                placeholder="Notas adicionales sobre el tenant..."
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e0e0e0',
                                                    fontSize: '15px',
                                                    transition: 'all 0.2s ease',
                                                    resize: 'vertical'
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
                                        <div className="col-md-6">
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    name="activo"
                                                    checked={formData.activo}
                                                    onChange={this.handleInputChange}
                                                    id="activo"
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        marginRight: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <label htmlFor="activo" style={{ margin: 0, fontWeight: 600, color: '#495057', cursor: 'pointer' }}>
                                                    <i className="fas fa-check-circle me-2" style={{ color: '#28a745' }}></i>
                                                    Activo
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    name="bloqueado"
                                                    checked={formData.bloqueado}
                                                    onChange={this.handleInputChange}
                                                    id="bloqueado"
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        marginRight: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <label htmlFor="bloqueado" style={{ margin: 0, fontWeight: 600, color: '#495057', cursor: 'pointer' }}>
                                                    <i className="fas fa-lock me-2" style={{ color: '#dc3545' }}></i>
                                                    Bloqueado
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer border-0" style={{
                                    background: 'transparent',
                                    padding: '20px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '10px'
                                }}>
                                    <button
                                        className="btn"
                                        onClick={this.cerrarModal}
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
                                        onClick={this.guardarTenant}
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
                                        <i className="fas fa-save me-2"></i>Guardar
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

export default AdministrarTenants;
