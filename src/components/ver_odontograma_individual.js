import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from 'react-router-dom';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';

// Dientes de adultos (permanentes)
const PIEZAS_ADULTO = [
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
];

// Dientes de leche (deciduos) - numeración pediátrica
const PIEZAS_NINO = [
  [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
];

// Componente para renderizar el odontograma visual
const OdontogramaVisual = ({ detalles }) => {
    // Determinar si es adulto o niño basado en los números de dientes
    const esNino = detalles.some(d => {
        const num = parseInt(d.diente);
        return (num >= 51 && num <= 55) || (num >= 61 && num <= 65) || 
               (num >= 71 && num <= 75) || (num >= 81 && num <= 85);
    });
    
    const piezas = esNino ? PIEZAS_NINO : PIEZAS_ADULTO;

    const getColor = (num, cara) => {
        const detalle = detalles.find(d => 
            parseInt(d.diente) === num && d.cara === cara
        );
        if (!detalle || !detalle.color) return "white";
        
        // Si el color es "blue-red", retornamos un gradiente especial
        if (detalle.color === "blue-red") {
            return `url(#blueRedGradient-${num})`;
        }
        return detalle.color;
    };

    const DienteCaraACara = ({ num }) => {
        // Verificar si alguna cara tiene el color especial "blue-red"
        const tieneBlueRed = detalles.some(d => 
            parseInt(d.diente) === num && d.color === "blue-red"
        );

        return (
            <div className="text-center" style={{ width: "42px", display: "inline-block" }}>
                <div className="small font-weight-bold text-muted mb-1">{num}</div>
                <svg viewBox="0 0 100 100" width="36" height="36">
                    {/* Definir gradiente para blue-red si es necesario */}
                    {tieneBlueRed && (
                        <defs>
                            <linearGradient id={`blueRedGradient-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: "#0066ff", stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: "#0066ff", stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: "#ff0000", stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: "#ff0000", stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    )}
                    <polygon 
                        points="0,0 100,0 75,25 25,25" 
                        fill={getColor(num, "V")} 
                        stroke="#666"
                        strokeWidth="1"
                    />
                    <polygon 
                        points="25,75 75,75 100,100 0,100" 
                        fill={getColor(num, "L")} 
                        stroke="#666"
                        strokeWidth="1"
                    />
                    <polygon 
                        points="0,0 25,25 25,75 0,100" 
                        fill={getColor(num, "M")} 
                        stroke="#666"
                        strokeWidth="1"
                    />
                    <polygon 
                        points="100,0 100,100 75,75 75,25" 
                        fill={getColor(num, "D")} 
                        stroke="#666"
                        strokeWidth="1"
                    />
                    <rect 
                        x="25" 
                        y="25" 
                        width="50" 
                        height="50" 
                        fill={getColor(num, "O")} 
                        stroke="#666"
                        strokeWidth="1"
                    />
                </svg>
            </div>
        );
    };

    return (
        <div className="card shadow-sm p-4 bg-white text-center">
            <h6 className="font-weight-bold text-secondary mb-3">
                {esNino ? "Odontograma - Dientes de Leche" : "Odontograma - Dientes Permanentes"}
            </h6>
            <div className="mb-5">
                {piezas[0].map(n => (
                    <DienteCaraACara key={n} num={n} />
                ))}
            </div>
            <div className="mt-4">
                {piezas[1].map(n => (
                    <DienteCaraACara key={n} num={n} />
                ))}
            </div>
            <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                    <strong>Leyenda:</strong> V = Vestibular, L = Lingual, M = Mesial, D = Distal, O = Oclusal
                </small>
            </div>
        </div>
    );
};

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

            {/* Odontograma Visual con Marcados */}
            {odontograma.detalles && odontograma.detalles.length > 0 && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-info text-white" style={{ padding: '15px 20px' }}>
                        <h5 className="mb-0">Odontograma Visual - Piezas Marcadas</h5>
                    </div>
                    <div className="card-body text-center" style={{ padding: '25px' }}>
                        <OdontogramaVisual detalles={odontograma.detalles} />
                    </div>
                </div>
            )}

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
