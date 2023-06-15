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

		guardar_doctor=()=>{

			var nombre = document.getElementById("nombre").value;
			var apellido = "s";
			var cedula = "a";
			var telefono = "c";

			Axios.get(`${Core.url_base}/api/crear_doctor/${nombre}/${apellido}/${cedula}/${telefono}`).then(data=>{
					Alertify.message("Curso guardado con exito");
					this.setState({select_op:'buscar_doctor'});
			}).catch(error=>{

				alert(error);


			});



		}

		render(){

			if(this.state.select_op=='buscar_doctor'){


					return <BuscarDoctor/>
			}



			return (<div className="col-md-10">
				<br/><hr/>
					<br/><h3>Agregar Curso</h3>
					<button className="btn btn-success" className="btn btn-primary boton_doctor" onClick={this.opciones}>Buscar Cursos</button><br/>
					<strong>Nombre del curso</strong> +++<br/>
					<input type="text" className="form-control col-md-8" id="nombre" /><br/>
			
					<button className="btn btn-primary" onClick={this.guardar_doctor}>Guardar</button>
				   </div>);


		}








}

export default DoctorFormulario;