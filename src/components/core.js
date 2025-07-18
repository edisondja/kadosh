import React from 'react';
import ReactDOM from 'react-dom';
import '../css/bootstrap.min.css';
import Login  from './login'


class Core extends React.Component{


	constructor(props){
		super(props);
		this.state = {data:"vacia",LoginStado:false}
	}

	componentDidMount(){

	}

	xs(){

		alert("hola");
	}


	render(){
	
		return (
				<Login/>
		
			    );



	}


}

export default Core;