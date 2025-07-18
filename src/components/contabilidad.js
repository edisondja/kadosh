import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Cadena from '../cadena.png';
import Money from '../cash.png';
import Products from '../products.png';
import Gastos from './gastos';
import Suplidor from './suplidores';
import Nomina from '../cartera.png'
import Nominas from './nomina';
import { Router, Route, Switch } from "react-router";

class Contabilidad extends React.Component{

    
    constructor(props){
        super(props);
        this.state={opciones:'suplidor'}
        
    }


    componentDidMount(){

    }


    selectMenu=(opcion)=>{

        this.setState(
            {opciones:opcion}            
        );
    

    }


    


    render(){

                    /*<Gastos/>
                    <Suplidor imagen={Cadena} />*/
        let ver2; 
        if(this.state.opciones=='suplidor'){
            ver2 =  <Suplidor/>;
        }else if(this.state.opciones=='gastos'){
            ver2 =  <Gastos/>; 
        
        }else{

            Alertify.message("Este complemento esta desactivado");
        }

        return(
               <div className="col-md-10 mac-style-container">
                    <br /><br /><hr />
                    <h4>Administración Financiera</h4>
                 <ul className="menuStilos menu_contabilidad">
                    <li onClick={(e) => this.selectMenu('suplidor')}>
                        <i className="fas fa-link fa-2x" style={{ color: '#555' }}></i>
                        <span>Suplidores</span>
                    </li>
                    <li onClick={(e) => this.selectMenu('gastos')}>
                        <i className="fas fa-coins fa-2x" style={{ color: '#555' }}></i>
                        <span>Gastos</span>
                    </li>
                    <li onClick={(e) => this.selectMenu('')}>
                        <i className="fas fa-box-open fa-2x" style={{ color: '#555' }}></i>
                        <span>Registrar productos</span>
                    </li>
                    <li onClick={(e) => this.selectMenu('')}>
                        <i className="fas fa-user-plus fa-2x" style={{ color: '#555' }}></i>
                        <span>Registrar Empleado</span>
                    </li>
                    <li onClick={(e) => this.selectMenu('ver_productos')}>
                        <i className="fas fa-warehouse fa-2x" style={{ color: '#555' }}></i>
                        <span>Ver productos</span>
                    </li>
                    </ul>   
                    {ver2}
    
                    <div></div>
                    <hr/>
                    </div>

                                
            );
  
    }






}

export default Contabilidad;