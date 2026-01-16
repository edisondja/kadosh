import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from 'react-router-dom';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';

const VerOdontogramaIndividual = () => {
    const { id } = useParams();
    const [odontograma, setOdontograma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imprimirConDibujo, setImprimirConDibujo] = useState(false);

    const cargarOdontograma = useCallback(() => {
        setLoading(true);
        Core.obtener_odontograma(id)
            .then(data => {
                setOdontograma(data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                Alertify.error("No se pudo cargar el odontograma");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        cargarOdontograma();
    }, [cargarOdontograma]);

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!odontograma) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <h4>Odontograma no encontrado</h4>
                    <Link to="/" className="btn btn-primary">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    const handleImprimir = () => {
        // Si hay dibujo, preguntar si quiere incluirlo
        if (odontograma.dibujo_odontograma) {
            Alertify.confirm(
                "Imprimir Odontograma",
                "¿Desea incluir el dibujo del odontograma en la impresión?",
                () => {
                    // Usuario confirmó: incluir dibujo
                    setImprimirConDibujo(true);
                    setTimeout(() => {
                        window.print();
                        // Resetear después de un momento
                        setTimeout(() => setImprimirConDibujo(false), 500);
                    }, 100);
                },
                () => {
                    // Usuario canceló: no incluir dibujo
                    setImprimirConDibujo(false);
                    setTimeout(() => {
                        window.print();
                        // Resetear después de un momento
                        setTimeout(() => setImprimirConDibujo(false), 500);
                    }, 100);
                }
            );
        } else {
            // No hay dibujo, imprimir directamente
            window.print();
        }
    };

    return (
        <>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .card {
                        page-break-inside: avoid;
                    }
                    body {
                        background: white !important;
                    }
                    /* Ocultar información del odontograma al imprimir */
                    .info-odontograma {
                        display: none !important;
                    }
                }
                ${!imprimirConDibujo ? `
                    @media print {
                        .dibujo-odontograma {
                            display: none !important;
                        }
                    }
                ` : ''}
            `}</style>
            <div className="container mt-4" style={{ padding: '20px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 no-print" style={{ padding: '0 10px' }}>
                    <h3>Odontograma #{odontograma.id}</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={handleImprimir}
                            className="btn btn-primary"
                            style={{
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: '600',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            <i className="fas fa-print me-2"></i>Imprimir
                        </button>
                        <Link 
                            to={`/ver_odontogramas/${odontograma.paciente_id}`} 
                            className="btn btn-secondary"
                            style={{
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: '600'
                            }}
                        >
                            <i className="fas fa-arrow-left me-2"></i>Volver a la lista
                        </Link>
                    </div>
                </div>

            <div className="card shadow-sm mb-4 info-odontograma">
                <div className="card-header bg-primary text-white" style={{ padding: '15px 20px' }}>
                    <h5 className="mb-0">Información del Odontograma</h5>
                </div>
                <div className="card-body" style={{ padding: '20px 25px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <p style={{ marginBottom: '12px' }}><strong>Fecha de creación:</strong> {new Date(odontograma.created_at).toLocaleString()}</p>
                            <p style={{ marginBottom: '0' }}><strong>Estado:</strong> 
                                <span className={`badge ${odontograma.estado === 'activo' ? 'badge-success' : 'badge-secondary'} ml-2`}>
                                    {odontograma.estado || 'activo'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm mb-4 dibujo-odontograma" id="odontograma-print">
                <div className="card-header bg-info text-white" style={{ padding: '15px 20px' }}>
                    <h5 className="mb-0">Dibujo del Odontograma</h5>
                </div>
                <div className="card-body text-center" style={{ padding: '25px' }}>
                    {odontograma.dibujo_odontograma ? (
                        <img 
                            src={odontograma.dibujo_odontograma} 
                            alt="Odontograma" 
                            className="img-fluid"
                            style={{ maxHeight: '600px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    ) : (
                        <p className="text-muted">No hay dibujo disponible</p>
                    )}
                </div>
            </div>

            {odontograma.detalles && odontograma.detalles.length > 0 && (
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white" style={{ padding: '15px 20px' }}>
                        <h5 className="mb-0">Procedimientos Registrados ({odontograma.detalles.length})</h5>
                    </div>
                    <div className="card-body" style={{ padding: '20px 25px' }}>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px' }}>Diente</th>
                                        <th style={{ padding: '12px' }}>Cara</th>
                                        <th style={{ padding: '12px' }}>Tipo</th>
                                        <th style={{ padding: '12px' }}>Descripción</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {odontograma.detalles.map((detalle, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '12px' }}><strong>{detalle.diente}</strong></td>
                                            <td style={{ padding: '12px' }}>{detalle.cara || '-'}</td>
                                            <td style={{ padding: '12px' }}><span className="badge badge-primary">{detalle.tipo}</span></td>
                                            <td style={{ padding: '12px' }}>{detalle.descripcion || '-'}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <strong style={{ color: '#000000' }}>
                                                    ${detalle.precio ? parseFloat(detalle.precio).toFixed(2) : '0.00'}
                                                </strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                                        <td colSpan="4" style={{ padding: '15px 12px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '16px' }}>TOTAL:</span>
                                        </td>
                                        <td style={{ padding: '15px 12px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '18px', color: '#000000', fontWeight: 'bold' }}>
                                                ${odontograma.detalles.reduce((sum, detalle) => sum + (parseFloat(detalle.precio) || 0), 0).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default VerOdontogramaIndividual;
