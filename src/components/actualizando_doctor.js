import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import ReactToast from 'react-toasts';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import { BrowserRouter, Route} from "react-router-dom";


class ActualizarDoctor extends React.Component{

    constructor(props){
            super(props);
            this.state = {
				doctor:{nombre:"Edison",apellido:"De Jesus Abreu"},
				especialidades: []
			};
            this.editando_campo = this.editando_campo.bind(this);
    }
            
    componentDidMount(){
        this.cargar_doctor(this.props.id_doctor);
		this.cargarEspecialidades();
    }

	cargarEspecialidades = () => {
		Core.listar_especialidades().then(data => {
			this.setState({ especialidades: data });
		}).catch(error => {
			console.error("Error al cargar especialidades:", error);
		});
	}
0
    cargar_doctor=(id)=>{


        Axios.get(`${Core.url_base}/api/cargar_doctor/${id}`).then(data=>{

            this.setState({doctor:data.data});

        }).catch(error=>{

            Alertify.message(error);

        });

    }

    editando_campo(e){

        if(e.target.id=="nombre"){
            let doctor  = this.state.doctor;
            doctor.nombre =e.target.value;
            this.setState({doctor:doctor});

        }else if(e.target.id=="apellido"){

            let doctor  = this.state.doctor;
            doctor.apellido =e.target.value;
            this.setState({doctor:doctor});

        }else if(e.target.id=="telefono"){  

            let doctor  = this.state.doctor;
            doctor.numero_telefono =e.target.value;
            this.setState({doctor:doctor});

        }else if(e.target.id=="dni"){
            let doctor  = this.state.doctor;
            doctor.dni =e.target.value;
            this.setState({doctor:doctor});
        }else if(e.target.id=="especialidad"){
            let doctor  = this.state.doctor;
            doctor.especialidad =e.target.value;
            this.setState({doctor:doctor});
        }else if(e.target.id=="sexo"){
            let doctor  = this.state.doctor;
            doctor.sexo =e.target.value;
            this.setState({doctor:doctor});
        }

    }

    actualizar_doctor=()=>{

        Axios.put(`${Core.url_base}/api/actualizar_doctor_completo/${this.props.id_doctor}`, {
            nombre: this.state.doctor.nombre,
            apellido: this.state.doctor.apellido,
            cedula: this.state.doctor.dni,
            telefono: this.state.doctor.numero_telefono,
            especialidad: this.state.doctor.especialidad || null,
            sexo: this.state.doctor.sexo || null
        }).then(data=>{
            Alertify.success("Doctor actualizado correctamente");
        }).catch(error=>{
            Alertify.error("Error al actualizar doctor");
            console.error(error);
        });

    }

    render(){

        return(
            <div className="container-fluid mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-12 col-lg-11 col-xl-10">
                        {/* Card principal con gradiente */}
                        <div className="card shadow-lg border-0" style={{ 
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}>
                            {/* Header con gradiente */}
                            <div className="card-header border-0 text-white" style={{ 
                                background: 'transparent',
                                padding: '30px',
                                borderBottom: '1px solid rgba(255,255,255,0.2)'
                            }}>
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
                                        <i className="fas fa-user-md"></i>
                                    </div>
                                    <div>
                                        <h3 className="mb-0" style={{ fontWeight: '700', fontSize: '28px' }}>
                                            Actualizar Doctor
                                        </h3>
                                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                            Modifica la información del doctor
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Body del formulario */}
                            <div className="card-body p-5" style={{ background: '#f8f9fa' }}>
                                <div className="row">
                                    {/* Columna izquierda */}
                                    <div className="col-md-6 mb-4">
                                        <div className="form-group">
                                            <label className="form-label fw-bold mb-2" style={{ 
                                                color: '#333',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <i className="fas fa-user me-2 text-primary"></i>Nombre
                                            </label>
                                            <input 
                                                type="text" 
                                                id="nombre" 
                                                onChange={this.editando_campo}  
                                                value={this.state.doctor.nombre || ''}  
                                                className="form-control"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '12px 16px',
                                                    fontSize: '15px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Columna derecha */}
                                    <div className="col-md-6 mb-4">
                                        <div className="form-group">
                                            <label className="form-label fw-bold mb-2" style={{ 
                                                color: '#333',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <i className="fas fa-user-tag me-2 text-primary"></i>Apellido
                                            </label>
                                            <input 
                                                type="text" 
                                                id="apellido"  
                                                onChange={this.editando_campo}  
                                                value={this.state.doctor.apellido || ''}  
                                                className="form-control"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '12px 16px',
                                                    fontSize: '15px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-4">
                                        <div className="form-group">
                                            <label className="form-label fw-bold mb-2" style={{ 
                                                color: '#333',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <i className="fas fa-phone me-2 text-primary"></i>Teléfono
                                            </label>
                                            <input 
                                                type="text"  
                                                id="telefono"  
                                                onChange={this.editando_campo}  
                                                value={this.state.doctor.numero_telefono || ''}  
                                                className="form-control"
                                                placeholder="809-000-0000"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '12px 16px',
                                                    fontSize: '15px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <div className="form-group">
                                            <label className="form-label fw-bold mb-2" style={{ 
                                                color: '#333',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <i className="fas fa-venus-mars me-2 text-primary"></i>Sexo
                                            </label>
                                            <select 
                                                id="sexo"  
                                                onChange={this.editando_campo}  
                                                className="form-control"
                                                value={this.state.doctor.sexo || ''}
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '12px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
                                                    lineHeight: '1.5',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 16px center',
                                                    paddingRight: '40px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <option value="">Seleccionar sexo...</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Femenino</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <div className="form-group">
                                            <label className="form-label fw-bold mb-2" style={{ 
                                                color: '#333',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <i className="fas fa-id-card me-2 text-primary"></i>DNI / Cédula
                                            </label>
                                            <input 
                                                type="text" 
                                                id="dni"  
                                                onChange={this.editando_campo} 
                                                className="form-control" 
                                                value={this.state.doctor.dni || ''}
                                                placeholder="000-0000000-0"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '12px 16px',
                                                    fontSize: '15px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mb-4">
                                        <div className="form-group">
                                            <label className="form-label fw-bold mb-2" style={{ 
                                                color: '#333',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <i className="fas fa-graduation-cap me-2 text-primary"></i>Especialidad
                                            </label>
                                            <select 
                                                id="especialidad" 
                                                onChange={this.editando_campo} 
                                                className="form-control"
                                                value={this.state.doctor.especialidad || ''}
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '12px 16px',
                                                    fontSize: '15px',
                                                    transition: 'all 0.3s ease',
                                                    background: 'white',
                                                    cursor: 'pointer'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e0e0e0';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                <option value="">Seleccionar especialidad...</option>
                                                {this.state.especialidades && this.state.especialidades.length > 0 ? (
                                                    this.state.especialidades.map((esp) => (
                                                        <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
                                                    ))
                                                ) : (
                                                    Core.lenguaje && Core.lenguaje.especialidades && 
                                                    Core.lenguaje.especialidades.map((esp, index) => (
                                                        <option key={index} value={esp}>{esp}</option>
                                                    ))
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de actualizar */}
                                <div className="d-flex justify-content-end mt-4 pt-4" style={{ borderTop: '2px solid #e0e0e0' }}>
                                    <button 
                                        className="btn btn-lg"
                                        onClick={this.actualizar_doctor}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 40px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                            transition: 'all 0.3s ease',
                                            minWidth: '200px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                                        }}
                                    >
                                        <i className="fas fa-save me-2"></i>
                                        Actualizar Doctor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
        );      

    }



}

export default ActualizarDoctor;