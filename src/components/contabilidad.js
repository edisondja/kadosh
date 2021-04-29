import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Cadena from '../cadena.png';
import Money from '../cash.png';
import Products from '../products.png';
import Gastos from './gastos';
import Suplidor from './suplidores';
import Nomina from '../cartera.png'
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
            
            ver2 =<div><hr/><h2>Seleccione el complemento</h2></div>;
        }


        return(
               <div className="col-md-10"><br/><br/><hr/>
               <h4>Administración Financiera</h4>
             
                <ul  className="menuStilos" style={{listStyle:'none'}} >
                    
                        <li style={{ display:'inline'}} onClick={(e)=>this.selectMenu('suplidor')}><img src={Cadena} width="50" /><i>Suplidores</i></li>
                        <li style={{ display:'inline'}} onClick={(e)=>this.selectMenu('gastos')}><img src={Money} width="50" /><i>Gastos</i></li>
                        <li style={{ display:'inline'}} onClick={(e)=>this.selectMenu('registrar_productos')}><img src={Nomina} width="50" /> <i>Nominas</i></li>
                        <li style={{ display:'inline'}} onClick={(e)=>this.selectMenu('registrar_productos')}><img src={Products} width="50" /> <i>Registrar productos</i></li>
                        <li style={{ display:'inline'}} onClick={(e)=>this.selectMenu('registrar_productos')}><img src={Products} width="50" /> <i>Registrar Empleado</i></li>
                        <li style={{ display:'inline'}} onClick={(e)=>this.selectMenu('ver_productos')}><img src={Products} width="50" /> <i>Ver productos</i></li>
                </ul>
                {ver2}
                <div>

                </div>
                <hr/>
               </div>
            
            );
  
    }






}

export default Contabilidad;