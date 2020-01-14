import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import Citas from './citas_c';

class ActualizarPaciente extends React.Component{


        constructor(props){
                super(props);
                this.state={data:'',estado:'',paciente:"",doctores:[]};
                this.actualizar_paciente =  this.actualizar_paciente.bind(this);
        }
        
        componentDidMount(){
            this.cargar_data_paciente(this.props.IdPaciente);
            Core.cargar_doctores(this);
        }

        cargar_data_paciente=(id_paciente)=>{

                Axios.get(`${Core.url_base}/api/paciente/${id_paciente}`).then(data=>{
                        this.setState({paciente:data.data});
                }).catch(error=>{
                        Alertify.error("Error al cargar paciente");
                });

        }

        actualizar=()=>{
                    let sexo = document.getElementById('sexo').value;
                    let doctor_select= document.getElementById('doctores_select').value;

                    Axios.get(`${Core.url_base}/api/actualizar_paciente/${this.state.paciente.nombre}/${this.state.paciente.apellido}
                    /${this.state.paciente.cedula}/${this.state.paciente.telefono}/
                    ${sexo}/${this.state.paciente.fecha_nacimiento}/${doctor_select}/${this.props.IdPaciente}`).then(data=>{

                        Alertify.success("Paciente actualizado correctamente!");
                        this.setState({estado:'pacientes'});
                    }).catch(error=>{
                        Alertify.error("Error al actualizar paciente!");


                    });
             
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
                    this.setState({paciente:{fecha_nacimiento:e.target.value}});
                }
        }

        render(){

            if(this.state.estado=='pacientes'){ 
                return <Citas/>;
            }
            return(<div className="col-md-8"><br/><h1>Actualizar Paciente</h1>
                    <div><button className="btn btn-info boton_paciente" onClick={this.ver_pacientes} id="ver_pacientes">Ver Pacientes</button><br/>
                        
                        <strong>Nombre</strong><br/>

                        <input type='text' value={this.state.paciente.nombre} onChange={this.actualizar_paciente} id="nombre" className="form-control"/><br/>

                        <strong>Apellido</strong><br/>

                        <input type='text' value={this.state.paciente.apellido} onChange={this.actualizar_paciente} id="apellido" className="form-control"/><br/>

                        <strong>DNI</strong><br/>

                        <input type='text' id="cedula" value={this.state.paciente.cedula} onChange={this.actualizar_paciente} className="form-control"/><br/>

                        <strong>Sexo</strong><br/>
                            <select id="sexo" className="form-control">
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
                        
                        <strong>Ingresado por doctor</strong><br/>
                        <select id="doctores_select" className="form-control">
                            {this.state.doctores.map((data=>(
                                        <option value={data.id}>{data.nombre} {data.apellido}</option>
                            )))}
                        </select><br/>
                        <button className="btn btn-primary" onClick={this.actualizar}>Actualizar</button>
                    </div>
                </div>); 
        }


}

export default ActualizarPaciente;