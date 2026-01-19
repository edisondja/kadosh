import React from  'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import '../css/dashboard.css';
import Core from './funciones_extras';
import cargar_doctores from './funciones_extras';
import Loading from '../loading2.gif';


class BuscandoProcedimiento extends  React.Component{

    constructor(props){
        super(props);
        this.state = {procedimientos:[],
                     actualizar:false,
                     id_procedimiento:0,
                     modal_update:false,
                     id:0,
                     nombre:'',
                     precio:'',
                     color:'',
                     change:false};
    }


    actualizar_valor=(event)=>{

        this.setState({[event.target.name]:event.target.value});

    }




    componentDidMount(){

        cargar_doctores.cargar_procedimientos(this)
    }


        cargar_procedimiento=(id)=>{

        Axios.get(`${Core.url_base}/api/cargar_procedimiento/${id}`).then(data=>{
            
                this.setState({nombre:data.data.nombre,precio:data.data.precio,id:data.data.id,color:data.data.color});

        }).catch(error=>{
            alertify.error("No se puedo cargar este paciente");
        });
        

    }
    actualizar=(id)=>{
        // Primero obtener la configuración para validar la clave secreta
        Axios.get(`${Core.url_base}/api/configs`).then(configResponse => {
            const config = configResponse.data && configResponse.data.length > 0 ? configResponse.data[0] : null;
            const claveSecreta = config ? config.clave_secreta : null;

            if (!claveSecreta) {
                alertify.error("No se ha configurado una clave secreta. Por favor configúrela primero en Configuración.");
                return;
            }

            // Pedir la clave secreta antes de permitir actualizar
            alertify.prompt("Actualizar Procedimiento", "Ingrese la clave secreta del administrador para actualizar este procedimiento:", "", 
                (evt, value) => {
                    if (value === claveSecreta) {
                        alertify.success("Clave correcta!");
                        // Si la clave es correcta, abrir el modal y cargar los datos
                        this.setState({modal_update: true});
                        
                        Axios.get(`${Core.url_base}/api/cargar_procedimiento/${id}`).then(data => {
                            this.setState({nombre: data.data.nombre, precio: data.data.precio, id: data.data.id, color: data.data.color});
                        }).catch(error => {
                            alertify.error("No se pudo cargar este procedimiento");
                        });
                    } else {
                        alertify.error("Clave secreta incorrecta");
                    }
                },
                () => {
                    alertify.error("Operación cancelada");
                }
            );
        }).catch(error => {
            console.error("Error al obtener configuración:", error);
            alertify.error("Error al obtener la configuración para validar la clave secreta");
        });
    }

    actualizar_procedimiento=()=>{

        Axios.post(`${Core.url_base}/api/actualizar_procedimiento`,
                    {nombre:this.state.nombre,
                     precio:this.state.precio,
                     color:this.state.color,
                     id:this.state.id }
        ).then(data=>{
                alertify.message("Procedimiento actualizado con exito");
        
        }).catch(error=>{ 
            console.log(error);
                alertify.error("no se pudo actualizar el procedimiento");
        });

    }

  
    eliminar=(id)=>{

        alertify.confirm("Deseas eliminar este procedimiento",()=>{

            Axios.get(`${cargar_doctores.url_base}/api/eliminar_procedimiento/${id}`).then(data=>{
                
                    alertify.message("Procedimiento borrado correctamente!");
                    document.getElementById(id).remove();
                    if(this.state.change==false){
                         this.setState({change:true});
                    }else{
                        this.setState({change:false});
                    }
                   // this.cargar_procedimientos();

            }).catch(error=>{
                    alertify.error("no se pudo eliminar el procedimiento");
            });
                
        });

    }

    buscar_p=()=>{ 
            
        var buscar = document.getElementById("buscando").value;
            Axios.get(`${cargar_doctores.url_base}/api/buscar_procedimiento/${buscar}`).then(data=>{

                    this.setState({procedimientos:data.data});

            }).catch(error=>{

                console.log("error");
            })
    }

    actualizar_color=(event)=>{

        this.setState({color:event.target.value});

    }

    render(){
      

        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="card-body p-4">
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
                                type="text" 
                                className="form-control" 
                                onKeyUp={this.buscar_p} 
                                id="buscando" 
                                placeholder="Escriba el nombre del procedimiento para buscar..." 
                                style={{
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '0 12px 12px 0',
                                    padding: '12px 16px',
                                    fontSize: '15px',
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

                {this.state.procedimientos.length === 0 ? (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body text-center py-5">
                            <i className="fas fa-stethoscope fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                            <h5 className="text-muted mb-2">No hay procedimientos para mostrar</h5>
                            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                Escriba en el buscador para encontrar procedimientos o agregue uno nuevo
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body p-0">
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
                                                border: 'none',
                                                width: '35%'
                                            }}>Procedimiento</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Precio</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Comisión</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none',
                                                textAlign: 'center',
                                                width: '200px'
                                            }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.procedimientos.map((data, index) => (
                                            <tr 
                                                key={data.id}
                                                id={data.id}
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
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: data.color || '#667eea',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '18px',
                                                            fontWeight: 600,
                                                            flexShrink: 0
                                                        }}>
                                                            <i className="fas fa-stethoscope"></i>
                                                        </div>
                                                        <div>
                                                            <div style={{ 
                                                                fontWeight: 600, 
                                                                color: '#495057',
                                                                fontSize: '16px',
                                                                marginBottom: '2px'
                                                            }}>
                                                                {data.nombre}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                    <div style={{
                                                        padding: '8px 14px',
                                                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                        borderRadius: '8px',
                                                        fontSize: '15px',
                                                        color: '#495057',
                                                        fontWeight: 600,
                                                        display: 'inline-block'
                                                    }}>
                                                        <i className="fas fa-dollar-sign me-1" style={{ color: '#28a745' }}></i>
                                                        RD$ {new Intl.NumberFormat().format(data.precio)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                    {data.comision !== undefined && data.comision > 0 ? (
                                                        <div style={{
                                                            padding: '8px 14px',
                                                            background: 'linear-gradient(135deg, #e7f3ff 0%, #cfe2ff 100%)',
                                                            borderRadius: '8px',
                                                            fontSize: '15px',
                                                            color: '#0066cc',
                                                            fontWeight: 600,
                                                            display: 'inline-block'
                                                        }}>
                                                            <i className="fas fa-percent me-1"></i>
                                                            {data.comision}%
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#6c757d', fontSize: '14px' }}>Sin comisión</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <div className="d-flex justify-content-center" style={{ gap: '10px' }}>
                                                        <button 
                                                            className="btn btn-sm" 
                                                            onClick={() => this.actualizar(data.id)}
                                                            title="Editar procedimiento"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 12px',
                                                                fontWeight: 600,
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(28, 28, 30, 0.3)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.1)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(28, 28, 30, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm" 
                                                            onClick={() => this.eliminar(data.id)}
                                                            title="Eliminar procedimiento"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 12px',
                                                                fontWeight: 600,
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(142, 142, 147, 0.3)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.1)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(142, 142, 147, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(142, 142, 147, 0.3)';
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
                        </div>
                    </div>
                )}
                    {this.state.modal_update && (
                        <div
                            className="modal d-block"
                            style={{
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 1050,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            overflow: 'auto',
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(5px)'
                            }}>
                            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 600 }}>
                            <div
                                className="card border-0 shadow-lg"
                                style={{
                                width: '100%',
                                zIndex: 1060,
                                pointerEvents: 'auto',
                                borderRadius: '16px',
                                overflow: 'hidden'
                                }}>
                                <div className="card-header text-white p-4" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0" style={{ fontWeight: 700, fontSize: '20px' }}>
                                            <i className="fas fa-edit me-2"></i>Actualizar Procedimiento
                                        </h5>
                                        <button 
                                            type="button" 
                                            className="btn-close btn-close-white" 
                                            onClick={() => this.setState({ modal_update: false })}
                                            style={{ fontSize: '20px' }}
                                        ></button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="mb-3">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                            Nombre
                                        </label>
                                        <input 
                                            className='form-control' 
                                            name="nombre" 
                                            value={this.state.nombre} 
                                            onChange={this.actualizar_valor}
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid #e0e0e0',
                                                padding: '12px 16px',
                                                fontSize: '15px',
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
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                            Precio
                                        </label>
                                        <input 
                                            className='form-control' 
                                            name="precio" 
                                            value={this.state.precio} 
                                            onChange={this.actualizar_valor}
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid #e0e0e0',
                                                padding: '12px 16px',
                                                fontSize: '15px',
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
                                    <div className="mb-4">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                            Color
                                        </label>
                                        <select 
                                            id="color" 
                                            onChange={this.actualizar_color}  
                                            className="form-control"
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid #e0e0e0',
                                                padding: '14px 16px',
                                                fontSize: '15px',
                                                minHeight: '50px',
                                                height: 'auto',
                                                lineHeight: '1.5',
                                                transition: 'all 0.2s ease',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px center',
                                                paddingRight: '40px'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#1c1c1e';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value={this.state.color}>{this.state.color}</option>
                                            <option value="red">Rojo</option>
                                            <option value="blue">Azul</option>
                                            <option value="green">Verde</option>
                                            <option value="yellow">Amarillo</option>
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn"
                                            onClick={() => this.setState({ modal_update: false })}
                                            style={{
                                                background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '10px 24px',
                                                fontWeight: 600,
                                                fontSize: '15px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 12px rgba(142, 142, 147, 0.3)'
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
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => {
                                                this.actualizar_procedimiento();
                                                this.setState({ modal_update: false });
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '10px 24px',
                                                fontWeight: 600,
                                                fontSize: '15px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)'
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
                            </div>
                            </div>
                        </div>
				    )}
            </>
        );    

    }


}


export default BuscandoProcedimiento;