import React from 'react';
import ReactDOM from 'react-dom';
import BuscarDoctor from './buscar_doctor';
import Axios from 'axios';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';
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



			return (<div className="col-md-8">
					<br/><h1>Agregar Doctor</h1>
					<button className="btn btn-success" style={{marginLeft:'80%'}} onClick={this.opciones}>Buscar Doctor</button><br/>
					<strong>Nombre</strong><br/>
					<input type="text" className="form-control" id="nombre" /><br/>
					<strong>Apellido</strong><br/>
					<input type="text" className="form-control" id="apellido" /><br/>
					<strong>Cedula</strong><br/>
					<input type="text" className="form-control" id="cedula" /><br/>
					<strong>Numero de telefono</strong><br/>
					<input type="tel" className="form-control" id="telefono" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" /><br/>
					<strong>Especialidad</strong><br/>
					<select className="form-control">
							<option>Odontocista</option>
							<option>Odontologo</option>
					</select><br/>
					<button className="btn btn-primary" onClick={this.guardar_doctor}>Guardar</button>
				   </div>);


		}








}

export default DoctorFormulario;