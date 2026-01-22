import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';


class Nomina extends React.Component{


     constructor(props){
        
        super(props);
        this.state = {
            nominas: [],
            detalleVisible: null,
            mostrarFormularioPago: false,
            pagoSeleccionado: null,
            pagosRegistrados: []
        }

     }

     componentDidMount(){
        // Establecer fechas por defecto (mes actual)
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        document.getElementById("fecha_i").value = primerDia.toISOString().split('T')[0];
        document.getElementById("fecha_f").value = ultimoDia.toISOString().split('T')[0];
        
        this.cargar_nominas();
        this.cargarPagosRegistrados();
     }

     cargar_nominas=()=>{

        let fecha_i = document.getElementById("fecha_i").value;
        let fecha_f = document.getElementById("fecha_f").value;

        if (!fecha_i || !fecha_f) {
            Alertify.warning("Por favor seleccione ambas fechas");
            return;
        }

        Core.calcular_nomina_doctores(fecha_i, fecha_f).then(data=>{

            console.log(data);
            this.setState({nominas: data})
        
        }).catch(error=>{

            Alertify.error("Error: no se pudo cargar la nómina de los doctores");
            console.error(error);

        });

     }

     cargarPagosRegistrados = () => {
        Core.listar_pagos_nomina().then(data => {
            this.setState({ pagosRegistrados: data });
        }).catch(error => {
            console.error("Error al cargar pagos registrados:", error);
        });
     }

     mostrarDetalle = (doctorId) => {
        this.setState({ detalleVisible: this.state.detalleVisible === doctorId ? null : doctorId });
     }

     abrirFormularioPago = (nomina) => {
        this.setState({
            mostrarFormularioPago: true,
            pagoSeleccionado: nomina
        });
     }

     cerrarFormularioPago = () => {
        this.setState({
            mostrarFormularioPago: false,
            pagoSeleccionado: null
        });
     }

     registrarPago = () => {
        const { pagoSeleccionado } = this.state;
        const fecha_i = document.getElementById("fecha_i").value;
        const fecha_f = document.getElementById("fecha_f").value;
        const comentarios = document.getElementById("comentarios_pago").value || '';

        const datosPago = {
            doctor_id: pagoSeleccionado.doctor_id,
            fecha_pago: new Date().toISOString().split('T')[0],
            periodo_inicio: fecha_i,
            periodo_fin: fecha_f,
            monto_comisiones: pagoSeleccionado.ganancias_doctor,
            salario_base: 0,
            total_pago: pagoSeleccionado.ganancias_doctor,
            estado: 'pendiente',
            comentarios: comentarios,
            tipo: 'comision'
        };

        Core.registrar_pago_nomina(datosPago).then(response => {
            Alertify.success("Pago de nómina registrado correctamente");
            this.cerrarFormularioPago();
            this.cargarPagosRegistrados();
        }).catch(error => {
            Alertify.error("Error al registrar el pago");
            console.error(error);
        });
     }

     render(){

        const { nominas, detalleVisible, mostrarFormularioPago, pagoSeleccionado } = this.state;

        return(
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
                                <i className="fas fa-money-check-alt"></i>
                            </div>
                            <div>
                                <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                    Módulo de Nómina
                                </h2>
                                <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                    Gestión de pagos y comisiones de doctores
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros de búsqueda */}
                <div className="card border-0 shadow-sm mb-4" style={{ 
                    borderRadius: '16px',
                    background: '#ffffff',
                    animation: 'slideUp 0.6s ease'
                }}>
                    <div className="card-body p-4">
                        <div className="row align-items-end">
                            <div className="col-md-4 mb-3">
                                <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                    <i className="fas fa-calendar-alt me-2" style={{ color: '#667eea' }}></i>
                                    Fecha Inicial
                                </label>
                                <input 
                                    type="date" 
                                    id="fecha_i" 
                                    className="form-control" 
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
                            <div className="col-md-4 mb-3">
                                <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                    <i className="fas fa-calendar-check me-2" style={{ color: '#667eea' }}></i>
                                    Fecha Final
                                </label>
                                <input 
                                    type="date" 
                                    id="fecha_f" 
                                    className="form-control" 
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
                            <div className="col-md-4 mb-3">
                                <button 
                                    className="btn w-100" 
                                    onClick={this.cargar_nominas}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
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
                                    <i className="fas fa-search me-2"></i>
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de nóminas */}
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
                                            <i className="fas fa-user me-2"></i>Nombre
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none' }}>
                                            <i className="fas fa-user me-2"></i>Apellido
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right' }}>
                                            <i className="fas fa-building me-2"></i>Ganancias Clínica
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right' }}>
                                            <i className="fas fa-user-md me-2"></i>Comisiones Doctor
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right' }}>
                                            <i className="fas fa-dollar-sign me-2"></i>Ingresos Totales
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'center' }}>
                                            <i className="fas fa-receipt me-2"></i>Recibos
                                        </th>
                                        <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'center' }}>
                                            <i className="fas fa-cog me-2"></i>Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nominas.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                <div style={{ color: '#6b7280', fontSize: '16px' }}>
                                                    <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5, display: 'block' }}></i>
                                                    No hay datos para mostrar. Seleccione un rango de fechas y haga clic en "Buscar".
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        nominas.map((data, index) => (
                                            <React.Fragment key={index}>
                                                <tr style={{ 
                                                    borderBottom: '1px solid #e5e7eb',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                                }}
                                                >
                                                    <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                        {data.nombre}
                                                    </td>
                                                    <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                        {data.apellido}
                                                    </td>
                                                    <td style={{ padding: '16px 20px', color: '#6b7280', textAlign: 'right', fontWeight: 500 }}>
                                                        RD$ {new Intl.NumberFormat('es-DO').format(data.ganancias_clinica || 0)}
                                                    </td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '15px' }}>
                                                        RD$ {new Intl.NumberFormat('es-DO').format(data.ganancias_doctor || 0)}
                                                    </td>
                                                    <td style={{ padding: '16px 20px', color: '#1f2937', textAlign: 'right', fontWeight: 600 }}>
                                                        RD$ {new Intl.NumberFormat('es-DO').format(data.monto || 0)}
                                                    </td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                        <span style={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                            fontWeight: 600
                                                        }}>
                                                            {data.recibos || 0}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                            <button 
                                                                className="btn btn-sm" 
                                                                onClick={() => this.mostrarDetalle(data.doctor_id)}
                                                                style={{
                                                                    background: detalleVisible === data.doctor_id 
                                                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                                                        : '#f3f4f6',
                                                                    color: detalleVisible === data.doctor_id ? 'white' : '#4b5563',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    transition: 'all 0.2s ease',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (detalleVisible !== data.doctor_id) {
                                                                        e.target.style.background = '#e5e7eb';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (detalleVisible !== data.doctor_id) {
                                                                        e.target.style.background = '#f3f4f6';
                                                                    }
                                                                }}
                                                            >
                                                                <i className={`fas ${detalleVisible === data.doctor_id ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                                                                {detalleVisible === data.doctor_id ? 'Ocultar' : 'Ver'} Detalle
                                                            </button>
                                                            {data.ganancias_doctor > 0 && (
                                                                <button 
                                                                    className="btn btn-sm" 
                                                                    onClick={() => this.abrirFormularioPago(data)}
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        padding: '6px 12px',
                                                                        fontSize: '13px',
                                                                        fontWeight: 600,
                                                                        transition: 'all 0.2s ease',
                                                                        cursor: 'pointer',
                                                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.transform = 'translateY(-2px)';
                                                                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.transform = 'translateY(0)';
                                                                        e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                                                    }}
                                                                >
                                                                    <i className="fas fa-money-bill-wave me-1"></i>
                                                                    Registrar Pago
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {detalleVisible === data.doctor_id && data.detalle_procedimientos && (
                                                    <tr>
                                                        <td colSpan="7" style={{ backgroundColor: '#f9fafb', padding: '20px' }}>
                                                            <div style={{
                                                                background: '#ffffff',
                                                                borderRadius: '12px',
                                                                padding: '20px',
                                                                border: '1px solid #e5e7eb'
                                                            }}>
                                                                <h5 style={{ 
                                                                    color: '#1f2937', 
                                                                    fontWeight: 700, 
                                                                    marginBottom: '16px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px'
                                                                }}>
                                                                    <i className="fas fa-list-alt" style={{ color: '#667eea' }}></i>
                                                                    Detalle de Comisiones por Procedimiento
                                                                </h5>
                                                                <div style={{ overflowX: 'auto' }}>
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                        <thead>
                                                                            <tr style={{ background: '#f3f4f6' }}>
                                                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#4b5563', fontSize: '13px', borderBottom: '2px solid #e5e7eb' }}>Procedimiento</th>
                                                                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#4b5563', fontSize: '13px', borderBottom: '2px solid #e5e7eb' }}>Cantidad</th>
                                                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#4b5563', fontSize: '13px', borderBottom: '2px solid #e5e7eb' }}>Precio Unitario</th>
                                                                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#4b5563', fontSize: '13px', borderBottom: '2px solid #e5e7eb' }}>Comisión %</th>
                                                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#4b5563', fontSize: '13px', borderBottom: '2px solid #e5e7eb' }}>Total Comisión</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {data.detalle_procedimientos.map((proc, idx) => (
                                                                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                                                    <td style={{ padding: '12px 16px', color: '#1f2937', fontWeight: 500 }}>{proc.nombre}</td>
                                                                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{proc.cantidad}</td>
                                                                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>
                                                                                        RD$ {new Intl.NumberFormat('es-DO').format(proc.precio_unitario)}
                                                                                    </td>
                                                                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{proc.comision_porcentaje}%</td>
                                                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                                                                                        RD$ {new Intl.NumberFormat('es-DO').format(proc.total_comision)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal para registrar pago */}
                {mostrarFormularioPago && pagoSeleccionado && (
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
                    onClick={this.cerrarFormularioPago}
                    >
                        <div style={{
                            backgroundColor: 'white',
                            padding: '0',
                            borderRadius: '16px',
                            maxWidth: '550px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            animation: 'slideUp 0.4s ease'
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
                                            Registrar Pago de Nómina
                                        </h3>
                                    </div>
                                    <button
                                        onClick={this.cerrarFormularioPago}
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
                                            <i className="fas fa-user-md me-2" style={{ color: '#667eea' }}></i>
                                            Doctor
                                        </label>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                                            {pagoSeleccionado.nombre} {pagoSeleccionado.apellido}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            <i className="fas fa-calendar-alt me-2" style={{ color: '#667eea' }}></i>
                                            Período
                                        </label>
                                        <div style={{ fontSize: '15px', color: '#4b5563' }}>
                                            {document.getElementById("fecha_i")?.value || ''} a {document.getElementById("fecha_f")?.value || ''}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                            <i className="fas fa-dollar-sign me-2" style={{ color: '#667eea' }}></i>
                                            Monto a Pagar
                                        </label>
                                        <div style={{ 
                                            fontSize: '28px', 
                                            fontWeight: 700, 
                                            color: '#10b981',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            RD$ {new Intl.NumberFormat('es-DO').format(pagoSeleccionado.ganancias_doctor)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-comment me-2" style={{ color: '#667eea' }}></i>
                                        Comentarios (opcional)
                                    </label>
                                    <textarea 
                                        id="comentarios_pago" 
                                        className="form-control" 
                                        rows="4"
                                        placeholder="Agregar comentarios adicionales sobre el pago..."
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
                                        onClick={this.cerrarFormularioPago}
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
                                        onClick={this.registrarPago}
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
                                        Registrar Pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección de pagos registrados */}
                {this.state.pagosRegistrados.length > 0 && (
                    <div className="card border-0 shadow-sm" style={{ 
                        borderRadius: '16px',
                        background: '#ffffff',
                        animation: 'slideUp 0.8s ease',
                        overflow: 'hidden'
                    }}>
                        <div className="card-body p-0">
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '20px 30px',
                                color: 'white'
                            }}>
                                <h3 className="mb-0" style={{ fontWeight: 700, fontSize: '22px' }}>
                                    <i className="fas fa-history me-2"></i>
                                    Historial de Pagos de Nómina
                                </h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f3f4f6' }}>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'left', color: '#4b5563' }}>
                                                <i className="fas fa-calendar me-2" style={{ color: '#667eea' }}></i>Fecha Pago
                                            </th>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'left', color: '#4b5563' }}>
                                                <i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>Doctor/Empleado
                                            </th>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'left', color: '#4b5563' }}>
                                                <i className="fas fa-calendar-alt me-2" style={{ color: '#667eea' }}></i>Período
                                            </th>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right', color: '#4b5563' }}>
                                                <i className="fas fa-percent me-2" style={{ color: '#667eea' }}></i>Comisiones
                                            </th>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right', color: '#4b5563' }}>
                                                <i className="fas fa-money-bill me-2" style={{ color: '#667eea' }}></i>Salario Base
                                            </th>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'right', color: '#4b5563' }}>
                                                <i className="fas fa-dollar-sign me-2" style={{ color: '#667eea' }}></i>Total
                                            </th>
                                            <th style={{ padding: '16px 20px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', textAlign: 'center', color: '#4b5563' }}>
                                                <i className="fas fa-info-circle me-2" style={{ color: '#667eea' }}></i>Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.pagosRegistrados.map((pago, idx) => (
                                            <tr key={idx} style={{ 
                                                borderBottom: '1px solid #e5e7eb',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                            }}
                                            >
                                                <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                    {pago.fecha_pago}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#1f2937', fontWeight: 500 }}>
                                                    {pago.doctor ? `${pago.doctor.nombre} ${pago.doctor.apellido || ''}` : 
                                                     pago.empleado ? `${pago.empleado.nombre} ${pago.empleado.apellido || ''}` : 
                                                     'N/A'}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>
                                                    {pago.periodo_inicio} a {pago.periodo_fin}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>
                                                    RD$ {new Intl.NumberFormat('es-DO').format(pago.monto_comisiones)}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>
                                                    RD$ {new Intl.NumberFormat('es-DO').format(pago.salario_base)}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '15px' }}>
                                                    RD$ {new Intl.NumberFormat('es-DO').format(pago.total_pago)}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                    <span style={{
                                                        background: pago.estado === 'pagado' 
                                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {pago.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
     }
} 

export default Nomina;
