import React from 'react';
import ReactDOM from 'react-dom';
import Citas from './citas_c';
import Axios from 'axios';
import FuncionesExtras from './funciones_extras';
import alertify from 'alertifyjs';

class PacienteAdmin extends  React.Component{

	constructor(props){
			super(props);
			this.state={estados:true,ver_paciente:false,doctores:[],boton_estado:true};
			

	}

	componentDidMount(){
			FuncionesExtras.cargar_doctores(this);
		
	}

	ver_pacientes(){

			document.getElementById("cargar_pacientes").click();
	}

	seleccionar_doctor=()=>{

		let doctores = document.getElementById("doctores_select").value;
		if(doctores!=="seleccionar"){
		this.setState({boton_estado:false});
		}else{
			this.setState({boton_estado:true});

		}
	}


	guardar_paciente=()=>{
		
		
		if(this.state.boton_estado==false){


				var formData = new FormData();
				var imagefile = document.querySelector('#foto_paciente');
				if(imagefile.files.length>0){
					formData.append("foto_paciente", imagefile.files[0]);
				}
				formData.append("nombre",document.getElementById("nombre").value);
				formData.append("apellido",document.getElementById("apellido").value);
				formData.append("cedula",document.getElementById("cedula").value);
				formData.append("telefono",document.getElementById("telefono").value);
				formData.append("id_doctor",document.getElementById("doctores_select").value);
				formData.append("fecha_nacimiento",document.getElementById("fecha_nacimiento").value);
				formData.append("correo_electronico",document.getElementById("correo_electronico").value);
				formData.append("sexo",document.getElementById("sexo").value);

			
			Axios.post(`${FuncionesExtras.url_base}/api/guardar_paciente`,formData).then(data=>{
					document.getElementById("cargar_pacientes").click();
					this.setState({boton_estado:true});
			}).catch(error=>{

					alert("error");
			})

			this.setState({boton_estado:true});
		}else{

			alertify.message("Ya me registrate");
		}
	}

	render(){

		return(<div className="col-md-10">
				<div><hr/>
					<table>
						<tr>	
							<td><h4>Agregar paciente +</h4></td>
							<td><hr/><button className="btn btn-info boton_paciente" onClick={this.ver_pacientes} id="ver_pacientes">Ver Pacientes</button></td>
						</tr>
					</table>
						
						<strong>Nombre</strong><br/>

						<input type='text' id="nombre" className="form-control"/><br/>

						<strong>Apellido</strong><br/>

						<input type='text' id="apellido" className="form-control"/><br/>

						<strong>DNI</strong><br/>

						<input type='text' id="cedula" className="form-control"/><br/>

						<strong>Correo electronico</strong><br/>

						<input type='text' id="correo_electronico" placeholder='ejemplo --- edisondja@gmail.com' className="form-control"/><br/>

						<strong>Foto</strong><br/>

						<input type='file' id="foto_paciente"  className="form-control"/><br/>

						<strong>Sexo</strong><br/>
							<select id="sexo" className="form-control">
								<option value="h">Masculino</option>
								<option value="m">Femenino</option>
							</select><br/>
						<strong>FECHA DE NACIMIENTO</strong><br/>

						<input type='date' id="fecha_nacimiento" className="form-control"/><br/>

						<strong>NUMERO DE TELEFONO</strong><br/>

						<input type='tel'  id="telefono" className="form-control" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" /><br/>
						
						<strong>Ingresado por doctor</strong><br/>
						<select id="doctores_select" className="form-control" onChange={this.seleccionar_doctor}>
							<option value="seleccionar">Seleccioné el doctor</option>
							{this.state.doctores.map((data=>(
										<option value={data.id}>{data.nombre} {data.apellido}</option>
							)))}
						</select><br/>
						<button className="btn btn-primary" disabled={this.state.boton_estado} onClick={this.guardar_paciente}>Guardar</button>
					</div>
				</div>); 


	}


}

export default PacienteAdmin;