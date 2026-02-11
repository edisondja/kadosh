import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams } from 'react-router-dom';
import Core  from './funciones_extras';
import Alertify from 'alertifyjs';
import Axios from 'axios';

const VerOdontogramas = (props) => {
    const { id_paciente } = useParams();
    const [odontogramas, setOdontogramas] = useState([]);
    const [paciente, setPaciente] = useState({});
    const [loading, setLoading] = useState(true);
    const [doctorId, setDoctorId] = useState(null);

    const cargarPrimerDoctor = useCallback(() => {
        Axios.get(`${Core.url_base}/api/doctores`)
            .then(response => {
                if (response.data && response.data.length > 0) {
                    setDoctorId(response.data[0].id);
                } else {
                    Alertify.warning("No hay doctores disponibles. Por favor, agregue un doctor primero.");
                }
            })
            .catch(error => {
                console.error("Error al cargar doctores:", error);
            });
    }, []);

    const cargar_odontogramas = useCallback(() => {
        setLoading(true);
        Core.obtener_odontogramas(id_paciente)
        .then(data => {
            setOdontogramas(data);
            // Si hay odontogramas, usar el doctor_id del más reciente
            if (data && data.length > 0 && data[0].doctor_id) {
                setDoctorId(data[0].doctor_id);
            } else {
                // Si no hay odontogramas, obtener el primer doctor disponible
                cargarPrimerDoctor();
            }
            setLoading(false);
        })
        .catch(error => {
            console.log(error);
            setLoading(false);
            // Si falla, intentar obtener un doctor por defecto
            cargarPrimerDoctor();
        });
    }, [id_paciente, cargarPrimerDoctor]);

    const cargar_paciente = useCallback(() => {
        Axios.get(`${Core.url_base}/api/paciente/${id_paciente}`)
        .then(data => {
            setPaciente(data.data);
        })
        .catch(error => {
            console.log(error);
        });
    }, [id_paciente]);

    useEffect(() => {
        cargar_odontogramas();
        cargar_paciente();
    }, [cargar_odontogramas, cargar_paciente]);

    // Cargar primer doctor si no hay odontogramas
    useEffect(() => {
        if (!doctorId && !loading) {
            cargarPrimerDoctor();
        }
    }, [doctorId, loading]);

    const eliminarOdontograma = (id) => {
        if (window.confirm('¿Está seguro de eliminar este odontograma?')) {
            const usuarioId = localStorage.getItem("id_usuario");
            Axios.delete(`${Core.url_base}/api/eliminar_odontograma/${id}`, {
                params: { usuario_id: usuarioId }
            })
            .then(() => {
                Alertify.success("Odontograma eliminado correctamente");
                cargar_odontogramas();
            })
            .catch(error => {
                Alertify.error("Error al eliminar el odontograma");
            });
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button 
                        onClick={() => window.history.back()} 
                        className="btn btn-secondary mr-2"
                    >
                        <i className="fas fa-arrow-left"></i> Volver
                    </button>
                    <Link 
                        to={`/perfil_paciente/${id_paciente}/${doctorId || 1}`}
                        className="btn btn-outline-primary mr-3"
                        style={{ minWidth: 'auto' }}
                    >
                        <i className="fas fa-user"></i> Perfil del paciente
                    </Link>
                    <h3 style={{display: 'inline'}}>Odontogramas de {paciente.nombre} {paciente.apellido}</h3>
                </div>
                <Link 
                    to={doctorId ? `/odontograma/${id_paciente}/${doctorId}` : '#'} 
                    className="btn btn-primary"
                    onClick={(e) => {
                        if (!doctorId) {
                            e.preventDefault();
                            Alertify.error("No hay doctor disponible. Por favor, agregue un doctor primero.");
                        }
                    }}
                >
                    <i className="fas fa-plus"></i> Nuevo Odontograma
                </Link>
            </div>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Cargando...</span>
                    </div>
                </div>
            ) : odontogramas.length === 0 ? (
                <div className="alert alert-info text-center">
                    <p>No hay odontogramas registrados para este paciente.</p>
                    <Link 
                        to={doctorId ? `/odontograma/${id_paciente}/${doctorId}` : '#'} 
                        className="btn btn-primary"
                        onClick={(e) => {
                            if (!doctorId) {
                                e.preventDefault();
                                Alertify.error("No hay doctor disponible. Por favor, agregue un doctor primero.");
                            }
                        }}
                    >
                        Crear Primer Odontograma
                    </Link>
                </div>
            ) : (
                <div className="row">
                    {odontogramas.map((odontograma) => (
                        <div className="col-md-4 mb-4" key={odontograma.id}>
                            <div className="card shadow-sm" style={{ 
                                borderRadius: '8px',
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1px solid #e0e0e0'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}>
                                <div className="card-img-top" style={{ 
                                    height: '200px', 
                                    background: `url(${odontograma.dibujo_odontograma || '/odontograma.png'}) center/cover`,
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                </div>
                                <div className="card-body" style={{ padding: '20px' }}>
                                    <h5 className="card-title" style={{ marginBottom: '15px', fontSize: '1.2rem' }}>
                                        Odontograma #{odontograma.id}
                                    </h5>
                                    <p className="card-text" style={{ marginBottom: '20px' }}>
                                        <small className="text-muted" style={{ display: 'block', marginBottom: '10px' }}>
                                            <i className="fas fa-calendar"></i> Fecha: {new Date(odontograma.created_at).toLocaleDateString()}
                                        </small>
                                        <div style={{ marginTop: '10px' }}>
                                            <span className={`badge ${odontograma.estado === 'activo' ? 'badge-success' : 'badge-secondary'}`} style={{ marginRight: '5px' }}>
                                                {odontograma.estado || 'activo'}
                                            </span>
                                            {odontograma.detalles && odontograma.detalles.length > 0 && (
                                                <span className="badge badge-info">
                                                    <i className="fas fa-list"></i> {odontograma.detalles.length} procedimiento(s)
                                                </span>
                                            )}
                                        </div>
                                    </p>
                                    <div className="d-flex justify-content-between" style={{ marginTop: '20px', gap: '10px' }}>
                                        <Link 
                                            to={`/ver_odontograma/${odontograma.id}`} 
                                            className="btn btn-primary btn-sm"
                                            style={{ 
                                                flex: 1,
                                                padding: '8px 15px',
                                                borderRadius: '5px'
                                            }}
                                        >
                                            <i className="fas fa-eye"></i> Ver
                                        </Link>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => eliminarOdontograma(odontograma.id)}
                                            style={{ 
                                                flex: 1,
                                                padding: '8px 15px',
                                                borderRadius: '5px'
                                            }}
                                        >
                                            <i className="fas fa-trash"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VerOdontogramas;