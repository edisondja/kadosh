import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';

class AsignarGananciasRecibos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recibos: [],
            doctores: [],
            doctorSeleccionado: '',
            fecha_i: '',
            fecha_f: '',
            reciboSeleccionado: null,
            mostrarModal: false,
            gananciaDoctor: '',
            gananciaClinica: '',
            comisionPorcentaje: '',
            observaciones: '',
            cargando: false
        };
    }

    componentDidMount() {
        // Establecer fechas por defecto (mes actual)
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        this.setState({
            fecha_i: primerDia.toISOString().split('T')[0],
            fecha_f: ultimoDia.toISOString().split('T')[0]
        });

        this.cargarDoctores();
    }

    cargarDoctores = () => {
        Core.cargar_doctores(this);
    }

    cargarRecibos = () => {
        const { fecha_i, fecha_f, doctorSeleccionado } = this.state;

        if (!fecha_i || !fecha_f) {
            Alertify.warning("Por favor seleccione ambas fechas");
            return;
        }

        this.setState({ cargando: true });

        const params = {
            fecha_i: fecha_i,
            fecha_f: fecha_f
        };

        if (doctorSeleccionado && doctorSeleccionado !== 'todos') {
            params.doctor_id = doctorSeleccionado;
        }

        Axios.get(`${Core.url_base}/api/listar_recibos_ganancias`, { params })
            .then(response => {
                this.setState({ recibos: response.data || [], cargando: false });
            })
            .catch(error => {
                Alertify.error("Error al cargar recibos");
                console.error(error);
                this.setState({ cargando: false });
            });
    }

    abrirModalAsignar = (recibo) => {
        const gananciaDoctor = recibo.ganancia_doctor || '';
        const gananciaClinica = recibo.ganancia_clinica || '';
        const montoRecibo = recibo.monto || 0;
        
        // Calcular porcentaje si hay ganancia asignada
        let comisionPorcentaje = '';
        if (gananciaDoctor && montoRecibo > 0) {
            comisionPorcentaje = ((parseFloat(gananciaDoctor) / montoRecibo) * 100).toFixed(2);
        }

        this.setState({
            reciboSeleccionado: recibo,
            mostrarModal: true,
            gananciaDoctor: gananciaDoctor,
            gananciaClinica: gananciaClinica || (montoRecibo - (gananciaDoctor || 0)),
            comisionPorcentaje: comisionPorcentaje,
            observaciones: recibo.observaciones || ''
        });
    }

    cerrarModal = () => {
        this.setState({
            mostrarModal: false,
            reciboSeleccionado: null,
            gananciaDoctor: '',
            gananciaClinica: '',
            comisionPorcentaje: '',
            observaciones: ''
        });
    }

    calcularGananciaClinica = () => {
        const { reciboSeleccionado, gananciaDoctor } = this.state;
        if (reciboSeleccionado && gananciaDoctor) {
            const montoRecibo = reciboSeleccionado.monto || 0;
            const gananciaDoc = parseFloat(gananciaDoctor) || 0;
            const gananciaClin = montoRecibo - gananciaDoc;
            this.setState({ gananciaClinica: gananciaClin >= 0 ? gananciaClin : 0 });
        }
    }

    calcularPorComision = () => {
        const { reciboSeleccionado, comisionPorcentaje } = this.state;
        if (reciboSeleccionado && comisionPorcentaje) {
            const montoRecibo = reciboSeleccionado.monto || 0;
            const porcentaje = parseFloat(comisionPorcentaje) || 0;
            
            if (porcentaje >= 0 && porcentaje <= 100) {
                const gananciaDoc = (montoRecibo * porcentaje) / 100;
                const gananciaClin = montoRecibo - gananciaDoc;
                this.setState({ 
                    gananciaDoctor: gananciaDoc.toFixed(2),
                    gananciaClinica: gananciaClin >= 0 ? gananciaClin.toFixed(2) : '0.00'
                });
            }
        }
    }

    calcularPorMonto = () => {
        const { reciboSeleccionado, gananciaDoctor } = this.state;
        if (reciboSeleccionado && gananciaDoctor) {
            const montoRecibo = reciboSeleccionado.monto || 0;
            const gananciaDoc = parseFloat(gananciaDoctor) || 0;
            const porcentaje = montoRecibo > 0 ? ((gananciaDoc / montoRecibo) * 100).toFixed(2) : '0.00';
            const gananciaClin = montoRecibo - gananciaDoc;
            this.setState({ 
                comisionPorcentaje: porcentaje,
                gananciaClinica: gananciaClin >= 0 ? gananciaClin.toFixed(2) : '0.00'
            });
        }
    }

    asignarGanancia = () => {
        const { reciboSeleccionado, gananciaDoctor, gananciaClinica, observaciones } = this.state;

        if (!reciboSeleccionado) {
            Alertify.warning("No hay recibo seleccionado");
            return;
        }

        if (!gananciaDoctor || parseFloat(gananciaDoctor) < 0) {
            Alertify.warning("Ingrese una ganancia válida para el doctor");
            return;
        }

        const montoRecibo = reciboSeleccionado.monto || 0;
        const gananciaDoc = parseFloat(gananciaDoctor) || 0;
        const gananciaClin = parseFloat(gananciaClinica) || 0;

        if ((gananciaDoc + gananciaClin) > montoRecibo) {
            Alertify.error("La suma de ganancias no puede exceder el monto del recibo");
            return;
        }

        const datos = {
            id_recibo: reciboSeleccionado.id,
            id_doctor: reciboSeleccionado.doctor.id,
            ganancia_doctor: gananciaDoc,
            ganancia_clinica: gananciaClin,
            observaciones: observaciones
        };

        Axios.post(`${Core.url_base}/api/asignar_ganancia_recibo`, datos)
            .then(response => {
                Alertify.success("Ganancia asignada correctamente");
                this.cerrarModal();
                this.cargarRecibos();
            })
            .catch(error => {
                Alertify.error("Error al asignar ganancia");
                console.error(error);
            });
    }

    eliminarGanancia = (recibo) => {
        if (!recibo.tiene_ganancia_asignada || !recibo.ganancia_id) {
            return;
        }

        Alertify.confirm(
            "¿Está seguro de eliminar la ganancia asignada?",
            () => {
                Axios.delete(`${Core.url_base}/api/eliminar_ganancia_recibo/${recibo.ganancia_id}`)
                    .then(() => {
                        Alertify.success("Ganancia eliminada correctamente");
                        this.cargarRecibos();
                    })
                    .catch(error => {
                        Alertify.error("Error al eliminar ganancia");
                        console.error(error);
                    });
            },
            () => {}
        );
    }

    render() {
        const { recibos, doctores, doctorSeleccionado, fecha_i, fecha_f, mostrarModal, reciboSeleccionado, gananciaDoctor, gananciaClinica, comisionPorcentaje, observaciones, cargando } = this.state;

        return (
            <div className="col-md-10" style={{ padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                {/* Header */}
                <div className="card border-0 shadow-lg mb-4" style={{ 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <div className="card-body text-white p-4">
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
                                <i className="fas fa-money-bill-wave"></i>
                            </div>
                            <div>
                                <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                    Asignar Ganancias por Recibo
                                </h2>
                                <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                    Asigne ganancias a doctores por cada pago de recibo
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="card border-0 shadow-sm mb-4" style={{ 
                    borderRadius: '16px',
                    background: '#ffffff',
                    animation: 'slideUp 0.6s ease'
                }}>
                    <div className="card-body p-4">
                        <div className="row align-items-end">
                            <div className="col-md-3 mb-3">
                                <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                    <i className="fas fa-user-md me-2" style={{ color: '#667eea' }}></i>
                                    Doctor
                                </label>
                                <select
                                    className="form-control"
                                    value={doctorSeleccionado}
                                    onChange={(e) => this.setState({ doctorSeleccionado: e.target.value })}
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e0e0e0',
                                        padding: '16px 16px',
                                        fontSize: '15px',
                                        minHeight: '52px',
                                        height: '52px',
                                        lineHeight: '20px',
                                        transition: 'all 0.2s ease',
                                        background: '#ffffff',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 16px center',
                                        paddingRight: '40px'
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
                                    <option value="todos">Todos los doctores</option>
                                    {doctores.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.nombre} {doctor.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 mb-3">
                                <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                    <i className="fas fa-calendar-alt me-2" style={{ color: '#667eea' }}></i>
                                    Fecha Inicial
                                </label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={fecha_i}
                                    onChange={(e) => this.setState({ fecha_i: e.target.value })}
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e0e0e0',
                                        padding: '12px 16px',
                                        fontSize: '15px',
                                        transition: 'all 0.2s ease',
                                        background: '#ffffff'
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
                            <div className="col-md-3 mb-3">
                                <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                    <i className="fas fa-calendar-check me-2" style={{ color: '#667eea' }}></i>
                                    Fecha Final
                                </label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={fecha_f}
                                    onChange={(e) => this.setState({ fecha_f: e.target.value })}
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e0e0e0',
                                        padding: '12px 16px',
                                        fontSize: '15px',
                                        transition: 'all 0.2s ease',
                                        background: '#ffffff'
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
                            <div className="col-md-3 mb-3">
                                <button 
                                    className="btn w-100" 
                                    onClick={this.cargarRecibos}
                                    disabled={cargando}
                                    style={{
                                        background: cargando 
                                            ? '#e0e0e0' 
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: cargando ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
                                        cursor: cargando ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!cargando) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!cargando) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                        }
                                    }}
                                >
                                    {cargando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Cargando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-search me-2"></i>
                                            Buscar Recibos
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de recibos */}
                <div className="card border-0 shadow-sm mb-4" style={{ 
                    borderRadius: '16px',
                    background: '#ffffff',
                    animation: 'slideUp 0.7s ease',
                    overflow: 'hidden'
                }}>
                    <div className="card-body p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none' }}>
                                            <i className="fas fa-hashtag me-2"></i>Código
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none' }}>
                                            <i className="fas fa-user-md me-2"></i>Doctor
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none' }}>
                                            <i className="fas fa-user me-2"></i>Paciente
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right' }}>
                                            <i className="fas fa-dollar-sign me-2"></i>Monto
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none' }}>
                                            <i className="fas fa-calendar me-2"></i>Fecha
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right' }}>
                                            <i className="fas fa-user-md me-2"></i>Ganancia Doctor
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right' }}>
                                            <i className="fas fa-building me-2"></i>Ganancia Clínica
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'center' }}>
                                            <i className="fas fa-cog me-2"></i>Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recibos.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                <div style={{ color: '#6b7280', fontSize: '16px' }}>
                                                    <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5, display: 'block' }}></i>
                                                    No hay recibos para mostrar. Seleccione un rango de fechas y haga clic en "Buscar Recibos".
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        recibos.map((recibo, index) => (
                                            <tr key={index} style={{ 
                                                borderBottom: '1px solid #e5e7eb',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: recibo.tiene_ganancia_asignada ? '#f0fdf4' : '#ffffff'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = recibo.tiene_ganancia_asignada ? '#dcfce7' : '#f9fafb';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = recibo.tiene_ganancia_asignada ? '#f0fdf4' : '#ffffff';
                                            }}
                                            >
                                                <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                    {recibo.codigo_recibo}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                    {recibo.doctor.nombre} {recibo.doctor.apellido}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                    {recibo.paciente.nombre} {recibo.paciente.apellido}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#1f2937', textAlign: 'right', fontWeight: 600 }}>
                                                    RD$ {new Intl.NumberFormat('es-DO').format(recibo.monto)}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>
                                                    {new Date(recibo.fecha_pago).toLocaleDateString('es-DO')}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: recibo.ganancia_doctor ? '#10b981' : '#9ca3af', fontSize: '15px' }}>
                                                    {recibo.ganancia_doctor ? `RD$ ${new Intl.NumberFormat('es-DO').format(recibo.ganancia_doctor)}` : '-'}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: recibo.ganancia_clinica ? '#667eea' : '#9ca3af', fontSize: '15px' }}>
                                                    {recibo.ganancia_clinica ? `RD$ ${new Intl.NumberFormat('es-DO').format(recibo.ganancia_clinica)}` : '-'}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        <button 
                                                            className="btn btn-sm" 
                                                            onClick={() => this.abrirModalAsignar(recibo)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 12px',
                                                                fontSize: '13px',
                                                                fontWeight: 600,
                                                                transition: 'all 0.2s ease',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'translateY(-2px)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-edit me-1"></i>
                                                            {recibo.tiene_ganancia_asignada ? 'Editar' : 'Asignar'}
                                                        </button>
                                                        {recibo.tiene_ganancia_asignada && (
                                                            <button 
                                                                className="btn btn-sm" 
                                                                onClick={() => this.eliminarGanancia(recibo)}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    transition: 'all 0.2s ease',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'translateY(-2px)';
                                                                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = 'translateY(0)';
                                                                    e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                                                                }}
                                                            >
                                                                <i className="fas fa-trash me-1"></i>
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal para asignar ganancia */}
                {mostrarModal && reciboSeleccionado && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1050,
                        animation: 'fadeIn 0.3s ease'
                    }}
                    onClick={this.cerrarModal}
                    >
                        <div style={{
                            backgroundColor: 'white',
                            padding: '0',
                            borderRadius: '16px',
                            maxWidth: '600px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            animation: 'slideUp 0.4s ease',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header del modal */}
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '24px 30px',
                                color: 'white'
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h3 className="mb-0" style={{ fontWeight: 700, fontSize: '22px' }}>
                                            <i className="fas fa-money-bill-wave me-2"></i>
                                            Asignar Ganancia por Recibo
                                        </h3>
                                    </div>
                                    <button
                                        onClick={this.cerrarModal}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontSize: '18px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.2)';
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Body del modal */}
                            <div style={{ padding: '30px' }}>
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            <i className="fas fa-hashtag me-2" style={{ color: '#667eea' }}></i>
                                            Código Recibo
                                        </label>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                                            {reciboSeleccionado.codigo_recibo}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            <i className="fas fa-user-md me-2" style={{ color: '#667eea' }}></i>
                                            Doctor
                                        </label>
                                        <div style={{ fontSize: '15px', color: '#4b5563' }}>
                                            {reciboSeleccionado.doctor.nombre} {reciboSeleccionado.doctor.apellido}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            <i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>
                                            Paciente
                                        </label>
                                        <div style={{ fontSize: '15px', color: '#4b5563' }}>
                                            {reciboSeleccionado.paciente.nombre} {reciboSeleccionado.paciente.apellido}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            <i className="fas fa-dollar-sign me-2" style={{ color: '#667eea' }}></i>
                                            Monto del Recibo
                                        </label>
                                        <div style={{ 
                                            fontSize: '24px', 
                                            fontWeight: 700, 
                                            color: '#10b981'
                                        }}>
                                            RD$ {new Intl.NumberFormat('es-DO').format(reciboSeleccionado.monto)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-percentage me-2" style={{ color: '#667eea' }}></i>
                                        Comisión del Doctor (%)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={comisionPorcentaje}
                                        onChange={(e) => {
                                            this.setState({ comisionPorcentaje: e.target.value });
                                            setTimeout(() => this.calcularPorComision(), 100);
                                        }}
                                        placeholder="0.00"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            padding: '14px 18px',
                                            fontSize: '16px',
                                            transition: 'all 0.2s ease',
                                            background: '#ffffff',
                                            fontWeight: 600
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
                                    <small style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                                        Ingrese el porcentaje de comisión (0-100%) y el sistema calculará automáticamente las ganancias
                                    </small>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-user-md me-2" style={{ color: '#667eea' }}></i>
                                        Ganancia para el Doctor (RD$)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={gananciaDoctor}
                                        onChange={(e) => {
                                            this.setState({ gananciaDoctor: e.target.value });
                                            setTimeout(() => this.calcularPorMonto(), 100);
                                        }}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            padding: '14px 18px',
                                            fontSize: '16px',
                                            transition: 'all 0.2s ease',
                                            background: '#ffffff',
                                            fontWeight: 600
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
                                    <small style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                                        O ingrese el monto directamente. El porcentaje se calculará automáticamente
                                    </small>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-building me-2" style={{ color: '#667eea' }}></i>
                                        Ganancia para la Clínica (RD$)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={gananciaClinica}
                                        onChange={(e) => this.setState({ gananciaClinica: e.target.value })}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            padding: '14px 18px',
                                            fontSize: '16px',
                                            transition: 'all 0.2s ease',
                                            background: '#ffffff',
                                            fontWeight: 600
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
                                    <small style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                                        Se calcula automáticamente como: Monto del Recibo - Ganancia Doctor
                                    </small>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-comment me-2" style={{ color: '#667eea' }}></i>
                                        Observaciones (opcional)
                                    </label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={observaciones}
                                        onChange={(e) => this.setState({ observaciones: e.target.value })}
                                        placeholder="Agregar observaciones sobre la asignación de ganancias..."
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            padding: '12px 16px',
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

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <button 
                                        className="btn" 
                                        onClick={this.cerrarModal}
                                        style={{
                                            background: '#f3f4f6',
                                            color: '#4b5563',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#e5e7eb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = '#f3f4f6';
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="btn" 
                                        onClick={this.asignarGanancia}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                        }}
                                    >
                                        <i className="fas fa-check me-2"></i>
                                        {reciboSeleccionado.tiene_ganancia_asignada ? 'Actualizar' : 'Asignar'} Ganancia
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default AsignarGananciasRecibos;
