import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import PerfilPaciente from './perfil_paciente';
import Lupa  from '../lupa.png';
import Eliminar  from '../eliminar.png';
import { Link } from 'react-router-dom';
import VerPresupuestoAhora from './visualizar_presupuesto';



class VerPresupuesto extends React.Component{


    constructor(props){
        super(props)

        this.state={select:"",presupuestos:[],presupuesto_id:0,nombre_p:""};

    }


    componentDidMount(){


        this.cargar_presupuestos(this.props.match.params.id);

        console.log(this.state.presupuestos);
    }


    cargar_presupuestos=(paciente_id)=>{


            Axios.get(`${Core.url_base}/api/cargar_presupuestos/${paciente_id}`).then(data=>{

                this.setState({presupuestos:data.data});

            }).catch(error=>{

                Alertify.message("error cargando prosupuestos");

            });

    }


    actualizar_presupuesto=(presupuesto)=>{


        Axios.post(`${Core.url_base}/actualizar_presupuesto`,presupuesto).then(data=>{


            Alertify.message("Presupuesto actualizado con exito");

        }).catch(error=>{

            Alertify.message("Error eliminando presupuesto");

        });



    }


    ver_presupuesto=(id_presupuesto,nombre_prespuesto)=>{

        this.setState({select:'ver_presupuesto'});
        this.setState({presupuesto_id:id_presupuesto,nombre_p:nombre_prespuesto});

      
    }



    buscar_prespuestos=(e)=>{


            Axios.get(`${Core.url_base}/api/buscar_presupuesto/${e.target.value}`).then(data=>{


                this.setState({presupuestos:data.data});


            }).catch(error=>{

              //  Alertify.message("fallo cargando data");

            });



    }



    eliminar_presupuesto=(presupuesto_id,nombre="")=>{


        Alertify.confirm("Eliminar prespuesto",`Estas seguro que deseas eliminar el presupuesto "${nombre}" de forma permanente?`,function(){


                Axios.post(`${Core.url_base}/api/eliminar_presupuesto`,{presupuesto_id:presupuesto_id}).then(data=>{

                    Alertify.message("Presupuesto eliminado cone exito");
                    document.getElementById(`presupuesto${presupuesto_id}`).remove();

                }).catch(error=>{

                        Alertify.message("Error eliminando prespuesto");
                      
                });
        },function(){


            Alertify.message("Presupeusto conservado");

        });


           

    }




    render(){


        
        if(this.state.select=="perfil"){

            return <PerfilPaciente id_paciente={this.props.IDpaciente} />
        
        }else if(this.state.select=="ver_presupuesto"){


             //   alert(this.state.id_presupuesto+" "+this.state.nombre_p);


            return <VerPresupuestoAhora 
                        id_paciente={this.props.IDpaciente} 
                        id_presupuesto={this.state.presupuesto_id}
                        nombre_presupuesto={this.state.nombre_p} />

        }


        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
                <div style={{ width: '100%', padding: this.props.enModal ? '0' : '30px' }}>
                    {/* Header estilo macOS - solo si no está en modal */}
                    {!this.props.enModal && (
                        <div className="card border-0 shadow-lg mb-4" style={{ 
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            overflow: 'hidden'
                        }}>
                            <div className="card-body text-white p-4">
                                <div className="d-flex justify-content-between align-items-center">
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
                                            <i className="fas fa-file-invoice-dollar"></i>
                                        </div>
                                        <div>
                                            <h3 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                                Lista de Presupuestos
                                            </h3>
                                            <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                                Gestiona los presupuestos del paciente
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
                                        <button 
                                            className="btn"
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
                                            <i className="fas fa-arrow-left me-2"></i>Retroceder
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body p-3">
                            <div className="input-group">
                                <span className="input-group-text" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px 0 0 12px'
                                }}>
                                    <i className="fas fa-search"></i>
                                </span>
                                <input 
                                    type='text' 
                                    onChange={this.buscar_prespuestos} 
                                    className='form-control' 
                                    placeholder='Buscar presupuesto por nombre...' 
                                    style={{
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '0 12px 12px 0',
                                        padding: '12px 16px',
                                        fontSize: '15px',
                                        transition: 'all 0.2s ease'
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
                        </div>
                    </div>

                    {/* Lista de presupuestos */}
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body p-0">
                            {this.state.presupuestos.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-file-invoice-dollar fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                                    <h5 className="text-muted mb-2">No hay presupuestos registrados</h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                        Crea un nuevo presupuesto para este paciente
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ 
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            borderBottom: '2px solid #dee2e6'
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
                                                }}>Paciente</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Fecha Creado</th>
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
                                            {this.state.presupuestos.map(data => (
                                                <tr 
                                                    key={data.id}
                                                    id={"presupuesto"+data.id}
                                                    style={{ 
                                                        transition: 'all 0.2s ease',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                    }}
                                                >
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#495057' }}>
                                                        {data.nombre}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                        {data.paciente ? data.paciente.nombre : 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#6c757d', fontSize: '14px' }}>
                                                        {data.created_at ? new Date(data.created_at).toLocaleDateString('es-ES', { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : '-'}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                        <div className="d-flex justify-content-center" style={{ gap: '10px' }}>
                                                            <Link to={`/presupuesto/${this.props.match.params.id}/${data.id}/${data.doctor_id}`}>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    title="Ver presupuesto"
                                                                    style={{
                                                                        background: '#17a2b8',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        padding: '6px 12px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.transform = 'scale(1.1)';
                                                                        e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.3)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.transform = 'scale(1)';
                                                                        e.target.style.boxShadow = 'none';
                                                                    }}
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </button>
                                                            </Link>
                                                            <Link to={`/editar_presupuesto/${this.props.match.params.id}/${data.id}/${data.doctor_id}`}>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    title="Editar presupuesto"
                                                                    style={{
                                                                        background: '#ffc107',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        padding: '6px 12px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.transform = 'scale(1.1)';
                                                                        e.target.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.3)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.transform = 'scale(1)';
                                                                        e.target.style.boxShadow = 'none';
                                                                    }}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                            </Link>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => this.eliminar_presupuesto(data.id, data.nombre)}
                                                                title="Eliminar presupuesto"
                                                                style={{
                                                                    background: '#dc3545',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'scale(1.1)';
                                                                    e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = 'scale(1)';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
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
            </>
        );




    }

}

export default VerPresupuesto;
