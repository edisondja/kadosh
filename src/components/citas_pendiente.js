import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import Notacion from '../cuaderno.png';

class CitaPendiente extends React.Component{


        constructor(props){
            super(props);
            this.state= {
                citas:[]
            }
        }
        
        componentDidMount(){
            this.cargar_citas();
        }

        cargar_citas=()=>{

            Axios.get(`${Core.url_base}/api/cargar_citas/`).then(data=>{
                    this.setState({citas:data.data});
                    console.log(data.data);
            }).catch(error=>{
                Alertify.message(error);
            });

        }

        render(){
            return (<div className="col-md-8">
            <br/><br/>
                <h3>Lista de  citas</h3><hr/>
                <div className="interfaz_reporte">
                <table className="table">
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Telefono</th>
                        <th>Dia</th>
                        <th>Hora</th>
                        <td></td>
                    </tr>
                    {
                        this.state.citas.map((data=>(
                          <tr>
                            <td>{data.nombre}</td>
                            <td>{data.apellido}</td>
                            <td>{data.telefono}</td>
                            <td>{data.dia}</td>
                            <td>{data.hora}</td>
                            <td><img src={Notacion}/></td>
                          </tr>

                        )))

                    }
    
                </table>
                </div>
                </div>);

        }




}

export default CitaPendiente;