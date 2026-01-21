import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import '../css/dashboard.css';

class Suplidores extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suplidores: [],
      usuario_id: '',
      // Modal Registrar
      modalOpenRegistrar: false,
      nombre_suplidor: '',
      descripcion: '',
      rnc_suplidor: '',
      // Modal Actualizar
      modalOpenActualizar: false,
      suplidorActualizar: {
        id: '',
        nombre_suplidor: '',
        descripcion: '',
        rnc_suplidor: '',
      },
    };
  }

  componentDidMount() {
    this.cargar_suplidores();
    const usuario_id = localStorage.getItem('id_usuario');
    if (usuario_id) {
      this.setState({ usuario_id });
    }
  }

  cargar_suplidores = () => {
    Core.cargar_suplidores(this);
  };

  buscar_suplidor = (e) => {
    const criterio = e.target.value;
    Axios.get(`${Core.url_base}/api/buscar_suplidor/${criterio}`)
      .then((res) => this.setState({ suplidores: res.data }))
      .catch(() => Alertify.warning('Error al buscar suplidor'));
  };

  // Abrir modal registrar
  abrirModalRegistrar = () => {
    this.setState({
      modalOpenRegistrar: true,
      nombre_suplidor: '',
      descripcion: '',
      rnc_suplidor: '',
    });
  };

  cerrarModalRegistrar = () => {
    this.setState({ modalOpenRegistrar: false });
  };

  handleInputChangeRegistrar = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  registrar_suplidor = (e) => {
    e.preventDefault();
    const { nombre_suplidor, descripcion, rnc_suplidor, usuario_id } = this.state;
    if (!nombre_suplidor.trim()) {
      Alertify.error('El nombre del suplidor es obligatorio.');
      return;
    }
    const suplidor = {
      usuario_id,
      nombre_suplidor: nombre_suplidor.trim(),
      descripcion: descripcion.trim(),
      rnc_suplidor: rnc_suplidor.trim(),
    };
    Axios.post(`${Core.url_base}/api/registrar_suplidor`, suplidor)
      .then((data) => {
        Alertify.success('Suplidor registrado correctamente');
        this.cargar_suplidores();
       // this.cerrarModalRegistrar();
        console.log("Suplidor registrado:",data.data);
      })
      .catch((error) =>  console.log(error));
  };

  // Abrir modal actualizar
  abrirModalActualizar = (data) => {
    this.setState({
      modalOpenActualizar: true,
      suplidorActualizar: {
        id: data.id,
        nombre_suplidor: data.nombre,
        descripcion: data.descripcion,
        rnc_suplidor: data.rnc_suplidor,
      },
    });
  };

  cerrarModalActualizar = () => {
    this.setState({
      modalOpenActualizar: false,
      suplidorActualizar: { id: '', nombre_suplidor: '', descripcion: '', rnc_suplidor: '' },
    });
  };

  handleInputChangeActualizar = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      suplidorActualizar: {
        ...prev.suplidorActualizar,
        [name]: value,
      },
    }));
  };

  actualizar_suplidor_submit = (e) => {
    e.preventDefault();
    const { id, nombre_suplidor, descripcion, rnc_suplidor } = this.state.suplidorActualizar;
    if (!nombre_suplidor.trim()) {
      Alertify.error('El nombre es obligatorio');
      return;
    }
    const datosActualizar = {
      id,
      nombre_suplidor: nombre_suplidor.trim(),
      descripcion: descripcion.trim(),
      rnc_suplidor: rnc_suplidor.trim(),
    };
    Axios.post(`${Core.url_base}/api/actualizar_suplidor`, datosActualizar)
      .then(() => {
        Alertify.success('Suplidor actualizado');
        this.cargar_suplidores();
        this.cerrarModalActualizar();
      })
      .catch(() => Alertify.error('Error al actualizar'));
  };

  eliminar_suplidor = (id_suplidor) => {
    Alertify.confirm(
      'Eliminar Suplidor',
      '¿Deseas eliminar este suplidor?',
      () => {
        Axios.get(`${Core.url_base}/api/eliminar_suplidor/${id_suplidor}`)
          .then(() => {
            Alertify.success('Suplidor eliminado');
            this.cargar_suplidores();
          })
          .catch(() => Alertify.error('Error al eliminar suplidor'));
      },
      () => {}
    );
  };

  render() {
    const {
      suplidores,
      modalOpenRegistrar,
      nombre_suplidor,
      descripcion,
      rnc_suplidor,
      modalOpenActualizar,
      suplidorActualizar,
    } = this.state;

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
          padding: '15px',
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
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="d-flex align-items-center mb-3 mb-md-0">
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
                    <i className="fas fa-truck"></i>
                  </div>
                  <div>
                    <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                      Gestión de Suplidores
                    </h2>
                    <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                      Administra los suplidores del sistema
                    </p>
                  </div>
                </div>
                <button 
                  onClick={this.abrirModalRegistrar}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-plus me-2"></i>Agregar Suplidor
                </button>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="card border-0 shadow-sm mb-4" style={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'slideUp 0.6s ease'
          }}>
            <div className="card-body p-4">
              <div className="input-group">
                <span className="input-group-text" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px 0 0 12px',
                  padding: '14px 20px',
                  fontSize: '18px'
                }}>
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  onChange={this.buscar_suplidor}
                  placeholder="Buscar Suplidor"
                  style={{
                    borderRadius: '0 12px 12px 0',
                    border: '2px solid #e0e0e0',
                    borderLeft: 'none',
                    padding: '14px 16px',
                    fontSize: '15px',
                    minHeight: '50px',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1c1c1e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabla de suplidores */}
          <div className="card border-0 shadow-sm" style={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'slideUp 0.7s ease'
          }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <tr>
                    <th style={{ 
                      fontWeight: 600, 
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#495057',
                      padding: '15px 20px',
                      border: 'none'
                    }}>Nombre</th>
                    <th style={{ 
                      fontWeight: 600, 
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#495057',
                      padding: '15px 20px',
                      border: 'none'
                    }}>RNC</th>
                    <th style={{ 
                      fontWeight: 600, 
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#495057',
                      padding: '15px 20px',
                      border: 'none'
                    }}>Descripción</th>
                    <th style={{ 
                      fontWeight: 600, 
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#495057',
                      padding: '15px 20px',
                      border: 'none',
                      textAlign: 'center'
                    }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {suplidores.map((data) => (
                    <tr 
                      key={data.id}
                      style={{
                        transition: 'all 0.2s ease',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 500 }}>{data.nombre}</td>
                      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.rnc_suplidor}</td>
                      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.descripcion || '-'}</td>
                      <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-sm"
                            onClick={() => this.abrirModalActualizar(data)}
                            style={{
                              background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontWeight: 600,
                              fontSize: '13px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(28, 28, 30, 0.3)',
                              minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(28, 28, 30, 0.3)';
                            }}
                          >
                            <i className="fas fa-edit me-1"></i>Editar
                          </button>
                          <button 
                            className="btn btn-sm"
                            onClick={() => this.eliminar_suplidor(data.id)}
                            style={{
                              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontWeight: 600,
                              fontSize: '13px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                              minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                            }}
                          >
                            <i className="fas fa-trash me-1"></i>Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Registrar */}
        {modalOpenRegistrar && (
          <div 
            className="modal fade show" 
            style={{ 
              display: 'block', 
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1050
            }}
            onClick={this.cerrarModalRegistrar}
          >
            <div 
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px' }}
            >
              <div className="modal-content" style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '25px 30px',
                  borderBottom: 'none'
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px',
                        fontSize: '24px'
                      }}>
                        <i className="fas fa-truck"></i>
                      </div>
                      <div>
                        <h4 className="mb-0" style={{ fontWeight: 700, fontSize: '24px' }}>
                          Registrar Nuevo Suplidor
                        </h4>
                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                          Complete el formulario para registrar el suplidor
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={this.cerrarModalRegistrar}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '8px',
                        opacity: 1
                      }}
                    ></button>
                  </div>
                </div>

                <form onSubmit={this.registrar_suplidor}>
                  <div className="modal-body" style={{ padding: '30px' }}>
                    <div className="mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                        <i className="fas fa-building me-2"></i>Nombre del Suplidor
                      </label>
                      <input
                        type="text"
                        name="nombre_suplidor"
                        value={nombre_suplidor}
                        onChange={this.handleInputChangeRegistrar}
                        className="form-control"
                        required
                        autoFocus
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          padding: '14px 16px',
                          fontSize: '15px',
                          minHeight: '50px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1c1c1e';
                          e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                        <i className="fas fa-align-left me-2"></i>Descripción
                      </label>
                      <input
                        type="text"
                        name="descripcion"
                        value={descripcion}
                        onChange={this.handleInputChangeRegistrar}
                        className="form-control"
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          padding: '14px 16px',
                          fontSize: '15px',
                          minHeight: '50px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1c1c1e';
                          e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                        <i className="fas fa-id-card me-2"></i>RNC
                      </label>
                      <input
                        type="text"
                        name="rnc_suplidor"
                        value={rnc_suplidor}
                        onChange={this.handleInputChangeRegistrar}
                        className="form-control"
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          padding: '14px 16px',
                          fontSize: '15px',
                          minHeight: '50px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1c1c1e';
                          e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div className="modal-footer" style={{
                    padding: '25px 30px',
                    borderTop: '1px solid #f0f0f0',
                    background: '#f8f9fa'
                  }}>
                    <div className="d-flex w-100 justify-content-end" style={{ gap: '16px' }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={this.cerrarModalRegistrar}
                        style={{
                          background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 28px',
                          fontWeight: 600,
                          fontSize: '15px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(142, 142, 147, 0.3)',
                          minWidth: '140px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(142, 142, 147, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(142, 142, 147, 0.3)';
                        }}
                      >
                        <i className="fas fa-times me-2"></i>Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn"
                        style={{
                          background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 28px',
                          fontWeight: 600,
                          fontSize: '15px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)',
                          minWidth: '160px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
                        }}
                      >
                        <i className="fas fa-save me-2"></i>Guardar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actualizar */}
        {modalOpenActualizar && (
          <div 
            className="modal fade show" 
            style={{ 
              display: 'block', 
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1050
            }}
            onClick={this.cerrarModalActualizar}
          >
            <div 
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px' }}
            >
              <div className="modal-content" style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '25px 30px',
                  borderBottom: 'none'
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px',
                        fontSize: '24px'
                      }}>
                        <i className="fas fa-edit"></i>
                      </div>
                      <div>
                        <h4 className="mb-0" style={{ fontWeight: 700, fontSize: '24px' }}>
                          Actualizar Suplidor
                        </h4>
                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                          Modifique los datos del suplidor
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={this.cerrarModalActualizar}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '8px',
                        opacity: 1
                      }}
                    ></button>
                  </div>
                </div>

                <form onSubmit={this.actualizar_suplidor_submit}>
                  <div className="modal-body" style={{ padding: '30px' }}>
                    <div className="mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                        <i className="fas fa-building me-2"></i>Nombre del Suplidor
                      </label>
                      <input
                        type="text"
                        name="nombre_suplidor"
                        value={suplidorActualizar.nombre_suplidor}
                        onChange={this.handleInputChangeActualizar}
                        className="form-control"
                        required
                        autoFocus
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          padding: '14px 16px',
                          fontSize: '15px',
                          minHeight: '50px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1c1c1e';
                          e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                        <i className="fas fa-align-left me-2"></i>Descripción
                      </label>
                      <input
                        type="text"
                        name="descripcion"
                        value={suplidorActualizar.descripcion}
                        onChange={this.handleInputChangeActualizar}
                        className="form-control"
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          padding: '14px 16px',
                          fontSize: '15px',
                          minHeight: '50px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1c1c1e';
                          e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                        <i className="fas fa-id-card me-2"></i>RNC
                      </label>
                      <input
                        type="text"
                        name="rnc_suplidor"
                        value={suplidorActualizar.rnc_suplidor}
                        onChange={this.handleInputChangeActualizar}
                        className="form-control"
                        required
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          padding: '14px 16px',
                          fontSize: '15px',
                          minHeight: '50px',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1c1c1e';
                          e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div className="modal-footer" style={{
                    padding: '25px 30px',
                    borderTop: '1px solid #f0f0f0',
                    background: '#f8f9fa'
                  }}>
                    <div className="d-flex w-100 justify-content-end" style={{ gap: '16px' }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={this.cerrarModalActualizar}
                        style={{
                          background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 28px',
                          fontWeight: 600,
                          fontSize: '15px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(142, 142, 147, 0.3)',
                          minWidth: '140px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(142, 142, 147, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(142, 142, 147, 0.3)';
                        }}
                      >
                        <i className="fas fa-times me-2"></i>Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn"
                        style={{
                          background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 28px',
                          fontWeight: 600,
                          fontSize: '15px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)',
                          minWidth: '160px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
                        }}
                      >
                        <i className="fas fa-save me-2"></i>Actualizar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Suplidores;
