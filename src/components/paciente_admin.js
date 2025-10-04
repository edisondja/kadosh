import React from 'react';
import ReactDOM from 'react-dom';
import Citas from './citas_c';
import Axios from 'axios';
import FuncionesExtras from './funciones_extras';
import alertify from 'alertifyjs';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import doFlag from '../assets/flags/do.svg';

class PacienteAdmin extends  React.Component{

	constructor(props){
			super(props);
			this.state={
				estados:true,ver_paciente:false,doctores:[],
				boton_estado:true,
				telefono:'',
				customFlags: {
					DO: doFlag
			}
		};
			

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


	capturar_telefono = (telefono) => {

		this.setState({ telefono });

	 }

	guardar_paciente=()=>{
		
		
		if(this.state.boton_estado==false){


				const formData = new FormData();

				// Foto (si no hay archivo no se agrega nada)
				const imagefile = document.querySelector("#foto_paciente");
				if (imagefile && imagefile.files && imagefile.files.length > 0) {
				formData.append("foto_paciente", imagefile.files[0]);
				}

				// Campos de texto con fallback seguro
				formData.append("nombre", document.getElementById("nombre")?.value ?? "");
				formData.append("apellido", document.getElementById("apellido")?.value ?? "");
				formData.append("cedula", document.getElementById("cedula")?.value ?? "");
				formData.append("telefono", this.state.telefono ?? "");
				formData.append("id_doctor", document.getElementById("doctores_select")?.value ?? "");
				formData.append("fecha_nacimiento", document.getElementById("fecha_nacimiento")?.value ?? "");
				formData.append("correo_electronico", document.getElementById("correo_electronico")?.value ?? "");
				formData.append("sexo", document.getElementById("sexo")?.value ?? "");

			Axios.post(`${FuncionesExtras.url_base}/api/guardar_paciente`,formData).then(data=>{
					document.getElementById("cargar_pacientes").click();
					this.setState({boton_estado:true});

			}).catch(error=>{

					alert(error);
			})

			this.setState({boton_estado:true});
		}else{

			alertify.message("Ya me registrate");
		}
	}

	render(){

		return (
					<div className="mac-container col-md-10">
						<div className="mac-box">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h2 className="mac-title">Agregar Estudiante</h2>
							<button
							className="mac-btn mac-btn-dark"
							onClick={this.ver_pacientes}
							id="ver_pacientes"
							>
							 Ver Pacientes
							</button>
						</div>

						<div className="mac-form-group">
							<label>Nombre</label>
							<input type="text" id="nombre" className="mac-input" />
						</div>

						<div className="mac-form-group">
							<label>Apellido</label>
							<input type="text" id="apellido" className="mac-input" />
						</div>

						<div className="mac-form-group">
							<label>DNI</label>
							<input type="text" id="cedula" className="mac-input" />
						</div>

						<div className="mac-form-group">
							<label>Correo Electrónico</label>
							<input
							type="text"
							id="correo_electronico"
							className="mac-input"
							placeholder="ejemplo --- edisondja@gmail.com"
							/>
						</div>

						<div className="mac-form-group">
							<label>Foto</label>
							<input type="file" id="foto_paciente" className="mac-input" />
						</div>

						<div className="mac-form-group">
							<label>Sexo</label>
							<select id="sexo" className="mac-input">
							<option value="h">Masculino</option>
							<option value="m">Femenino</option>
							</select>
						</div>

						<div className="mac-form-group">
							<label>Fecha de Nacimiento</label>
							<input type="date" id="fecha_nacimiento" className="mac-input" />
						</div>

						<div className="mac-form-group">
							<label>Número de Teléfono</label>
						<PhoneInput	
						 	inputClassName="form-control" 
							country="DO"
							flags={this.state.customFlags.DO}
							placeholder="Ingrese el número de teléfono"
							value={this.state.telefono}
							onChange={(value) => this.capturar_telefono(value)}
							defaultCountry="DO"/>
							
						</div>

						<div className="mac-form-group">
							<label>Agregar a curso</label>
							<select
							id="doctores_select"
							className="mac-input"
							onChange={this.seleccionar_doctor}
							>
							<option value="seleccionar">Seleccione el curso</option>
							{this.state.doctores.map((data) => (
								<option key={data.id} value={data.id}>
								{data.nombre} {data.apellido}
								</option>
							))}
							</select>
						</div>

						<div className="text-end" style={{textAlign:'center'}}><hr/>
							<button
							className="mac-btn mac-btn-dark"
							onClick={this.guardar_paciente}
							disabled={this.state.boton_estado}
							>
							💾 Guardar
							</button>
						</div>
						</div>
					</div>
					);


	}


}

export default PacienteAdmin;