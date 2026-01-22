import React, { useReducer } from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import Citas from './citas_c';
import User from '../user_profile.png'

class ActualizarPaciente extends React.Component{


        constructor(props){
                super(props);
                this.state={data:'',estado:'',paciente:{doctor:{}},doctores:[],foto_cambio:false};
                this.actualizar_paciente =  this.actualizar_paciente.bind(this);
        }
        
        componentDidMount(){
            this.cargar_data_paciente(this.props.match.params.id);
            Core.cargar_doctores(this);
        }

        cargar_data_paciente=(id_paciente)=>{

                Axios.get(`${Core.url_base}/api/paciente/${id_paciente}`).then(data=>{
                        this.setState({paciente:data.data});
                        console.log(this.state.paciente);

                        if(this.state.paciente.foto_paciente==""){

                                foto_paciente:document.getElementById("imagen_paciente").src=User;
                        }
                }).catch(error=>{
                        Alertify.error("Error al cargar paciente");
                });

        }

        cambiar_foto=(e)=>{

            var formData = new FormData();
			var imagefile = document.querySelector('#foto_perfil');
			formData.append("foto_paciente", imagefile.files[0]);
            formData.append("id",this.props.match.params.id);

            Axios.post(`${Core.url_base}/api/actualizar_foto_paciente`,formData).then(data=>{

                document.getElementById("imagen_paciente").src=Core.url_base+'/storage/'+data.data;

            }).catch(error=>{

                    console.log(error);
            })



        }

        actualizar=()=>{
                    let sexo = document.getElementById('sexo').value;
                    let doctor_select= document.getElementById('doctores_select').value;
                    let telefono = document.getElementById("telefono").value;
                    let correo = document.getElementById("correo").value;

                
                    let paciente_update = {

                            nombre: this.state.paciente.nombre,
                            apellido:   this.state.paciente.apellido,
                            cedula :this.state.paciente.cedula,
                            sexo:sexo,
                            fecha_nacimiento:this.state.paciente.fecha_nacimiento,
                            id_doctor:doctor_select,
                            telefono:telefono,
                            correo_electronico:correo,
                            nombre_tutor:this.state.paciente.nombre_tutor,
                            id: this.props.match.params.id
                    };
                    
                    //console.log(paciente_update);

                    Axios.post(`${Core.url_base}/api/actualizar_paciente`,paciente_update).then(data=>{

                        Alertify.success("Paciente actualizado correctamente!");
                        console.log(data);
                        this.setState({estado:'pacientes'});
                    }).catch(error=>{
                        Alertify.error("Error al actualizar paciente!");


                    });
             
        }

        ver_pacientes=()=>{


            console.log("entrando");
            this.setState({estado:'pacientes'});


        }

        actualizar_paciente(e){
           
                if(e.target.id=="nombre"){
                    let paciente = this.state.paciente;
                    paciente.nombre = e.target.value;
                    this.setState({paciente:paciente});

                }else if(e.target.id=="apellido"){

                    let paciente = this.state.paciente;
                    paciente.apellido = e.target.value;
                    this.setState({paciente:paciente});

                }else if(e.target.id=="cedula"){

                    let paciente = this.state.paciente;
                    paciente.cedula = e.target.value;
                    this.setState({paciente:paciente});

                }else if(e.target.id=="telefono"){

                    let paciente = this.state.paciente;
                    paciente.telefono = e.target.value;
                    this.setState({paciente:paciente});

                }else if(e.target.id=="fecha_nacimiento"){

                    let paciente = this.state.paciente;
                    paciente.fecha_nacimiento = e.target.value;
                    this.setState({paciente:paciente});
                  //  this.setState({paciente:{fecha_nacimiento:e.target.value}});
                
                }else if(e.target.id=="correo"){

                    let paciente = this.state.paciente;
                    paciente.correo_electronico = e.target.value;
                    this.setState({paciente:paciente});
                
                }else if(e.target.id=="nombre_tutor"){
                    let paciente = this.state.paciente;
                    paciente.nombre_tutor = e.target.value;
                    this.setState({paciente:paciente});
                }
        }

        render(){

            if(this.state.estado=='pacientes'){ 
                return <Citas/>;
            }
            
            const inputStyle = {
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                padding: '14px 16px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                background: '#ffffff',
                width: '100%',
                outline: 'none'
            };

            return (
                <div className="col-md-10" style={{ margin: '0 auto', padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                        {/* Header */}
                        <div className="card border-0 shadow-lg mb-4" style={{ 
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            overflow: 'hidden',
                            animation: 'fadeIn 0.5s ease'
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
                                            <i className="fas fa-user-edit"></i>
                                        </div>
                                        <div>
                                            <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                                Actualizar Paciente
                                            </h2>
                                            <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px', marginTop: '5px' }}>
                                                Modifica la información del paciente
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn"
                                        onClick={this.ver_pacientes}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            color: 'white',
                                            borderRadius: '12px',
                                            padding: '10px 20px',
                                            fontWeight: 600,
                                            fontSize: '14px',
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
                                </div>
                            </div>
                        </div>

                        {/* Foto de perfil */}
                        <div className="card border-0 shadow-sm mb-4" style={{ 
                            borderRadius: '16px',
                            background: '#ffffff',
                            overflow: 'hidden',
                            animation: 'slideUp 0.6s ease'
                        }}>
                            <div className="card-body p-4">
                                <div className="row align-items-center">
                                    <div className="col-md-4 text-center mb-3 mb-md-0">
                                        <img 
                                            src={Core.url_base+'/storage/'+this.state.paciente.foto_paciente} 
                                            id="imagen_paciente" 
                                            style={{
                                                height: '150px',
                                                width: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                                border: '4px solid #e0e0e0',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }} 
                                            className="rounded"
                                            alt="Foto paciente"
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <h5 style={{ fontWeight: 600, color: '#2d2d2f', marginBottom: '15px' }}>
                                            <i className="fas fa-image me-2" style={{ color: '#667eea' }}></i>
                                            Foto de Perfil
                                        </h5>
                                        <label 
                                            className="btn btn-outline-primary"
                                            style={{
                                                borderRadius: '10px',
                                                padding: '10px 20px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <i className="fas fa-camera me-2"></i>
                                            Cambiar Foto
                                            <input 
                                                type='file' 
                                                onChange={this.cambiar_foto} 
                                                id="foto_perfil"
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                            />
                                        </label>
                                        {this.state.paciente.doctor && (
                                            <p className="mt-3 mb-0" style={{ color: '#6c757d', fontSize: '14px' }}>
                                                <i className="fas fa-user-md me-2"></i>
                                                Ingresado por: <strong>{this.state.paciente.doctor.nombre} {this.state.paciente.doctor.apellido}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="card border-0 shadow-sm mb-4" style={{ 
                            borderRadius: '16px',
                            background: '#ffffff',
                            overflow: 'hidden',
                            animation: 'slideUp 0.7s ease'
                        }}>
                            <div className="card-body p-4">
                                <h5 className="mb-4" style={{ fontWeight: 600, color: '#2d2d2f' }}>
                                    <i className="fas fa-user-edit me-2" style={{ color: '#667eea' }}></i>
                                    Información Personal
                                </h5>
                                
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Nombre
                                        </label>
                                        <input 
                                            type='text' 
                                            value={this.state.paciente.nombre || ''} 
                                            onChange={this.actualizar_paciente} 
                                            id="nombre" 
                                            style={inputStyle}
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

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Apellido
                                        </label>
                                        <input 
                                            type='text' 
                                            value={this.state.paciente.apellido || ''} 
                                            onChange={this.actualizar_paciente} 
                                            id="apellido" 
                                            style={inputStyle}
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

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            DNI / Cédula
                                        </label>
                                        <input 
                                            type='text' 
                                            id="cedula" 
                                            value={this.state.paciente.cedula || ''} 
                                            onChange={this.actualizar_paciente} 
                                            style={inputStyle}
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

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Nombre del Tutor
                                        </label>
                                        <input 
                                            type='text' 
                                            id="nombre_tutor" 
                                            value={this.state.paciente.nombre_tutor || ''} 
                                            onChange={this.actualizar_paciente} 
                                            style={inputStyle}
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

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Sexo
                                        </label>
                                        <select 
                                            id="sexo" 
                                            defaultValue={this.state.paciente.sexo || 'd'}
                                            style={{
                                                ...inputStyle,
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px center',
                                                paddingRight: '40px'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="h">Hombre</option>
                                            <option value="m">Mujer</option>
                                            <option value="hm">Hombre moderno</option>
                                            <option value="mm">Mujer moderna</option>
                                            <option value="d">Desconocido</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Fecha de Nacimiento
                                        </label>
                                        <input 
                                            type='date' 
                                            id="fecha_nacimiento" 
                                            onChange={this.actualizar_paciente} 
                                            value={this.state.paciente.fecha_nacimiento || ''} 
                                            style={inputStyle}
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

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Teléfono
                                        </label>
                                        <input 
                                            type='tel' 
                                            id="telefono" 
                                            onChange={this.actualizar_paciente} 
                                            value={this.state.paciente.telefono || ''} 
                                            style={inputStyle}
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

                                    <div className="col-md-6">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Correo Electrónico
                                        </label>
                                        <input 
                                            type='email' 
                                            id="correo" 
                                            onChange={this.actualizar_paciente} 
                                            value={this.state.paciente.correo_electronico || ''} 
                                            style={inputStyle}
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

                                    <div className="col-md-12">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                                            Doctor Asignado
                                        </label>
                                        <select 
                                            id="doctores_select" 
                                            defaultValue={this.state.paciente.id_doctor || ''}
                                            style={{
                                                ...inputStyle,
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px center',
                                                paddingRight: '40px'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            {this.state.doctores.map((data) => (
                                                <option key={data.id} value={data.id}>
                                                    {data.nombre} {data.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e0e0e0' }}>
                                    <button 
                                        className="btn"
                                        onClick={this.actualizar}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 30px',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                        }}
                                    >
                                        <i className="fas fa-save me-2"></i>
                                        Actualizar Paciente
                                    </button>
                                </div>
                            </div>
                        </div>
                </div>
            ); 
        }


}

export default ActualizarPaciente;