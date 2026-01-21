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
            return(<div className="col-md-8"><br/><br/><hr/><h5 style={{color:'#0350cb'}}>Actualizar Paciente</h5>
                    <div><button className="btn-primary boton_paciente" onClick={this.ver_pacientes} >Retroceder</button><br/><br/>

                        <table className='table'>
                            <tr>
                                <td><img src={Core.url_base+'/storage/'+this.state.paciente.foto_paciente} id="imagen_paciente" style={{heigth:'150px',width:'150px'}} className="rounded"/><hr/></td>
                                <td><p style={{color:'#0350cb'}}>Cambiar foto de perfil&nbsp;</p><hr/><input type='file' onChange={this.cambiar_foto} id="foto_perfil" /> </td>
                                <td>Ingresado por {this.state.paciente.doctor.nombre}  {this.state.paciente.doctor.apellido}</td>
                            </tr>
                        </table>
                        <strong>Nombre</strong><br/>

                        <input type='text' value={this.state.paciente.nombre} onChange={this.actualizar_paciente} id="nombre" className="form-control"/><br/>

                        <strong>Apellido</strong><br/>

                        <input type='text' value={this.state.paciente.apellido} onChange={this.actualizar_paciente} id="apellido" className="form-control"/><br/>

                        <strong>Nombre del tutor</strong><br/>

                        <input type='text' id="nombre_tutor" value={this.state.paciente.nombre_tutor} onChange={this.actualizar_paciente} className="form-control"/><br/>

                        <strong>DNI</strong><br/>

                        <input type='text' id="cedula" value={this.state.paciente.cedula} onChange={this.actualizar_paciente} className="form-control"/><br/>

                        <strong>Sexo</strong><br/>
                            <select 
                                id="sexo" 
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
                                <option value="h">Hombre</option>
                                <option value="m">Mujer</option>
                                <option value="hm">Hombre moderno</option>
                                <option value="mm">Mujer moderna</option>
                                <option value="d">Desconocido</option>
                            </select><br/>
                        <strong>FECHA DE NACIMIENTO</strong><br/>

                        <input type='date' id="fecha_nacimiento" onChange={this.actualizar_paciente} value={this.state.paciente.fecha_nacimiento} className="form-control"/><br/>

                        <strong>NUMERO DE TELEFONO</strong><br/>

                        <input type='tel'  id="telefono" onChange={this.actualizar_paciente} value={this.state.paciente.telefono} className="form-control" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" /><br/>
                        
                        
                        <strong>Correo electronico</strong><br/>
                        <input type='email'  id="correo" onChange={this.actualizar_paciente} value={this.state.paciente.correo_electronico} className="form-control"/><br/>

                        <strong>Ingresado por doctor</strong><br/>
                        <select 
                            id="doctores_select" 
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
                                paddingRight: '40px',
                                whiteSpace: 'normal',
                                wordWrap: 'break-word'
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
                            {this.state.doctores.map((data=>(
                                        <option key={data.id} value={data.id}>{data.nombre} {data.apellido}</option>
                            )))}
                        </select><br/>
                        <button className="btn btn-primary" onClick={this.actualizar}>Actualizar</button>
                    </div>
                </div>); 
        }


}

export default ActualizarPaciente;