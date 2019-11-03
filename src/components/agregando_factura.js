import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FacturaInterfaz from './factura_interfaz';

class  AgregarFactura extends React.Component{

    constructor(props){
        super(props);
        this.state= {procedimientos:[],total:0,lista_procedimiento:[]};
    }


    componentDidMount(){
        this.cargar_procedimientos();
    }

    agregarProcedimiento=(id,nombre,precio)=>{



       Alertify.prompt( 'Que cantidad de procedimientos quieres agregar?', 'Digite el numero de procedimientos de este tipo que quiere agregar', '1'
               ,(evt, value)=>{ 
                    
                    this.setState(state=>({
                        lista_procedimiento:state.lista_procedimiento.concat({nombre_procedimiento:nombre,precio_procedimiento:precio,total:precio*value,id:id,cantidad:value})
                    }));
                    this.setState({total:this.state.total+(value*precio)});
                }
               ,()=> { Alertify.error('Cancel') })

    }

    cargar_procedimientos=()=>{

        Axios.get("http://localhost:8000/api/cargar_procedimientos").then(data=>{
            this.setState({procedimientos:data.data});
        }).catch(error=>{
            Alertify.alert("Problema al cargar procedimientos");
        });

    }

    buscar_procedimiento=()=>{ 
            
        var buscar = document.getElementById("buscando").value;
            Axios.get(`http://localhost:8000/api/buscar_procedimiento/${buscar}`).then(data=>{

                    this.setState({procedimientos:data.data});

            }).catch(error=>{

                console.log("error");
            })
    }



    render(){
        return (<div className="col-md-8">
                <div><br/>
                    <h2>CREACCION DE FACTURA</h2><hr/>
                    <strong>Lista de procedimientos</strong><br/>
                    <table className="table">
                        <tr>
                            <td>Nombre</td>
                            <td>Cantidad</td>
                            <td>Monto</td>
                        </tr>
                    {
                        this.state.lista_procedimiento.map(data=>(

                            <tr>
                                <td>{data.nombre_procedimiento}</td>
                                <td>{data.cantidad}</td>
                                <td>{data.total}</td>
                            </tr>
                        ))
                    }
                    </table>
                    <h3>Monto total</h3>
                    <strong id="monto_total">$ {this.state.total}</strong>
                    <button className="btn btn-primary" style={{marginLeft:250}}>Generar Factura</button><br/><br/>
                    <input type="text" className="form-control" id="buscando" onKeyUp={this.buscar_procedimiento} placeholder="Escriba el procedimiento"/><br/>

                    {
                        this.state.procedimientos.map(data=>(
                            <div className="card">
                                <div className="card-body">
                                  <p>  {data.nombre} </p>
                                   <p> {data.precio} </p>
                                   <button className="btn btn-primary" onClick={()=>this.agregarProcedimiento(data.id,data.nombre,data.precio)}>Agregar</button>
                                </div>

                            </div>
                        )



                    )
                    }
                </div>
        </div>

      )
    }


}

export default AgregarFactura;