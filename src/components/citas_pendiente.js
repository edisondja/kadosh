import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import Notacion from '../cuaderno.png';

class CitaPendiente extends React.Component{


        constructor(props){
            super(props);
            this.state= {
                citas:[]
            }
        }
        
        componentDidMount(){
            this.cargar_citas();
        }

        cargar_citas=()=>{

            Axios.get(`${Core.url_base}/api/cargar_citas/`).then(data=>{
                    this.setState({citas:data.data});
                    console.log(data.data);
            }).catch(error=>{
                Alertify.message(error);
            });

        }

        render(){
            return (
                <>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    <div className="col-12 col-md-10" style={{ 
                        backgroundColor: '#f5f5f7',
                        minHeight: '100vh',
                        padding: '30px',
                        borderRadius: '16px'
                    }}>
                        {/* Header principal */}
                        <div className="card border-0 shadow-lg mb-4" style={{ 
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            overflow: 'hidden',
                            animation: 'fadeIn 0.5s ease'
                        }}>
                            <div className="card-body text-white p-4">
                                <div className="d-flex align-items-center flex-wrap">
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
                                        <i className="fas fa-calendar-check"></i>
                                    </div>
                                    <div>
                                        <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                                            Administración de Citas
                                        </h2>
                                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                                            Gestione todas las citas programadas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de citas */}
                        <div className="card border-0 shadow-sm" style={{ 
                            borderRadius: '16px',
                            animation: 'slideUp 0.6s ease'
                        }}>
                            <div className="card-header border-0" style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                borderRadius: '16px 16px 0 0',
                                padding: '20px'
                            }}>
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <h5 className="mb-0" style={{ 
                                        fontWeight: 600, 
                                        fontSize: '18px',
                                        color: '#2d2d2f',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>
                                        Lista de Citas ({this.state.citas.length})
                                    </h5>
                                    <button 
                                        className="btn"
                                        onClick={this.cargar_citas}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <i className="fas fa-sync-alt me-2"></i>Actualizar
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {this.state.citas.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead style={{
                                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                                            }}>
                                                <tr>
                                                    <th style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '13px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        color: '#6c757d',
                                                        padding: '15px 20px',
                                                        border: 'none'
                                                    }}>Paciente</th>
                                                    <th style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '13px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        color: '#6c757d',
                                                        padding: '15px 20px',
                                                        border: 'none'
                                                    }}>Teléfono</th>
                                                    <th style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '13px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        color: '#6c757d',
                                                        padding: '15px 20px',
                                                        border: 'none'
                                                    }}>Fecha</th>
                                                    <th style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '13px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        color: '#6c757d',
                                                        padding: '15px 20px',
                                                        border: 'none'
                                                    }}>Hora</th>
                                                    <th style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '13px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        color: '#6c757d',
                                                        padding: '15px 20px',
                                                        border: 'none',
                                                        textAlign: 'center'
                                                    }}>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.citas.map((data, index) => (
                                                    <tr key={index} style={{
                                                        transition: 'all 0.2s ease',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}>
                                                        <td style={{ padding: '15px 20px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <div style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    marginRight: '12px',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {data.nombre ? data.nombre.charAt(0).toUpperCase() : 'P'}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, color: '#2d2d2f', fontSize: '15px' }}>
                                                                        {data.nombre} {data.apellido}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', color: '#6c757d' }}>
                                                            <i className="fas fa-phone me-2" style={{ color: '#667eea' }}></i>
                                                            {data.telefono || 'N/A'}
                                                        </td>
                                                        <td style={{ padding: '15px 20px' }}>
                                                            <span className="badge" style={{
                                                                background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                                                                color: 'white',
                                                                padding: '6px 12px',
                                                                borderRadius: '8px',
                                                                fontSize: '13px',
                                                                fontWeight: 600
                                                            }}>
                                                                <i className="fas fa-calendar me-1"></i>
                                                                {data.dia || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '15px 20px' }}>
                                                            <span className="badge" style={{
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                padding: '6px 12px',
                                                                borderRadius: '8px',
                                                                fontSize: '13px',
                                                                fontWeight: 600
                                                            }}>
                                                                <i className="fas fa-clock me-1"></i>
                                                                {data.hora || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                            <button 
                                                                className="btn"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '8px 16px',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    transition: 'all 0.2s ease',
                                                                    minWidth: '100px'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'translateY(-2px)';
                                                                    e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.4)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = 'translateY(0)';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <i className="fas fa-eye me-1"></i>Ver
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center p-5" style={{ color: '#6c757d' }}>
                                        <i className="fas fa-calendar-times" style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }}></i>
                                        <h5 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>No hay citas registradas</h5>
                                        <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>Las citas aparecerán aquí cuando sean creadas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            );

        }




}

export default CitaPendiente;