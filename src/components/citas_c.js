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
			<>
				<style>{`
					@keyframes fadeIn {
						from { opacity: 0; transform: translateY(10px); }
						to { opacity: 1; transform: translateY(0); }
					}
					@keyframes slideUp {
						from { opacity: 0; transform: translateY(20px); }
						to { opacity: 1; transform: translateY(0); }
					}
				`}</style>
				<div className="col-12 col-md-10" style={{ 
					backgroundColor: '#f5f5f7',
					minHeight: '100vh',
					padding: '15px',
					borderRadius: '16px'
				}}>
					{/* Header principal */}
					<div className="card border-0 shadow-lg mb-4" style={{ 
						borderRadius: '16px',
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						overflow: 'hidden',
						animation: 'fadeIn 0.5s ease'
					}}>
						<div className="card-body text-white p-4">
							<div className="d-flex align-items-center">
								<div style={{
									width: '60px',
									height: '60px',
									borderRadius: '15px',
									background: 'rgba(255,255,255,0.2)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									marginRight: '20px',
									fontSize: '28px'
								}}>
									<i className="fas fa-users"></i>
								</div>
								<div>
									<h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
										Gestión de Pacientes
									</h2>
									<p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
										Administra y busca pacientes del sistema
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Estadísticas */}
					<div className="row mb-4" id="panel" style={{ animation: 'slideUp 0.6s ease' }}>
						<div className="col-12 col-md-4 mb-3">
							<div className="card border-0 shadow-sm" style={{
								borderRadius: '16px',
								background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								overflow: 'hidden',
								transition: 'all 0.3s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
							}}
							>
								<div className="card-body text-white p-4">
									<div className="d-flex align-items-center">
										<div style={{
											width: '50px',
											height: '50px',
											borderRadius: '12px',
											background: 'rgba(255,255,255,0.2)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginRight: '15px',
											fontSize: '24px'
										}}>
											<i className="fas fa-user-friends"></i>
										</div>
										<div>
											<p className="mb-1" style={{ fontSize: '14px', opacity: 0.9, fontWeight: 500 }}>
												{Url.lenguaje.citas_c.cantidad_de_pacientes}
											</p>
											<h3 className="mb-0" style={{ fontSize: '32px', fontWeight: 700 }}>
												{this.state.cantidad_de_pacientes}
											</h3>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-12 col-md-4 mb-3">
							<div className="card border-0 shadow-sm" style={{
								borderRadius: '16px',
								background: 'linear-gradient(135deg, #51d18a 0%, #3db870 100%)',
								overflow: 'hidden',
								transition: 'all 0.3s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 8px 24px rgba(81, 209, 138, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
							}}
							>
								<div className="card-body text-white p-4">
									<div className="d-flex align-items-center">
										<div style={{
											width: '50px',
											height: '50px',
											borderRadius: '12px',
											background: 'rgba(255,255,255,0.2)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginRight: '15px',
											fontSize: '24px'
										}}>
											<i className="fas fa-procedures"></i>
										</div>
										<div>
											<p className="mb-1" style={{ fontSize: '14px', opacity: 0.9, fontWeight: 500 }}>
												{Url.lenguaje.citas_c.cantidad_de_procedimiento}
											</p>
											<h3 className="mb-0" style={{ fontSize: '32px', fontWeight: 700 }}>
												{this.state.procedimientos_hechos}
											</h3>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-12 col-md-4 mb-3">
							<div className="card border-0 shadow-sm" style={{
								borderRadius: '16px',
								background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
								overflow: 'hidden',
								transition: 'all 0.3s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 8px 24px rgba(28, 28, 30, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
							}}
							>
								<div className="card-body text-white p-4">
									<div className="d-flex align-items-center">
										<div style={{
											width: '50px',
											height: '50px',
											borderRadius: '12px',
											background: 'rgba(255,255,255,0.2)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginRight: '15px',
											fontSize: '24px'
										}}>
											<i className="fas fa-calendar-day"></i>
										</div>
										<div>
											<p className="mb-1" style={{ fontSize: '14px', opacity: 0.9, fontWeight: 500 }}>
												{Url.lenguaje.citas_c.hoy_es}
											</p>
											<h6 className="mb-0" style={{ fontSize: '16px', fontWeight: 600 }}>
												{this.dia_actual()}
											</h6>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Barra de búsqueda */}
					<div className="card border-0 shadow-sm mb-4" style={{ 
						borderRadius: '16px',
						overflow: 'hidden',
						animation: 'slideUp 0.7s ease'
					}}>
						<div className="card-body p-4">
							<div className="input-group">
								<span className="input-group-text" style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									color: 'white',
									border: 'none',
									borderRadius: '12px 0 0 12px',
									padding: '14px 20px',
									fontSize: '18px'
								}}>
									<i className="fas fa-search"></i>
								</span>
								<input 
									type="text" 
									placeholder={Url.lenguaje.citas_c.buscar_paciente}  
									className="form-control" 
									id="buscar_paciente" 
									onChange={this.buscarPaciente}
									style={{
										borderRadius: '0 12px 12px 0',
										border: '2px solid #e0e0e0',
										borderLeft: 'none',
										padding: '14px 16px',
										fontSize: '15px',
										minHeight: '50px',
										transition: 'all 0.2s ease'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#1c1c1e';
										e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>
						</div>
					</div>
					{/* Tabla de pacientes */}
					<div className="card border-0 shadow-sm" style={{ 
						borderRadius: '16px',
						overflow: 'hidden',
						animation: 'slideUp 0.8s ease'
					}}>
						<div className="table-responsive">
							<table className='table table-hover mb-0'>
								<thead style={{
									background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
									borderBottom: '2px solid #e0e0e0'
								}}>
									<tr>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none'
										}}>{Url.lenguaje.citas_c.nombre}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none'
										}}>{Url.lenguaje.citas_c.apellido}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none'
										}}>{Url.lenguaje.citas_c.doctor}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none'
										}}>{Url.lenguaje.citas_c.cedula}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none'
										}}>{Url.lenguaje.citas_c.telefono}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none',
											textAlign: 'right'
										}}>{Url.lenguaje.citas_c.deuda}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none',
											textAlign: 'center'
										}}>{Url.lenguaje.citas_c.ver_perfil}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none',
											textAlign: 'center'
										}}>{Url.lenguaje.citas_c.asigar_cita}</th>
										<th style={{ 
											fontWeight: 600, 
											fontSize: '13px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
											color: '#495057',
											padding: '15px 20px',
											border: 'none',
											textAlign: 'center'
										}}>{Url.lenguaje.citas_c.actualizar}</th>
									</tr>
								</thead>
								<tbody>
									{
									this.state.clientes.map((data, index) => (
										<tr 
											key={data.id || index}
											style={{
												transition: 'all 0.2s ease',
												borderBottom: '1px solid #f0f0f0'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = '#f8f9fa';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = 'white';
											}}
										>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.nombre || ''}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.apellido|| ''}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.doctor.nombre|| ''} {data.doctor.apellido|| ''}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.cedula|| ''}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.telefono || ''}</td> 
											<td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
												<span 
													className="badge"
													style={{
														background: data.estatus_precio_estatus_sum > 0 
															? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
															: 'linear-gradient(135deg, #51d18a 0%, #3db870 100%)',
														color: 'white',
														padding: '8px 16px',
														borderRadius: '8px',
														fontWeight: 600,
														fontSize: '14px',
														boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
													}}
												>
													${new Intl.NumberFormat().format(data.estatus_precio_estatus_sum || 0)}
												</span>
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
												<a 
													href={`/perfil_paciente/${data.id}/${data.id_doctor}`}
													style={{ 
														display: 'inline-block',
														padding: '8px 12px',
														borderRadius: '8px',
														background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
														color: 'white',
														transition: 'all 0.2s ease',
														textDecoration: 'none'
													}}
													onMouseEnter={(e) => {
														e.target.style.transform = 'scale(1.1)';
														e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
													}}
													onMouseLeave={(e) => {
														e.target.style.transform = 'scale(1)';
														e.target.style.boxShadow = 'none';
													}}
												>
													<i className="fa-solid fa-user-circle" style={{ fontSize: '18px' }} />
												</a>
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
												<button
													className="btn"
													onClick={() => this.asignar_cita(data.id, data.nombre)}
													style={{
														background: 'linear-gradient(135deg, #51d18a 0%, #3db870 100%)',
														color: 'white',
														border: 'none',
														borderRadius: '8px',
														padding: '8px 12px',
														fontSize: '18px',
														transition: 'all 0.2s ease',
														cursor: 'pointer'
													}}
													onMouseEnter={(e) => {
														e.target.style.transform = 'scale(1.1)';
														e.target.style.boxShadow = '0 4px 12px rgba(81, 209, 138, 0.4)';
													}}
													onMouseLeave={(e) => {
														e.target.style.transform = 'scale(1)';
														e.target.style.boxShadow = 'none';
													}}
												>
													<i className="fa-solid fa-calendar-plus" />
												</button>
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
												<a 
													href={`/actualizar_paciente/${data.id}`}
													style={{ 
														display: 'inline-block',
														padding: '8px 12px',
														borderRadius: '8px',
														background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
														color: 'white',
														transition: 'all 0.2s ease',
														textDecoration: 'none'
													}}
													onMouseEnter={(e) => {
														e.target.style.transform = 'scale(1.1)';
														e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.4)';
													}}
													onMouseLeave={(e) => {
														e.target.style.transform = 'scale(1)';
														e.target.style.boxShadow = 'none';
													}}
												>
													<i className="fa-solid fa-pen-to-square" style={{ fontSize: '18px' }} />
												</a>
											</td>
										</tr>
									))
									}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</>
		);


	}


}

export default Cita;