import React from 'react';
import ReactDOM from 'react-dom';
import BuscarDoctor from './buscar_doctor';
import Axios from 'axios';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';
import '../css/dashboard.css';
class DoctorFormulario extends React.Component{


		constructor(props){
				super(props);
				this.state={
					estado:null,
					select_op:null,
					especialidades: []
				}
				this._guardando = false;
		}

		componentDidMount() {
			this.cargarEspecialidades();
		}

		cargarEspecialidades = () => {
			Core.listar_especialidades().then(data => {
				this.setState({ especialidades: data });
			}).catch(error => {
				console.error("Error al cargar especialidades:", error);
			});
		}

		opciones=()=>{

			this.setState({select_op:'buscar_doctor'},function(){

				//	alert(this.state.select_op);

			});


		}

		guardar_doctor = () => {
			// Prevenir múltiples envíos
			if (this._guardando) {
				return;
			}

			var nombre = document.getElementById("nombre").value;
			var apellido =document.getElementById("apellido").value;
			var cedula = document.getElementById("cedula").value;
			var telefono = document.getElementById("telefono").value;
			var especialidad = document.getElementById("especialidad").value;

			if (!nombre || !apellido || !cedula || !telefono) {
				Alertify.error("Complete todos los campos requeridos");
				return;
			}

			this._guardando = true;

			// Normalizar URL (eliminar barra final si existe)
			const urlBase = Core.url_base.endsWith('/') ? Core.url_base.slice(0, -1) : Core.url_base;
			Axios.post(`${urlBase}/api/crear_doctor_completo`, {
				nombre: nombre,
				apellido: apellido,
				cedula: cedula,
				telefono: telefono,
				especialidad: especialidad || null
			}).then(data=>{
				Alertify.success("Doctor guardado con éxito");
				// Limpiar campos
				document.getElementById("nombre").value = "";
				document.getElementById("apellido").value = "";
				document.getElementById("cedula").value = "";
				document.getElementById("telefono").value = "";
				document.getElementById("especialidad").value = "";
				this._guardando = false;
				this.setState({select_op:'buscar_doctor'});
			}).catch(error=>{
				const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error al guardar el doctor";
				Alertify.error(errorMessage);
				console.error("Error completo:", error.response?.data || error);
				this._guardando = false;
			});
		}

		render(){

			if(this.state.select_op=='buscar_doctor'){


					return <BuscarDoctor/>
			}



			return (
					<div className="mac-container col-md-10">
						<div className="mac-box">
						<h2 className="mac-title">Agregar Doctor</h2>
						
	
						<div className="text-end mb-4" style={{float:'right'}}>
							<button className="mac-btn mac-btn-dark" onClick={this.opciones}>
							🔍 Buscar Doctor
							</button>
						</div>

						<div className="mac-form-group">
							<label>Nombre</label>
							<input type="text" className="mac-input" id="nombre" placeholder="Escribe el nombre" />
						</div>

						<div className="mac-form-group">
							<label>Apellido</label>
							<input type="text" className="mac-input" id="apellido" placeholder="Escribe el apellido" />
						</div>

						<div className="mac-form-group">
							<label>Cédula</label>
							<input type="text" className="mac-input" id="cedula" placeholder="000-0000000-0" />
						</div>

						<div className="mac-form-group">
							<label>Número de Teléfono</label>
							<input
							type="tel"
							className="mac-input"
							id="telefono"
							placeholder="809-000-0000"
							pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
							/>
						</div>

						<div className="mac-form-group">
							<label>Especialidad</label>
							<select className="mac-input" id="especialidad">
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

						<div className="text-end" style={{textAlign:'center'}}><hr/>
							<button className="mac-btn mac-btn-dark"   onClick={this.guardar_doctor}>
							💾 Guardar
							</button>
						</div>
						</div>
					</div>
					);



		}








}

export default DoctorFormulario;