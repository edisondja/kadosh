import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import BuscarProcedimiento from './buscando_procedimiento';
import core from './funciones_extras';
class ProcedimientoForm extends React.Component{


		constructor(props){
			super(props);
				this.state= {estado:true};

		}

		guardar_datos(){
			var nombre = document.getElementById("nombre_procedimiento").value;
			var precio = document.getElementById("precio").value;

			Axios.get(`${core.url_base}/api/guardar_procedimiento/${nombre}/${precio}`).then(data=>{

					alertify.message("Procedimiento guardado con exito");
					document.getElementById("procedimiento").click();

			}).catch(error=>{

				alertify.error("No se pudo guardar el procedimiento");

			});


		}


		render(){

			return (<div className="col-md-8">
					    <br/><h1>Agregar Procedimiento</h1><br/>
						<strong>Nombre</strong><br/>
						<input type="text" className="form-control" id="nombre_procedimiento"/><br/>
						<strong>Precio</strong><br/>
						<input type="text" className="form-control" id="precio"/><br/>
						<button className="btn btn-primary" onClick={this.guardar_datos}>Guardar</button>
						<BuscarProcedimiento/>
					</div>);

		}



}

export default ProcedimientoForm;