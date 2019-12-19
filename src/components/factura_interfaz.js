import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import '../css/dashboard.css';

class FacturaInterfaz extends React.Component{

    constructor(props){
        super(props);
        this.state= {valor:true,factura:{precio_estatus:0},procedimientos:[]};
    }

    componentDidMount(){

        this.cargar_factura(this.props.id_factura);
        this.cargar_procedimientos(this.props.id_factura);
    }

    cargar_procedimientos=(id_factura)=>{

        Axios.get(`http://localhost:8000/api/cargar_procedimientos_de_factura/${id_factura}`).then(data=>{

            this.setState({procedimientos:data.data});

        }).catch(error=>{
                console.log(error);
        });

    }

    cargar_factura=(id_factura)=>{
            
            Axios.get(`http://localhost:8000/api/cargar_factura/${id_factura}`).then(data=>{
                    this.setState({factura:data.data[0]});
            }).catch(error=>{
                    Alertify.message("No se pudo cargar la factura");
            });
    }   

    render(){
        return (<div className="col-md-4"> 
                <h2>Factura y sus detalles</h2>
                <h3>Estado actual <p style={{color:'#36b836'}}>$RD {this.state.factura.precio_estatus}</p></h3><hr/>
                <h4>Ingresado por: ({this.state.factura.nombre} {this.state.factura.apellido})</h4>
                <div>
                    <table className="table">
                        <tr>
                            <td>Nombre</td>
                            <td>Cantidad</td>
                            <td>Total</td>
                        </tr>
                    {  this.state.procedimientos.map((data=>(

                            <tr>
                                <td>{data.nombre}</td>
                                <td>{data.cantidad}</td>
                                <td>$RD {data.total}</td>
                            </tr>
                      )))     
                    }
                    </table>
                    <button className="btn btn-primary">Pagar</button>&nbsp;
                    <button className="btn btn-info">Imprimir</button>&nbsp;
                    <button className="btn btn-dark">Eliminar</button><hr/>
                    <h2>Pagos Realizados</h2>
                    <table className="table boxslider">
                        <tr>
                            <td>Monto</td>
                            <td>Concepto de pago</td>
                            <td>Tipo de pago</td>
                            <td>Editar</td>
                            <td>Eliminar</td>
                            <td>Imprimir</td>
                        </tr>
                            <tr>
                                <td>400</td>
                                <td>pago en efectivo</td>
                                <td>MASTER CARD</td>
                                <td><button className="btn btn-primary">Actualizar</button></td>
                                <td><button className="btn btn-success">Eliminar</button></td>
                                <td><button class="btn btn">Imprimir</button></td>
                            </tr> 
                            
                    </table>
                </div>

        </div>);
    }


}

export default FacturaInterfaz;