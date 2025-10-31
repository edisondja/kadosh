import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import BuscarProcedimiento from './buscando_procedimiento';
import core from './funciones_extras';
class ProcedimientoForm extends React.Component{


		constructor(props){
			super(props);
				this.state= {estado:true,boton_estado:false};

		}

		guardar_datos=()=>{
			var nombre = document.getElementById("nombre_procedimiento").value;
			var precio = document.getElementById("precio").value;


			Axios.post(`${core.url_base}/api/guardar_procedimiento`,
				{nombre:nombre,precio:precio}
			).then(data=>{

					alertify.message("Procedimiento guardado con exito");
					this.setState({boton_estado:true});
					setInterval(()=>{
						this.setState({boton_estado:false});
							document.getElementById("nombre_procedimiento").value="";
							document.getElementById("precio").value="";
						
					},3000);
					this.setState({estado:'saved_success'});

			}).catch(error=>{

				alertify.error("No se pudo guardar el procedimiento");

			});


		}


		render(){
	
			return (<div className="col-md-10 mx-auto mt-4"><hr/>
						<div className="card shadow border-0 rounded-4 p-4">
							<h3 className="text-primary mb-4">
							<i className="fas fa-plus-circle me-2"></i> Agregar Procedimiento
							</h3>

							<div className="mb-3">
							<label htmlFor="nombre_procedimiento" className="form-label fw-semibold">
								<i className="fas fa-file-signature me-2"></i>Nombre
							</label>
							<input 
								type="text" 
								className="form-control rounded-pill px-4" 
								id="nombre_procedimiento" 
								placeholder="Ej. Limpieza dental"
							/>
							</div>

							<div className="mb-4">
							<label htmlFor="precio" className="form-label fw-semibold">
								<i className="fas fa-dollar-sign me-2"></i>Precio
							</label>
							<input 
								type="number" 
								className="form-control rounded-pill px-4" 
								id="precio" 
								placeholder="Ej. 1200"
							/>
							</div>
							<div style={{ textAlign: 'center' }}>
							<button 
								className="btn btn-primary w-50 rounded-pill fw-semibold" 
								disabled={this.state.boton_estado} 
								onClick={this.guardar_datos}
							>
								<i className="fas fa-save me-2"></i>Guardar
							</button>
							</div>
														
						</div>

						<div className="mt-4">
							<BuscarProcedimiento />
						</div>
						</div>
						);

		}



}

export default ProcedimientoForm;