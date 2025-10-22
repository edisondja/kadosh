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
				},
				nombre: '',
				nombre_tutor: '',
				apellido: '',
				cedula: '',
				fecha_nacimiento: '',
				correo_electronico: '',
				fecha_nacimiento:'',
				sexo: 'm',
				enfermedades: '',
				observaciones: '',
				es_pediatrico: 'no'
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
	handleChange = (event) => {
		const { name, value } = event.target;
		this.setState({ [name]: value });
	}

	capturar_telefono = (telefono) => {

		this.setState({ telefono });

	 }

	guardar_paciente=()=>{
		

				var formData = new FormData();
				var imagefile = document.querySelector('#foto_paciente');
				if(imagefile.files.length>0){
					formData.append("foto_paciente", imagefile.files[0]);
				}
				//SE AGREGAN LOS DEMÁS DATOS AL FORM DATA

				formData.append("nombre",this.state.nombre);
				formData.append("apellido",this.state.apellido);
				formData.append("cedula",this.state.cedula);
				formData.append("telefono",this.state.telefono);
				formData.append("id_doctor",document.getElementById("doctores_select").value);
				formData.append("nombre_tutor",this.nombre_tutor);
				formData.append("fecha_nacimiento",this.state.fecha_nacimiento);
				formData.append("correo_electronico",this.state.correo_electronico);
				formData.append("sexo",this.state.sexo);
			
			Axios.post(`${FuncionesExtras.url_base}/api/guardar_paciente`,formData).then(data=>{
					document.getElementById("cargar_pacientes").click();
					this.setState({boton_estado:true});
			}).catch(error=>{

					alert("error");
			})

			
	
	}

	render(){

		return (
					<div className="mac-container col-md-10">
						<div className="mac-box">
						<div className="d-flex justify-content-between align-items-center mb-4">
							<h2 className="mac-title">Agregar Paciente</h2>
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
							<input type="text" id="nombre" name="nombre" className="mac-input" value={this.state.nombre} onChange={this.handleChange} />
						</div>

						<div className="mac-form-group">
							<label>Apellido</label>
							<input type="text" id="apellido" name="apellido" className="mac-input" value={this.state.apellido} onChange={this.handleChange} />
						</div>

						<div className="mac-form-group">
						<hr />
						<div className="mac-form-group" style={{ justifyContent: "space-between" }}>
							<label htmlFor="es_pediatrico" className="mac-label">
							¿Es pediátrico?
							</label>
							<label className="mac-switch">&nbsp;&nbsp;
							<input
								type="checkbox"
								id="es_pediatrico"
								name="es_pediatrico"
								checked={this.state.es_pediatrico === "si"}
								onChange={(e) =>
								this.setState({ es_pediatrico: e.target.checked ? "si" : "no" })
								}
							/>
							<span className="mac-slider"></span>
							</label>
						</div>

						{this.state.es_pediatrico === "si" && (
							<div className="mac-form-group full-width">
							<label htmlFor="nombre_padre" className="mac-label">
								Nombre del Tutor
							</label>
							<input
								type="text"
								id="nombre_tutor"
								name="nombre_tutor"
								className="mac-input"
								placeholder="Nombre del tutor"
								value={this.state.nombre_tutor}
								onChange={this.handleChange}
								style={{ width: "100%" }}
							/>
							</div>
						)}
						</div>


						<div className="mac-form-group">
							<label>Cedula o pasaporte</label>
							<input type="text" id="cedula" name="cedula" className="mac-input" value={this.state.cedula} onChange={this.handleChange} />
						</div>

						<div className="mac-form-group">
							<label>Correo Electrónico</label>
							<input 
							type="text"
							id="correo_electronico"
							name="correo_electronico"
							className="mac-input"
							placeholder="ejemplo --- edisondja@gmail.com"
							value={this.state.correo_electronico}
							onChange={this.handleChange}
							/>
						</div>

						<div className="mac-form-group">
							<label>Foto</label>
							<input type="file" id="foto_paciente" className="mac-input" />
						</div>

						<div className="mac-form-group">
							<label>Sexo</label>
							<select id="sexo" name="sexo" className="mac-input" value={this.state.sexo} onChange={this.handleChange}>
							<option value="h">Masculino</option>
							<option value="m">Femenino</option>
							</select>
						</div>

						<div className="mac-form-group">
							<label>Fecha de Nacimiento</label>
							<input type="date" id="fecha_nacimiento" name="fecha_nacimiento" className="mac-input" value={this.state.fecha_nacimiento} onChange={this.handleChange} />
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
							<label>Ingresado por Doctor</label>
							<select
							id="doctores_select"
							className="mac-input"
							onChange={this.seleccionar_doctor}
							>
							<option value="seleccionar">Seleccione el doctor</option>
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