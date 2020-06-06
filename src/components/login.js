import React from 'react';
import ReactDom from 'react-dom';
import Logo from  '../logo.jpg';
import Dashboard from './dashboard';
import Verificar from './funciones_extras';
import Axios from 'axios';
import { Doughnut } from 'react-chartjs-2';

class Login extends React.Component{

		constructor(props){
			super(props);
			this.state= {login:Verificar.login_status,mensaje:" entre a la administracion",pacientes:[{n:" Se "},{n:" SS "}]};
			this.color_notifiacion = {
					color:'blue'
			}
			this.logo_stilo ={
				marginLeft:'39%'
			}	


		}
		
		componentDidMount(){
			
		}

		iniciar_sesion=()=>{	
			let usuario = document.querySelector("#usuario").value;
			let clave = document.querySelector("#clave").value;

			Axios.get(`${Verificar.url_base}/api/login/${usuario}/${clave}`).then(data=>{
				if(data.data!=""){
					this.setState({login:true});
					this.setState({mensaje:" Creedenciales correcto"});
					this.color_notifiacion={color:"green"}
				}
			}).catch(error=>{
				this.setState({mensaje:" usuario y Contraseña no validos"});
				this.color_notifiacion={color:"red"}
			});

		
		}

		render(){
			let dashboard;
			if(this.state.login==true){

				dashboard=<Dashboard/>

			}else{	

					dashboard=<div className="row">
					<div className="col-md-3"></div>
						<div className="col-md-6"><br/><br/>
						<h2>Iniciar Sesion</h2> 
						   <img src={Logo} width="110" style={this.logo_stilo}  /><br/>
							<storng>Usuario</storng><br/>
							<input type='text' className="form-control" id="usuario" /><br/>
							<storng>Contraseña</storng><br/>
							<input type='password' className="form-control" id="clave" /><br/>
							<button className="btn btn-primary" onClick={this.iniciar_sesion}>Login</button>
							  <p style={this.color_notifiacion}>{this.state.mensaje}</p>
						</div>
						</div>
						;
					

			}


			return (dashboard);

		}





}

export default Login