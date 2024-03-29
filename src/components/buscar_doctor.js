import React from 'react';
import ReactDOM from 'react-dom';
import '../css/dashboard.css';
import Axios from 'axios';
import ActualizarDoctor from './actualizando_doctor';
import { BrowserRouter, Route} from 'react-router-dom';
import cargar_doctores from './funciones_extras';

import alertify from 'alertifyjs';

const estilo_botones = {

	marginLeft:'75%',
	marginTop:'5px'
}



class BuscarDoctor extends React.Component{

		constructor(props){
				super(props);
				this.state= {estado:true,doctores:[{nombre:"Alex"},{nombre:"Noelia"},{nombre:"Naiel"}],opcion:null,id_select:0};
		}

		
		componentDidMount(){

				cargar_doctores.cargar_doctores(this);
		}

		buscar_doctor=(e)=>{

			var nombre_doctor =  e.target.value;
			
			Axios.get(`${cargar_doctores.url_base}/api/buscando_doctor/${nombre_doctor}`).then(data=>{
					
						this.setState({doctores:data.data});		
			});
		}	

		cargar_doctores(){
				Axios.get(`${cargar_doctores.url_base}/api/doctores`).then(data=>{

					this.setState({doctores:data.data})

				}).catch(error=>{

					console.log(error);

				})


		}

		actualizar_doctor=(id)=>{

			this.setState({opcion:"actualizar_doctor",id_select:id});
		

		}

		eliminar_doctor(id){

			alertify.confirm("Seguro que deseas eliminar este doctor?",function(){

				Axios.get(`${cargar_doctores.url_base}/api/eliminar_doctor/${id}`).then(data=>{

					alertify.message("Registro borrado con exito");

				}).catch(error=>{
					
					alertify.error("No se pudo eliminar este doctor");
				})


			},function(){

			});

		}

		render(){


			if(this.state.opcion=="actualizar_doctor"){

				return  <ActualizarDoctor id_doctor={this.state.id_select}/>;
			}
			return (<div className="col-md-8"><br/>
					<h1>Bucando doctor</h1>
					<input type="text" className="form-control" onChange={this.buscar_doctor} id="doctor_nombre"/><br/>
					<div className="buscar_doctor">
						{this.state.doctores.map(data=>(
								<div><br/>
									<div class="card">
										
										<div class="card-body"><hr/><strong>{data.nombre} {data.apellido}</strong><hr/>
												<div style={estilo_botones}>
													<button class="btn btn-primary" onClick={()=>this.actualizar_doctor(data.id)}>Actualizar</button>
													<button class="btn btn-secondary" onClick={()=>this.eliminar_doctor(data.id)} style={{marginLeft:5}}>Eliminar</button>	
											    </div>
										</div> 
									</div>
								
								</div>
						))}
						</div>
				
					</div>
					);


		}



}

export default BuscarDoctor;