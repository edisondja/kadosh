import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import ReactToast from 'react-toasts';
import { BrowserRouter, Route} from "react-router-dom";


class ActualizarDoctor extends React.Component{

    constructor(props){
            super(props);
            this.estate = {doctor:{nombre:"David",apellido:"Gonzales",telefono:"809-565-1484",dni:"455-5515-25"}}
            this.editando_campo = this.editando_campo.bind(this);
    }
            
    componentDidMount(){

        this.cargar_doctor(this.props.id);
    }

    cargar_doctor=(id)=>{

        Axios.get(`http://localhost:8000/api/cargar_doctor/${id}`).then(data=>{

            this.setState({doctor:data.data});

        }).catch(error=>{

            console.log(error);

        });

    }

    editando_campo(e){

        if(e.target.id=="nombre"){
            
            this.setState({nombre:e.target.value});

        }else if(e.target.id=="apellido"){

            this.setState({apellido:e.target.value});

        }else if(e.target.id=="telefo"){  

            this.setState({telefono:e.target.value});

        }else if(e.target.id=="dni"){

             this.setState({dni:e.target.value});
        }

    }

    actualizar_doctor(){

        Axios.get(`http://localhost:8000/api/actualizar_doctor/${this.state.doctor.nombre}/${this.state.doctor.apellido}/${this.state.doctor.cedula}/${this.state.doctor.telefono}/${this.state.doctor.id}`).then(data=>{

            alert(data);

        }).catch(error=>{

            console.log(error);

        });

    }

    render(){

        return(
            <div>
                <div> <br/><br/>
                    <h2>Actualizar doctor</h2>
                    <strong>Nombre</strong><br/>
                    <input type="text" value="" id="nombre" onChange={this.editando_campo}  value={this.estate.doctor.nombre}  defaultValue={this.estate.doctor.nombre} className="form-control"/><br/>
                    <strong>Apellido</strong><br/>
                    <input type="text" value="" id="apellido"  onChange={this.editando_campo}  value={this.estate.doctor.apellido}  defaultValue={this.estate.doctor.apellido} className="form-control" /><br/> 
                    <strong>TELEFONO</strong><br/>
                    <input type="text" value="" id="telefono"  onChange={this.editando_campo}  value={this.estate.doctor.telefono}  defaultValue={this.estate.doctor.telefono} className="form-control" /><br/> 
                    <strong>DNI</strong><br/>
                    <input type="text" value="" id="dni"  onChange={this.editando_campo} className="form-control"/><br/> 
                    <button className="btn btn-success" onClick={this.actualizar_doctor}>Actualizar</button>
                </div>
            </div>  
        );      

    }



}

export default ActualizarDoctor;