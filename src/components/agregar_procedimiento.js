import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';

class ProcedimientoForm extends React.Component{


		constructor(props){
			super(props);
				this.state= {estado:true};

		}

		guardar_datos=()=>{




		}


		render(){

			return (<div className="col-md-8">
					    <br/><h1>Agregar Procedimiento</h1><br/>
						<strong>Nombre</strong><br/>
						<input type="text" className="form-control"/><br/>
						<strong>Precio</strong><br/>
						<input type="text" className="form-control"/><br/>
						<button className="btn btn-primary" onClick={this.guardar_datos()}>Guardar</button>
					</div>);

		}



}

export default ProcedimientoForm;