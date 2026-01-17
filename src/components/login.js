import React from 'react';
import ReactDom from 'react-dom';
import Logo from  '../logos.jpg';
import Dashboard from './dashboard';
import Verificar from './funciones_extras';
import Axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import alertify from 'alertifyjs';

class Login extends React.Component{

		constructor(props){
			super(props);
			this.state= {login:Verificar.login_status,mensaje:" entre a la administracion",pacientes:[{n:" Se "},{n:" SS "}]
				
			};
			this.color_notifiacion = {
					color:'blue'
			}

			this.logo_stilo ={
				marginLeft:'35%'
			}

			


		}
		onKeyUp(event) {
			if (event.charCode === 13) {
				document.getElementById("boton_login").click();
			}
		}
		componentDidMount(){



			if (localStorage.getItem("login") === null) {

				this.setState({login:false});

				
		   	}else{

				this.setState({login:true});

			}
			
		}

		iniciar_sesion=()=>{	
			let usuario = document.querySelector("#usuario").value;
			let clave = document.querySelector("#clave").value;

			Axios.get(`${Verificar.url_base}/api/login/${usuario}/${clave}`).then(data=>{
				if(data.data && data.data.id && data.data.token){
					this.setState({login:true});
					this.setState({mensaje:" Credenciales correctas"});
					this.color_notifiacion={color:"green"}
					localStorage.setItem('login', data.data.nombre+" "+data.data.apellido);
					localStorage.setItem('id_usuario',data.data.id);
					localStorage.setItem('token',data.data.token);
					localStorage.setItem('roll',data.data.roll);
					if(data.data.tipo){
						localStorage.setItem('tipo_usuario',data.data.tipo);
					}
				} else {
					this.setState({mensaje:" Usuario y contraseña no válidos"});
					this.color_notifiacion={color:"red"}
					alertify.message("Usuario y contraseña no son correctos")
				}
			}).catch(error=>{
				this.setState({mensaje:" Usuario y contraseña no válidos"});
				this.color_notifiacion={color:"red"}
				alertify.message("Usuario y contraseña no son correctos")
			});

		
		}

		render(){
			let dashboard;
			if(this.state.login==true){

				dashboard=<Dashboard/>

			}else{	

					dashboard=<div className="row">
					<div className="col-md-4"></div>
					
						<div className="col-md-4 stilo_login"  onKeyPress={this.onKeyUp}><br/><br/>
						<img src={Verificar.Config.app_logo} width={Verificar.Config.logo_width_login} style={this.logo_stilo}  /><br/> 
							<strong>Usuario</strong><br/>
							<input type='text' placeholder="&#9670; Usuario" className="form-control" id="usuario" /><br/>
							<strong className="padding_text">Contraseña</strong><br/>
							<input type='password' placeholder="&#9673; Clave" className="form-control" id="clave" /><br/>
							<button className="btn btn-primary boton_login" onClick={this.iniciar_sesion} id="boton_login">Login</button>
							<hr/>
							 <p >{Verificar.Config.info_app} {Verificar.Config.website}</p>
					
						</div>
						<div>
						</div>
						</div>
						;
					

			}


			return (dashboard);

		}





}

export default Login