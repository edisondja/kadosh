import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import '../css/dashboard.css';
import  MenuDashBoard from './menudashboard';

class Dasboard extends React.Component{



		constructor(props){
			super(props);
			this.state = {test:true};
		
		}

		componentDidMount(){

		}


		render(){


				return (
							<MenuDashBoard/>
						);




		}






}

export default Dasboard;