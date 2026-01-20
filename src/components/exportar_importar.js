import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';
import '../css/dashboard.css';

class ExportarImportar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tipo: 'pacientes', // 'pacientes' o 'usuarios'
            archivoSeleccionado: null,
            datosImportados: null,
            exportando: false,
            importando: false,
            resultadoImportacion: null
        };
    }

    cambiarTipo = (tipo) => {
        this.setState({ 
            tipo, 
            archivoSeleccionado: null, 
            datosImportados: null,
            resultadoImportacion: null
        });
    }

    exportarDatos = async () => {
        this.setState({ exportando: true });
        try {
            let response;
            if (this.state.tipo === 'pacientes') {
                response = await Core.exportar_pacientes();
            } else {
                response = await Core.exportar_usuarios();
            }

            // Crear archivo JSON
            const datos = JSON.stringify(response.data, null, 2);
            const blob = new Blob([datos], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `exportacion_${this.state.tipo}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            Alertify.success(`${response.total} ${this.state.tipo} exportados correctamente`);
        } catch (error) {
            Alertify.error(`Error al exportar ${this.state.tipo}`);
            console.error(error);
        } finally {
            this.setState({ exportando: false });
        }
    }

    manejarSeleccionArchivo = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            if (archivo.type !== 'application/json' && !archivo.name.endsWith('.json')) {
                Alertify.error("Por favor, seleccione un archivo JSON válido");
                return;
            }

            this.setState({ archivoSeleccionado: archivo });
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const datos = JSON.parse(event.target.result);
                    
                    // Validar estructura del JSON
                    if (!datos.data || !Array.isArray(datos.data)) {
                        Alertify.error("El archivo JSON no tiene el formato correcto. Debe contener un array 'data'");
                        this.setState({ archivoSeleccionado: null, datosImportados: null });
                        return;
                    }

                    this.setState({ datosImportados: datos.data });
                    Alertify.success(`${datos.data.length} registros cargados del archivo`);
                } catch (error) {
                    Alertify.error("Error al leer el archivo JSON. Verifique que el archivo sea válido");
                    this.setState({ archivoSeleccionado: null, datosImportados: null });
                    console.error(error);
                }
            };
            reader.readAsText(archivo);
        }
    }

    importarDatos = async () => {
        if (!this.state.datosImportados || this.state.datosImportados.length === 0) {
            Alertify.error("No hay datos para importar. Por favor, seleccione un archivo JSON válido");
            return;
        }

        this.setState({ importando: true, resultadoImportacion: null });

        try {
            let response;
            if (this.state.tipo === 'pacientes') {
                response = await Core.importar_pacientes(this.state.datosImportados);
            } else {
                response = await Core.importar_usuarios(this.state.datosImportados);
            }

            this.setState({ resultadoImportacion: response });

            if (response.errores && response.errores.length > 0) {
                Alertify.warning(`Importación completada con ${response.errores.length} error(es). ${response.importados} registros importados correctamente`);
            } else {
                Alertify.success(`${response.importados} ${this.state.tipo} importados correctamente`);
            }

            // Limpiar estado
            this.setState({ 
                archivoSeleccionado: null, 
                datosImportados: null 
            });
            
            // Limpiar input de archivo
            const fileInput = document.getElementById('archivoImportar');
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (error) {
            Alertify.error(`Error al importar ${this.state.tipo}`);
            console.error(error);
        } finally {
            this.setState({ importando: false });
        }
    }

    render() {
        const { tipo, archivoSeleccionado, datosImportados, exportando, importando, resultadoImportacion } = this.state;

        return (
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-10">
                        <h3 className="mb-4 text-primary">
                            <i className="fas fa-exchange-alt me-2"></i>Exportar / Importar Datos
                        </h3>

                        {/* Selector de tipo */}
                        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <label className="form-label fw-bold mb-3" style={{ fontSize: '16px' }}>
                                    <i className="fas fa-filter me-2"></i>Seleccionar Tipo de Datos
                                </label>
                                <div className="btn-group w-100" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${tipo === 'pacientes' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => this.cambiarTipo('pacientes')}
                                        style={{ fontSize: '16px', padding: '12px' }}
                                    >
                                        <i className="fas fa-user-injured me-2"></i>Pacientes
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${tipo === 'usuarios' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => this.cambiarTipo('usuarios')}
                                        style={{ fontSize: '16px', padding: '12px' }}
                                    >
                                        <i className="fas fa-users me-2"></i>Usuarios
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                    {/* Sección de Exportación */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-primary text-white" style={{ borderRadius: '16px 16px 0 0' }}>
                                <h5 className="mb-0">
                                    <i className="fas fa-download me-2"></i>Exportar {tipo === 'pacientes' ? 'Pacientes' : 'Usuarios'}
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <p className="text-muted mb-4">
                                    Exporte todos los {tipo} del sistema a un archivo JSON que puede ser importado más tarde.
                                </p>
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={this.exportarDatos}
                                    disabled={exportando}
                                    style={{ padding: '12px', fontSize: '16px' }}
                                >
                                    {exportando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Exportando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-export me-2"></i>
                                            Exportar {tipo === 'pacientes' ? 'Pacientes' : 'Usuarios'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Importación */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-header bg-success text-white" style={{ borderRadius: '16px 16px 0 0' }}>
                                <h5 className="mb-0">
                                    <i className="fas fa-upload me-2"></i>Importar {tipo === 'pacientes' ? 'Pacientes' : 'Usuarios'}
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <p className="text-muted mb-3">
                                    Importe {tipo} desde un archivo JSON previamente exportado.
                                </p>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Seleccionar Archivo JSON</label>
                                    <input
                                        type="file"
                                        id="archivoImportar"
                                        className="form-control"
                                        accept=".json,application/json"
                                        onChange={this.manejarSeleccionArchivo}
                                    />
                                </div>

                                {datosImportados && (
                                    <div className="alert alert-info mb-3">
                                        <i className="fas fa-info-circle me-2"></i>
                                        <strong>{datosImportados.length}</strong> registros listos para importar
                                    </div>
                                )}

                                <button
                                    className="btn btn-success w-100"
                                    onClick={this.importarDatos}
                                    disabled={importando || !datosImportados}
                                    style={{ padding: '12px', fontSize: '16px' }}
                                >
                                    {importando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-import me-2"></i>
                                            Importar {tipo === 'pacientes' ? 'Pacientes' : 'Usuarios'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resultado de Importación */}
                {resultadoImportacion && (
                    <div className="card shadow-sm border-0 mt-4" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-info text-white" style={{ borderRadius: '16px 16px 0 0' }}>
                            <h5 className="mb-0">
                                <i className="fas fa-check-circle me-2"></i>Resultado de la Importación
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <div className="text-center p-3 bg-light rounded">
                                        <h3 className="text-success mb-0">{resultadoImportacion.importados || 0}</h3>
                                        <small className="text-muted">Importados</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center p-3 bg-light rounded">
                                        <h3 className="text-info mb-0">{resultadoImportacion.total || 0}</h3>
                                        <small className="text-muted">Total en Archivo</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center p-3 bg-light rounded">
                                        <h3 className="text-danger mb-0">{resultadoImportacion.errores?.length || 0}</h3>
                                        <small className="text-muted">Errores</small>
                                    </div>
                                </div>
                            </div>

                            {resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                                <div className="mt-3">
                                    <h6 className="text-danger">Errores encontrados:</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Fila</th>
                                                    <th>Error</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resultadoImportacion.errores.map((error, index) => (
                                                    <tr key={index}>
                                                        <td>{error.fila}</td>
                                                        <td className="text-danger">{error.error}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Información adicional */}
                <div className="card shadow-sm border-0 mt-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <div className="card-body p-4">
                        <h5 className="mb-3">
                            <i className="fas fa-info-circle me-2"></i>Información Importante
                        </h5>
                        <ul className="mb-0" style={{ listStyle: 'none', padding: 0 }}>
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2"></i>
                                Los archivos exportados contienen todos los datos de {tipo === 'pacientes' ? 'los pacientes' : 'los usuarios'}.
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2"></i>
                                Al importar, los registros existentes (por cédula para pacientes o usuario para usuarios) se actualizarán.
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2"></i>
                                Los nuevos registros se crearán automáticamente.
                            </li>
                            {tipo === 'usuarios' && (
                                <li className="mb-0">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Nota:</strong> Las claves de usuario no se exportan por seguridad. Al importar, se asignará una clave por defecto si no se proporciona.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ExportarImportar;
