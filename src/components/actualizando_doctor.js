import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import ReactToast from 'react-toasts';
import Alertify from 'alertifyjs';
import { BrowserRouter, Route} from "react-router-dom";


class ActualizarDoctor extends React.Component{

    constructor(props){
            super(props);
            this.state = {doctor:{nombre:"Edison",apellido:"De Jesus Abreu"}};
            this.editando_campo = this.editando_campo.bind(this);
    }
            
    componentDidMount(){

        this.cargar_doctor(this.props.id_doctor);
    }
0
    cargar_doctor=(id)=>{


        Axios.get(`http://localhost:8000/api/cargar_doctor/${id}`).then(data=>{

            this.setState({doctor:data.data});

        }).catch(error=>{

            Alertify.message(error);

        });

    }

    editando_campo(e){

        if(e.target.id=="nombre"){
            
            this.setState({doctor:{nombre:e.target.value}});

        }else if(e.target.id=="apellido"){

            this.setState({doctor:{apellido:e.target.value}});

        }else if(e.target.id=="telefono"){  

            this.setState({doctor:{telefono:e.target.value}});

        }else if(e.target.id=="dni"){

             this.setState({doctor:{dni:e.target.value}});
        }

    }

    actualizar_doctor=()=>{

        var nombre = document.getElementById("nombre").value;
        var apellido = document.getElementById("apellido").value;
        var telefono = document.getElementById("telefono").value;
        var dni = document.getElementById("dni").value;

        Axios.get(`http://localhost:8000/api/actualizar_doctor/${nombre}/${apellido}/${telefono}/${dni}/${this.props.id_doctor}`).then(data=>{

            Alertify.message(`Se actualizo correctamente`)

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
                    <input type="text" id="nombre" onChange={this.editando_campo}  value={this.state.doctor.nombre}  defaultValue={this.state.doctor.nombre} className="form-control"/><br/>
                    <strong>Apellido</strong><br/>
                    <input type="text" id="apellido"  onChange={this.editando_campo}  value={this.state.doctor.apellido}  defaultValue={this.state.doctor.apellido} className="form-control" /><br/> 
                    <strong>TELEFONO</strong><br/>
                    <input type="text"  id="telefono"  onChange={this.editando_campo}  value={this.state.doctor.numero_telefono}  defaultValue={this.state.doctor.numero_telefono} className="form-control" /><br/> 
                    <strong>DNI</strong><br/>
                    <input type="text" id="dni"  onChange={this.editando_campo} className="form-control" value={this.state.doctor.dni}/><br/> 
                    <button className="btn btn-success" onClick={this.actualizar_doctor}>Actualizar</button>
                </div>
            </div>  
        );      

    }



}

export default ActualizarDoctor;