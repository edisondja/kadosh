import FuncionesExtras from './funciones_extras';
import Axios from 'axios';
import React from 'react';
import Alertify from 'alertifyjs';
import PerfilPaciente from './perfil_paciente';
import HDB from '../hbd.png';

class  Notificacion extends React.Component{


        constructor(props){
            super(props);
            this.state={data:"cxzczx",notificaciones:[],config:"",id_paciente:0};
        }
        
        componentDidMount(){

            FuncionesExtras.notificar_cumple(this);

        }
        
        notifiacion_leidas(id_notificacion){


        }

        enviar_correo(){


        }
        
        ver_paciente=(id)=>{

            this.setState({config:"ver_paciente",id_paciente:id});

        }
    
        render(){

            if(this.state.config=="ver_paciente"){
                    return <PerfilPaciente id_paciente={this.state.id_paciente}/>
            }

            return (
                    <div className="card col-md-8"><br/><br/>
                        <div className="card-title" style={{overflowY : 'auto'}}><h3>Notificaciones</h3></div>
                        {
                            this.state.notificaciones.map((data=>(

                                <div className="card-body">
                                    <p>Hoy esta de cumple Años <strong>{data.nombre} {data.apellido}</strong> Felicitalo! y demuestrale lo especial que es para la familia Kadoshor <img src={HDB} style={{float:'right'}} className="img-circle"/></p>
                                    <button className="btn btn-primary" onClick={()=>this.ver_paciente(data.id)}>Mas informacion</button>
                                    <hr/>
                                </div>


                            )))


                        }
                      
                   </div>
            );


        }


};

export default Notificacion;
