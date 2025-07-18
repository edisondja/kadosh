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
				this.state={estado:null,select_op:null}

		}

		opciones=()=>{

			this.setState({select_op:'buscar_doctor'},function(){

				//	alert(this.state.select_op);

			});


		}

		guardar_doctor(){

			var nombre = document.getElementById("nombre").value;
			var apellido =document.getElementById("apellido").value;
			var cedula = document.getElementById("cedula").value;
			var telefono = document.getElementById("telefono").value;

			Axios.get(`${Core.url_base}/api/crear_doctor/${nombre}/${apellido}/${cedula}/${telefono}`).then(data=>{
					Alertify.message("Doctor guardado con exito");
					this.setState({select_op:'buscar_doctor'});
			}).catch(error=>{

				alert(error);


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
							<select className="mac-input">
							<option>Odontocista</option>
							<option>Odontólogo</option>
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