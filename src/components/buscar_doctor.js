import React from 'react';
import ReactDOM from 'react-dom';
import '../css/dashboard.css';
import Axios from 'axios';
import ActualizarDoctor from './actualizando_doctor';
import { BrowserRouter, Route} from 'react-router-dom';

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

			this.cargar_doctores();
		}

		buscar_doctor=(e)=>{

			var nombre_doctor =  e.target.value;
			
			Axios.get(`http://localhost:8000/api/buscando_doctor/${nombre_doctor}`).then(data=>{
					
						this.setState({doctores:data.data});		
			});
		}	

		cargar_doctores(){
				Axios.get("http://localhost:8000/api/doctores").then(data=>{

					this.setState({doctores:data.data})

				}).catch(error=>{

					console.log(error);

				})


		}

		actualizar_doctor=(id)=>{

			this.setState({opcion:"actualizar_doctor",id_select:id});
		

		}

		eliminar_doctor(id){

				Axios.get(`https://api/eliminar_doctor/${id}`).then(data=>{

						console.log(data.json());
				});

		}

		render(){


			if(this.state.opcion=="actualizar_doctor"){

				return  <ActualizarDoctor nombre={this.state.id_select}/>;
			}
			return (<div className="col-md-8"><br/>
					<h1>Bucando doctor</h1>
					<input type="text" className="form-control" onChange={this.buscar_doctor} id="doctor_nombre"/><br/>
					<div className="buscar_doctor">
						{this.state.doctores.map(data=>(
								<div><br/>
									<div class="card">
									<div class="card-header"><strong>{data.nombre}</strong></div>
									<div class="card-body"><p>Doctores Registrados</p></div> 
									<div class="card-footer"></div>
									</div>
									<div style={estilo_botones}>
											<button class="btn btn-primary" onClick={()=>this.actualizar_doctor(data.id)}>Actualizar</button>
								  			<button class="btn btn-secondary" style={{marginLeft:5}}>Eliminar</button>	
									</div>
									
								</div>
						))}
						</div>
				
					</div>
					);


		}



}

export default BuscarDoctor;