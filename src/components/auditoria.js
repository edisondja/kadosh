import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from 'react-router-dom';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';
import Axios from 'axios';

const Auditoria = () => {
    const history = useHistory();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        modulo: '',
        fecha_desde: '',
        fecha_hasta: ''
    });
    const [estadisticas, setEstadisticas] = useState([]);
    const usuarioId = localStorage.getItem("id_usuario");

    const cargarLogs = useCallback(() => {
        setLoading(true);
        if (usuarioId) {
            Core.obtener_logs_usuario(usuarioId)
                .then(data => {
                    setLogs(data || []);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error al cargar logs:", error);
                    Alertify.warning("No se pudieron cargar los logs. Puede que no haya registros aún.");
                    setLogs([]);
                    setLoading(false);
                });
        } else {
            Alertify.warning("No se pudo identificar el usuario. Los logs se mostrarán vacíos.");
            setLogs([]);
            setLoading(false);
        }
    }, [usuarioId]);

    const cargarEstadisticas = useCallback(() => {
        if (usuarioId) {
            Core.obtener_estadisticas_logs(usuarioId)
                .then(data => {
                    setEstadisticas(data);
                })
                .catch(error => {
                    console.error("Error al cargar estadísticas:", error);
                });
        }
    }, [usuarioId]);

    useEffect(() => {
        cargarLogs();
        cargarEstadisticas();
    }, [cargarLogs, cargarEstadisticas]);

    const aplicarFiltros = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtros.modulo) params.append('modulo', filtros.modulo);
        if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
        params.append('usuario_id', usuarioId);

        Axios.get(`${Core.url_base}/api/logs_todos?${params.toString()}`)
            .then(response => {
                setLogs(response.data.data || response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al filtrar logs:", error);
                Alertify.error("Error al aplicar filtros");
                setLoading(false);
            });
    };

    const limpiarFiltros = () => {
        setFiltros({ modulo: '', fecha_desde: '', fecha_hasta: '' });
        cargarLogs();
    };

    const getBadgeColor = (modulo) => {
        const colors = {
            'Odontogramas': 'primary',
            'Pacientes': 'success',
            'Facturas': 'info',
            'Citas': 'warning',
            'Usuarios': 'danger',
            'Configuración': 'secondary'
        };
        return colors[modulo] || 'secondary';
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
                        <i className="fas fa-history"></i> Auditoría - Logs del Usuario
                    </h3>
                </div>
                <button 
                    onClick={cargarLogs} 
                    className="btn btn-primary"
                >
                    <i className="fas fa-sync"></i> Actualizar
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas.length > 0 && (
                <div className="card mb-4">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0"><i className="fas fa-chart-bar"></i> Estadísticas por Módulo</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {estadisticas.map((stat, index) => (
                                <div className="col-md-3 mb-3" key={index}>
                                    <div className="card border-left-primary shadow h-100 py-2">
                                        <div className="card-body">
                                            <div className="row no-gutters align-items-center">
                                                <div className="col mr-2">
                                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                        {stat.modulo}
                                                    </div>
                                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                                        {stat.total} acciones
                                                    </div>
                                                </div>
                                                <div className="col-auto" style={{padding: '10px'}}>
                                                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0"><i className="fas fa-filter"></i> Filtros</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <label>Módulo</label>
                            <select 
                                className="form-control"
                                value={filtros.modulo}
                                onChange={(e) => setFiltros({...filtros, modulo: e.target.value})}
                            >
                                <option value="">Todos los módulos</option>
                                <option value="Odontogramas">Odontogramas</option>
                                <option value="Pacientes">Pacientes</option>
                                <option value="Facturas">Facturas</option>
                                <option value="Citas">Citas</option>
                                <option value="Usuarios">Usuarios</option>
                                <option value="Configuración">Configuración</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label>Fecha Desde</label>
                            <input 
                                type="date" 
                                className="form-control"
                                value={filtros.fecha_desde}
                                onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Fecha Hasta</label>
                            <input 
                                type="date" 
                                className="form-control"
                                value={filtros.fecha_hasta}
                                onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button 
                                onClick={aplicarFiltros} 
                                className="btn btn-primary mr-2"
                                style={{width: '100%'}}
                            >
                                <i className="fas fa-search"></i> Filtrar
                            </button>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-12">
                            <button 
                                onClick={limpiarFiltros} 
                                className="btn btn-secondary btn-sm"
                            >
                                <i className="fas fa-times"></i> Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Logs */}
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="fas fa-list"></i> Historial de Actividades ({logs.length} registros)
                    </h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Cargando...</span>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="alert alert-info m-3">
                            <i className="fas fa-info-circle"></i> No hay registros de auditoría disponibles.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0">
                                <thead className="thead-dark">
                                    <tr>
                                        <th style={{padding: '12px'}}>Fecha y Hora</th>
                                        <th style={{padding: '12px'}}>Módulo</th>
                                        <th style={{padding: '12px'}}>Acción</th>
                                        <th style={{padding: '12px'}}>Descripción</th>
                                        <th style={{padding: '12px'}}>IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id}>
                                            <td style={{padding: '12px'}}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                <span className={`badge badge-${getBadgeColor(log.modulo)}`}>
                                                    {log.modulo}
                                                </span>
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                <strong>{log.accion}</strong>
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                {log.descripcion || '-'}
                                            </td>
                                            <td style={{padding: '12px'}}>
                                                <small className="text-muted">{log.ip_address || '-'}</small>
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

export default Auditoria;
