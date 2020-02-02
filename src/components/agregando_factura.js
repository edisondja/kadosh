import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FacturaInterfaz from './factura_interfaz';
import cargar_doctores from './funciones_extras';
import VerFacturas from './ver_facturas';
import PerfilPaciente from './perfil_paciente';

class  AgregarFactura extends React.Component{

    constructor(props){
        super(props);
        this.state= {procedimientos:[],total:0,lista_procedimiento:[],doctores:[],factura:''};
        this.removeTodo = this.removeTodo.bind(this);

    }

    removeTodo(name,resta){
        this.setState({
            lista_procedimiento: this.state.lista_procedimiento.filter(el => el !== name),total:this.state.total-resta
        },()=>{
            console.log(this.state.lista_procedimiento);
        });
        
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
               ,()=> { Alertify.error('Cancel') }).set('type','text');

    }

    generar_factura=()=>{
            //accion a ajecutar cuando se haga click en generar factura
            var id_doctor = document.querySelector("#doctor_i").value;
            Axios.post(`${cargar_doctores.url_base}/api/crear_factura`,{id_paciente:this.props.IDpaciente,id_doctor:id_doctor,total:this.state.total,procedimientos:[this.state.lista_procedimiento]}).then((data)=>{

                    console.log(data.data);
                    this.setState({total:0,lista_procedimiento:[],factura:'ready'});
                    Alertify.success("Factura generada correctamente, puede ir al perfil del paciente y verla");
                   // document.getElementById("agregar_paciente").click();

                }).catch(error=>{
                    Alertify.error("Error al crear factura");
            });

    }
    
    eliminar_procedimiento=(indice)=>{
                    console.log("intentando eliminar procedimiento ..");
                    this.setState({})
                    
    }

    retroceder=()=>{

        this.setState({factura:'perfil_paciente'});
    }


    buscar_procedimiento=()=>{ 
            
        var buscar = document.getElementById("buscando").value;
            Axios.get(`${cargar_doctores.url_base}/api/buscar_procedimiento/${buscar}`).then(data=>{

                    this.setState({procedimientos:data.data});

            }).catch(error=>{

                console.log("error");
            })
    }



    render(){
         var indice_procedimiento = 0;

         if(this.state.factura=='ready'){

                return <VerFacturas id_paciente={this.props.IDpaciente}/>;

         }else if(this.state.factura=='perfil_paciente'){

            return <PerfilPaciente id_paciente={this.props.IDpaciente}  />
         }else{

            
         }


        return (<div className="col-md-8">
                <div><br/>
                    <button className="btn btn-primary" onClick={this.retroceder} style={{float:'right'}}>Retroceder</button>
                    <h2>CREACCION DE FACTURA</h2><hr/>
                    <strong>Lista de procedimientos</strong><br/>
                    <table className="table">
                        <tr>
                            <td>Nombre</td>
                            <td>Cantidad</td>
                            <td>Monto</td>
                            <td>Eliminar</td>
                        </tr>
                    {
                        this.state.lista_procedimiento.map(data=>(
                            <tr>
                                <td>{data.nombre_procedimiento}</td>
                                <td>{data.cantidad}</td>
                                <td>{data.total}</td>
                                <td><button className="btn-danger" onClick={()=>this.removeTodo(data,data.total)}>X</button></td>
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
                    <div className="interfaz_cliente">
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
        </div>

      )
    }


}

export default AgregarFactura;