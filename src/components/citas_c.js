import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import '../css/bootstrap.css';
import '../css/dashboard.css';
import Logo from '../logo.jpg';
import Loading from '../loading.gif';
import PerfilPaciente from './perfil_paciente';
import AgregarCita from './agregar_cita';
import Url from './funciones_extras';
import ActualizarPerfil from './actualizar_paciente';
import ImgPerfil from '../usuario.png';
import ImgAsignar from '../asignar.png';
import ImgActualizar from '../actualizar.png'
import alertify from 'alertifyjs';
import { Doughnut,Bar} from 'react-chartjs-2';



class  Cita extends React.Component{

	constructor(props){
		super(props);
		this.id_paciente=0;
		this.state ={perfil_selec:false,
					id_doctor:0,
					nombre_paciente:"",
					procedimientos_hechos:0,
					foto_paciente:"",
					clientes:[
						  
					    ],
						id_paciente:0,
						estado_busqueda:"paciente_por_nombre",
						generos:[{hombres:0},{mujeres:0}],
						cantidad_de_pacientes:0,
						meses:new Array ("enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre")
						
					};
	}
	




	componentDidMount(){
		
		this.cargar_citas();
		//this.Cargar_generos_paciente();
		this.Procedimientos_realizados();
		this.cargar_cantidad_de_pacientes();
	}
	
	dia_actual(){

		var f=new Date();
		var dia="";
		dia= f.getDate() + " de " + this.state.meses[f.getMonth()] + " de " + f.getFullYear();
		return dia;
	}


	 Cargar_generos_paciente=()=>{
    

    
			Axios.get(`${Url.url_base}/api/cargar_generos_pacientes`).then(data=>{
				this.setState({generos:data.data});
				
			}).catch(error=>{

					console.log("error cargando genero de pacientes");
			});


	}

	Procedimientos_realizados=()=>{

		Axios.get(`${Url.url_base}/api/procedimientos_realizados`).then(data=>{

			this.setState({
				procedimientos_hechos:data.data
				
			});

		}).catch(error=>{

			alertify.message("UPS error cargando procedimientos realizados");
		});	


	}


	CheckSeleccion=()=>{

		let busqueda = document.getElementById("select_busqueda").value;
		
	
		if(busqueda=="paciente_por_nombre"){

			alertify.message("Has seleccionado búsqueda por nombre");
			this.setState({estado_busqueda:"paciente_por_nombre"});


		}else if(busqueda=="paciente_por_telefono"){
			
			alertify.message("Has seleccionado búsqueda por teléfono");
			this.setState({estado_busqueda:"paciente_por_telefono"});

		}else if(busqueda=="paciente_por_procedimiento"){

			alertify.message("Has seleccionado búsqueda por procedimiento");
			this.setState({estado_busqueda:"paciente_por_procedimiento"});

		}else if(busqueda=="paciente_por_apellido"){

			alertify.message("Has seleccionado búsqueda por apellido");
			this.setState({estado_busqueda:"paciente_por_apellido"});
		
		}else{

			alertify.message("Has seleccionado búsqueda por cedula");
			this.setState({estado_busqueda:"paciente_por_cedula"});

		}

		

	}


	 cargar_citas()
	{
		

		let config = {
			headers: {
			  'Authorization': 'Bearer '+localStorage.getItem('token'),
			  'content-type': 'application/json'
			}
		  }

		 Axios.get(`${Url.url_base}/api/paciente`)
		  .then(res => {
			 // console.log(res.data);
			 this.setState({clientes:res.data});
			// console.log(this.state.clientes);


		  }).catch(error=>{

				console.log(error);
				this.cargar_citas();
		  });				
	}

	asignar_cita=(id,nombre)=>{

		this.setState({perfil_selec:'agregar_citas',id_cliente:id,nombre_paciente:nombre});
	}


	cargar_cantidad_de_pacientes=()=>{


		
		Axios.get(`${Url.url_base}/api/cantidad_de_pacientes`).then(data=>{

			this.setState({cantidad_de_pacientes:data.data.cantidad_pacientes});
			//console.log(data.data.cantidad_pacientes);
		
		}).catch(erro=>{

			alertify.message("Error cargando cantidad de pacientes");
		});

	}

	buscarPaciente=(e)=>{
		
		/*/if(e.target.value!==""){
			
			document.querySelector("#panel").setAttribute("style","display:none");
		
		}else{
			
		//	document.querySelector("#panel").setAttribute("style","display:in-line");

		}*/

		Axios.get(`${Url.url_base}/api/buscar_paciente/${e.target.value}`).then(data=>{

			//preprando data para que no explote en el cliente cuando se este buscando un paciente y no tenga doctor

			let elementos_nuevos =[];

			data.data.forEach(paciente => {
			
				
					if(paciente.doctor==null){

						paciente.doctor =  {
							id: 1,
							nombre: "No tiene",
							apellido: "doctor registrado",
							dni: "000-00000-0",
							numero_telefono: "000,000,000",
							created_at: "2022-09-06 13:48:48",
							updated_at: "2022-09-06 13:48:48",
							}
							
							elementos_nuevos.push(paciente);

					}else{

						elementos_nuevos.push(paciente);

					}

				
			});
			
			this.setState({clientes:elementos_nuevos});
			
			//this.setState({clientes:data.data});

		}).catch(error=>{
				console.log(error);
		});


	}

	cargar=(id,id_doct,foto_paciente)=>{


				this.setState({perfil_selec:true,id_cliente:id,id_doctor:id_doct,foto_paciente:foto_paciente});

	}

	actualizar_paciente(id){

		this.setState({perfil_selec:'actualizar_paciente',id_paciente:id});
	}

	leer_deuda(deuda){

		
		if(deuda>0){
			
			return {color:"#ef0808"}
		
		}else{

			return {color:"#6096e6"}

		}

		
	}


	render(){
		//let cargar_deudas =<td id={"interfaz"+data.id}>Url.Consultar_deuda_de_paciente(data.id)</td>;


		if(this.state.perfil_selec==true){

				return <PerfilPaciente id_paciente={this.state.id_cliente} IdDoctor={this.state.id_doctor} foto_paciente={this.state.foto_paciente} />;

		}else if(this.state.perfil_selec=="agregar_citas"){

			return <AgregarCita paciente={this.state.nombre_paciente} id_paciente={this.state.id_cliente}/>;

		}else if(this.state.clientes==""){
		
				console.log("no hay resultados de este paciente");

		}else if(this.state.perfil_selec=="actualizar_paciente"){

				return <ActualizarPerfil IdPaciente={this.state.id_paciente}/>;
		}
		const data = {
			labels: ['Hombres', 'Mujeres'],
			datasets: [
			  {
				label: 'Detalles de pacientes',
				fill: false,
				lineTension: 0.1,
				backgroundColor: [
					'#46a9ff',
					'#ffd7fe'
				],
				borderColor: '#5b5b5b',
				borderCapStyle: 'butt',
				borderDash: [],
				borderDashOffset: 0.0,
				borderJoinStyle: 'miter',
				pointBorderColor: 'rgba(75,192,192,1)',
				pointBackgroundColor: '#fff',
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: 'rgba(75,192,192,1)',
				pointHoverBorderColor: 'rgba(220,220,220,1)',
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: [this.state.generos[0].hombres,this.state.generos[1].mujeres]
			  }
			]
		  };


		return (
				<div className="col-md-10"><br/><br/>
				<div className="row" id="panel">
					<div className="col-md-10">
					<table className="table">
						<tr>
						<td>{Url.lenguaje.citas_c.cantidad_de_pacientes}</td>
						<td style={{ color: 'rgb(142 141 255)' }}>{this.state.cantidad_de_pacientes}</td>
						<td>{Url.lenguaje.citas_c.cantidad_de_procedimiento}</td>
						<td style={{ color: '#51d18a' }}>{this.state.procedimientos_hechos}</td>	
						<td style={{ color: 'black' }}>{Url.lenguaje.citas_c.hoy_es}  {this.dia_actual()}</td>	
						</tr>
					</table>
					</div>
				</div>
				<hr />
				
				<input type="text" placeholder={Url.lenguaje.citas_c.buscar_paciente}  className="form-control" id="buscar_paciente" onChange={this.buscarPaciente} />
				
				<hr />
				<div className="interfaz_cliente">
					<table className='table table-hover'>
					<thead>
						<tr className="fijar_columnas">
						<th scope="col">{Url.lenguaje.citas_c.nombre }</th>
						<th scope="col">{Url.lenguaje.citas_c.apellido} </th>
						<th scope="col">{Url.lenguaje.citas_c.doctor} </th>
						<th scope="col">{Url.lenguaje.citas_c.cedula} </th>
						<th scope="col">{Url.lenguaje.citas_c.telefono} </th>
						<th scope="col">{Url.lenguaje.citas_c.deuda} </th> 
						<th scope="col">{Url.lenguaje.citas_c.ver_perfil} </th>
						<th scope="col">{Url.lenguaje.citas_c.asigar_cita} </th>
						<th scope="col">{Url.lenguaje.citas_c.actualizar} </th>
						</tr>
					</thead>
					<tbody>
						{
						this.state.clientes.map(data => (
							<tr key={data.id || ''}>
							<td>{data.nombre || ''}</td>
							<td>{data.apellido|| ''}</td>
							<td>{data.doctor.nombre|| ''} {data.doctor.apellido|| ''}</td>
							<td>{data.cedula|| ''}</td>
							<td>{data.telefono || ''}</td> 
							<td>
								<p style={this.leer_deuda(data.estatus_precio_estatus_sum)}>
								${new Intl.NumberFormat().format(data.estatus_precio_estatus_sum)}
								</p>
							</td>
							<td>
								 <a href={`/perfil_paciente/${data.id}/${data.id_doctor}`}>
								<i className="fa-solid fa-user-circle" style={{ cursor: 'pointer', fontSize: '20px', color: 'black' }} />
								</a>

							</td>
							<td>
								<i 
								className="fa-solid fa-calendar-plus" 
								style={{ cursor: 'pointer', fontSize: '20px', color: '#black' }} 
								onClick={() => this.asignar_cita(data.id, data.nombre)}
								></i>
							</td>
						<td>
							<a href={`/actualizar_paciente/${data.id}`} style={{ marginRight: '10px', color: 'black' }}>
								<i className="fa-solid fa-pen-to-square" style={{ cursor: 'pointer', fontSize: '20px' }}></i>
							</a>
							
						</td>
					</tr>
						))
						}
					</tbody>
					</table>
				</div>
				</div>
				);


	}


}

export default Cita;