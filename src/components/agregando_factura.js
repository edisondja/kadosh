import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FacturaInterfaz from './factura_interfaz';
import cargar_doctores from './funciones_extras';

class  AgregarFactura extends React.Component{

    constructor(props){
        super(props);
        this.state= {procedimientos:[],total:0,lista_procedimiento:[],doctores:[]};
    }


    componentDidMount(){

        cargar_doctores.cargar_procedimientos(this);
        cargar_doctores.cargar_doctores(this);
    }

    agregarProcedimiento=(id,nombre,precio)=>{



       Alertify.prompt( 'Que cantidad de procedimientos quieres agregar?', 'Digite el numero de procedimientos de este tipo que quiere agregar', '1'
               ,(evt, value)=>{ 
                    
                    this.setState(state=>({
                        lista_procedimiento:state.lista_procedimiento.concat({nombre_procedimiento:nombre,total:precio*value,id_procedimiento:id,cantidad:value})
                    }));
                    this.setState({total:this.state.total+(value*precio)});
                }
               ,()=> { Alertify.error('Cancel') })

    }

    generar_factura=()=>{
            //accion a ajecutar cuando se haga click en generar factura
            var id_doctor = document.querySelector("#doctor_i").value;
            var tipo_de_pago = document.querySelector('#tipo_de_pago').value;
            Axios.post("http://localhost:8000/api/crear_factura",{id_paciente:this.props.IDpaciente,IDdoctor:id_doctor,total:this.state.total,tp_pago:tipo_de_pago,procedimientos:[this.state.lista_procedimiento]}).then(data=>{

                    //Alertify.message(data.data);
                    alert(data);
                    console.log(data);
            }).catch(error=>{
                    Alertify.error("Error al crear factura");
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
                    <strong  style={{float:'right',margin:'5px'}}>Seleccione el doctor</strong>
                    <select className="form-control col-md-3" style={{float:'right'}} id="doctor_i">
                        {this.state.doctores.map(data=>(
                             <option value={data.id}>{data.nombre} {data.apellido}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary" style={{marginLeft:250}} onClick={this.generar_factura}>Generar Factura</button><br/><br/>
             
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