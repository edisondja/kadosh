import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from 'react-router-dom';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';

const VerOdontogramaIndividual = () => {
    const { id } = useParams();
    const [odontograma, setOdontograma] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Odontograma #{odontograma.id}</h3>
                <Link 
                    to={`/ver_odontogramas/${odontograma.paciente_id}`} 
                    className="btn btn-secondary"
                >
                    <i className="fas fa-arrow-left"></i> Volver a la lista
                </Link>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Información del Odontograma</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <p><strong>Fecha de creación:</strong> {new Date(odontograma.created_at).toLocaleString()}</p>
                            <p><strong>Estado:</strong> 
                                <span className={`badge ${odontograma.estado === 'activo' ? 'badge-success' : 'badge-secondary'} ml-2`}>
                                    {odontograma.estado || 'activo'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0">Dibujo del Odontograma</h5>
                </div>
                <div className="card-body text-center">
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
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Procedimientos Registrados ({odontograma.detalles.length})</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Diente</th>
                                        <th>Cara</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {odontograma.detalles.map((detalle, index) => (
                                        <tr key={index}>
                                            <td><strong>{detalle.diente}</strong></td>
                                            <td>{detalle.cara || '-'}</td>
                                            <td><span className="badge badge-primary">{detalle.tipo}</span></td>
                                            <td>{detalle.descripcion || '-'}</td>
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
};

export default VerOdontogramaIndividual;
