import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from 'react-router-dom';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';
import Axios from 'axios';

const HistorialPagos = () => {
    const history = useHistory();
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [proximoPago, setProximoPago] = useState(null);
    const usuarioId = localStorage.getItem("id_usuario");

    const cargarPagos = useCallback(() => {
        setLoading(true);
        if (usuarioId) {
            Core.obtener_proximo_pago_usuario(usuarioId)
                .then(data => {
                    if (data && !data.message) {
                        setProximoPago(data);
                    }
                })
                .catch(error => {
                    console.error("Error al cargar próximo pago:", error);
                });

            Axios.get(`${Core.url_base}/api/obtener_pagos_por_usuario/${usuarioId}`)
                .then(response => {
                    setPagos(response.data || []);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error al cargar pagos:", error);
                    Alertify.warning("No se pudieron cargar los pagos.");
                    setPagos([]);
                    setLoading(false);
                });
        } else {
            Alertify.warning("No se pudo identificar el usuario.");
            setLoading(false);
        }
    }, [usuarioId]);

    useEffect(() => {
        cargarPagos();
    }, [cargarPagos]);

    const marcarComoPagado = (pagoId) => {
        if (window.confirm('¿Desea marcar este pago como pagado?')) {
            Core.marcar_pago_pagado(pagoId)
                .then(() => {
                    Alertify.success("Pago marcado como pagado");
                    cargarPagos();
                })
                .catch(error => {
                    Alertify.error("Error al marcar el pago como pagado");
                });
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'pagado': 'success',
            'pendiente': 'warning',
            'vencido': 'danger'
        };
        return badges[estado] || 'secondary';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button 
                        onClick={() => history.goBack()} 
                        className="btn btn-secondary mr-3"
                    >
                        <i className="fas fa-arrow-left"></i> Volver
                    </button>
                    <h3 style={{display: 'inline'}}>
                        <i className="fas fa-credit-card"></i> Historial de Pagos
                    </h3>
                </div>
                <button 
                    onClick={cargarPagos} 
                    className="btn btn-primary"
                >
                    <i className="fas fa-sync"></i> Actualizar
                </button>
            </div>

            {/* Alerta de próximo pago */}
            {proximoPago && proximoPago.dias_restantes !== undefined && (
                <div className={`alert alert-${proximoPago.dias_restantes <= 3 ? 'danger' : 'warning'} mb-4`}>
                    <h5><i className="fas fa-exclamation-triangle"></i> Próximo Pago</h5>
                    <p className="mb-0">
                        <strong>Fecha de vencimiento:</strong> {formatearFecha(proximoPago.fecha_vencimiento)}<br />
                        <strong>Monto:</strong> ${parseFloat(proximoPago.monto || 0).toFixed(2)}<br />
                        <strong>Días restantes:</strong> {proximoPago.dias_restantes} día(s)
                    </p>
                </div>
            )}

            {/* Tabla de pagos */}
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="fas fa-list"></i> Mis Pagos ({pagos.length} registros)
                    </h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Cargando...</span>
                            </div>
                        </div>
                    ) : pagos.length === 0 ? (
                        <div className="alert alert-info m-3">
                            <i className="fas fa-info-circle"></i> No hay pagos registrados.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0">
                                <thead className="thead-dark">
                                    <tr>
                                        <th style={{padding: '12px'}}>Fecha de Pago</th>
                                        <th style={{padding: '12px'}}>Fecha de Vencimiento</th>
                                        <th style={{padding: '12px'}}>Monto</th>
                                        <th style={{padding: '12px'}}>Estado</th>
                                        <th style={{padding: '12px'}}>Días de Gracia</th>
                                        <th style={{padding: '12px'}}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos.map((pago) => (
                                        <tr key={pago.id}>
                                            <td style={{padding: '12px'}}>
                                                {formatearFecha(pago.fecha_pago)}
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                {formatearFecha(pago.fecha_vencimiento)}
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                <strong>${parseFloat(pago.monto || 0).toFixed(2)}</strong>
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                <span className={`badge badge-${getEstadoBadge(pago.estado)}`}>
                                                    {pago.estado || 'pendiente'}
                                                </span>
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                {pago.dias_gracia || 0} día(s)
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                {pago.estado === 'pendiente' && (
                                                    <button 
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => marcarComoPagado(pago.id)}
                                                    >
                                                        <i className="fas fa-check"></i> Marcar como Pagado
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistorialPagos;
