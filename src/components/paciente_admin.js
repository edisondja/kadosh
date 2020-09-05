import React from 'react';
import ReactDOM from 'react-dom';
import Citas from './citas_c';
import Axios from 'axios';
import FuncionesExtras from './funciones_extras';

class PacienteAdmin extends  React.Component{

	constructor(props){
			super(props);
			this.state={estados:true,ver_paciente:false,doctores:[]};
			

	}

	componentDidMount(){
			FuncionesExtras.cargar_doctores(this);
	}

	ver_pacientes(){

			document.getElementById("cargar_pacientes").click();
	}


	guardar_paciente=()=>{
	
			var nombre = document.getElementById("nombre").value;
			var apellido = document.getElementById("apellido").value;
			var dni = document.getElementById("cedula").value;
			var telefono = document.getElementById("telefono").value;
			var id_doctor = document.getElementById("doctores_select").value;
			var fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
			var sexo = document.getElementById("sexo").value

			Axios.get(`${FuncionesExtras.url_base}/api/guardar_paciente/${nombre}/${apellido}/${telefono}/${id_doctor}/${dni}/${fecha_nacimiento}/${sexo}`).then(data=>{
					document.getElementById("cargar_pacientes").click();
			}).catch(error=>{

					alert("error");
			})


	}

	render(){

		return(<div className="col-md-8"><br/><h1>Agregar Paciente</h1>
					<div><button className="btn btn-info boton_paciente" onClick={this.ver_pacientes} id="ver_pacientes">Ver Pacientes</button><br/>
						
						<strong>Nombre</strong><br/>

						<input type='text' id="nombre" className="form-control"/><br/>

						<strong>Apellido</strong><br/>

						<input type='text' id="apellido" className="form-control"/><br/>

						<strong>DNI</strong><br/>

						<input type='text' id="cedula" className="form-control"/><br/>

						<strong>Sexo</strong><br/>
							<select id="sexo" className="form-control">
								<option value="h">Masculino</option>
								<option value="m">Femenino</option>
								<option value="hm">Otros</option>
							</select><br/>
						<strong>FECHA DE NACIMIENTO</strong><br/>

						<input type='date' id="fecha_nacimiento" className="form-control"/><br/>

						<strong>NUMERO DE TELEFONO</strong><br/>

						<input type='tel'  id="telefono" className="form-control" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" /><br/>
						
						<strong>Ingresado por doctor</strong><br/>
						<select id="doctores_select" className="form-control">
							{this.state.doctores.map((data=>(
										<option value={data.id}>{data.nombre} {data.apellido}</option>
							)))}
						</select><br/>
						<button className="btn btn-primary" onClick={this.guardar_paciente}>Guardar</button>
					</div>
				</div>); 


	}


}

export default PacienteAdmin;