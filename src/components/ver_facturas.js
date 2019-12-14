import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';

class VerFacturas extends React.Component{


    constructor(props){
            super(props);  
            this.state= {data:null,facturas:[]}
    }


    componentDidMount(){

        this.cargar_facturas(this.props.id_paciente);
    }

    cargar_facturas=(id_paciente)=>{
        Axios.get(`http://localhost:8000/api/cargar_facturas_paciente/${id_paciente}`).then(data=>{
            
            this.setState({facturas:data.data});
            Alertify.message("Facturas listas");
    
        }).catch(error=>{
            Alertify.error("Error al cargar facturas");
        });
    }

    render(){

    return (<div>
                <div className="card">
                <h1>Facturas de paciente {this.props.paciente}</h1><hr/>
                {
                    this.state.facturas.map((data=>(

                        <div className="card-body">
                                <button className="btn-primary">Ver Factura</button> <button className="btn-info">Eliminar</button> <button className="btn-success">Editar</button>    <strong>Total a pagar:</strong>RD${data.precio_estatus}<hr/>
                        </div>
                    )))
                    
                
                }
                </div>


            </div>);
    }



}

export default VerFacturas;