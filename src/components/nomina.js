import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';


class Nomina extends React.Component{


     constructor(props){
         
        super(props);
        this.state = {nominas:[],data:[]}


     }

     componentDidMount(){

        this.cargar_nominas();
     }


     cargar_nominas=()=>{

        let fecha_i = document.getElementById("fecha_i").value;
        let fecha_f = document.getElementById("fecha_f").value;

        Axios.get(`${Core.url_base}/api/cargar_nomina/${fecha_i}/${fecha_f}`).then(data=>{

            console.log(data.data);
            this.setState({nominas:data.data})
        
        }).catch(error=>{

            Alertify.message("error no pudo cargar la nomina de los doctores....");

        });


     }


     render(){


        return(<div><hr/>
          <table>
                <tr className="table" border="1">
                    <td><strong>Fecha Inicial</strong></td>
                    <td><input type="date"  id="fecha_i" className="form-control"/></td>
                    <td><strong>Fecha Final</strong></td>
                    <td><input type="date"  id="fecha_f" className="form-control"/></td>
                    <td><button className="btn btn-primary" onClick={this.cargar_nominas}>Buscar</button></td>
                </tr>
            </table><hr/>
    
            <table className="table">
                <tr>
                    <td>Nombre</td>
                    <td>Apellido</td>
                    <td>Ganancias Clinica</td>
                    <td>Ganancias Doctor</td>
                    <td>Ingresos total</td>
                    <td>Recibos generados</td>
                </tr>
                {this.state.nominas.map(data=>(
                     
                     <tr>
                        <td>{data.nombre}</td>
                        <td>{data.apellido}</td>
                        <td>RD$ {new Intl.NumberFormat().format((data.monto*0.70))}</td>
                        <td>RD$ {new Intl.NumberFormat().format((data.monto*0.30))}</td>
                        <td> {new Intl.NumberFormat().format(data.monto)}</td> 
                        <td>{data.recibos}</td>
                    </tr>


                ))}


            </table>

        </div>)


     }


    

} 
export default Nomina;