import React from 'react';
import ReactDom from 'react-dom';
import Logo from  '../logo.jpg';
import Dashboard from './dashboard';
import Verificar from './funciones_extras';
import Axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import alertify from 'alertifyjs';

class Login extends React.Component{

		constructor(props){
			super(props);
			this.state= {login:Verificar.login_status,mensaje:" entre a la administracion",pacientes:[{n:" Se "},{n:" SS "}]};
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
				if(data.data!=""){
					this.setState({login:true});
					this.setState({mensaje:" Creedenciales correcto"});
					this.color_notifiacion={color:"green"}
					localStorage.setItem('login', data.data.nombre+" "+data.data.apellido);
					localStorage.setItem('token',data.data.token);
					localStorage.setItem('roll',data.data.roll);


					//alert(data.data.token);

				}
			}).catch(error=>{
				this.setState({mensaje:" usuario y Contraseña no validos"});
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
						   <img src={Logo} width="110" style={this.logo_stilo}  /><br/> 
							<storng>Usuario</storng><br/>
							<input type='text' placeholder="&#9670; Usuario" className="form-control" id="usuario" /><br/>
							<storng className="padding_text">Contraseña</storng><br/>
							<input type='password' placeholder="&#9673; Clave" className="form-control" id="clave" /><br/>
							<button className="btn btn-primary boton_login" onClick={this.iniciar_sesion} id="boton_login">Login</button>
							<hr/>
							 <p>Copyright © 2020 Clinica Kadosh. All Rights Reserved.</p>
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