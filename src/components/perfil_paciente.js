import React from 'react';
import ReactDOM from 'react-dom';



class PerfilPaciente extends React.Component{

		constructor(props){
			super(props);
			this.state= {nombre:null,apellido:null};


		}
		componentDidMount(){

			alert(this.props.id_paciente);
		}
		render(){

				return (<div className="col-md-8">
							<strong>Componente insertado</strong>
								{this.props.id}						
						</div>);
		}










}

export default PerfilPaciente;