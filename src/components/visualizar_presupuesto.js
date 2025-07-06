
import React from 'react';
import Axios from 'axios';
import alertify from 'alertifyjs';
import Core  from './funciones_extras';
import PerfilPaciente from './perfil_paciente';

class VisualizarPresupuesto extends React.Component{



        constructor(props){

               super(props);
        
               this.state={select:null,paciente:{},presupuesto:{id:0,factura:"",nombre:"",paciente_id:"",doctor_id:"",procedimientos:[[]]}}

        }

        componentDidMount(){

                this.Cargar_presupuesto(this.props.id_presupuesto);
                Core.cargar_paciente(this,this.props.id_paciente);
                        
               
        }


                
        Imprimir(){
                
                var ficha = document.getElementById("presupuesto");
                var ventimp = window.open(' ', 'popimpr');
                ventimp.document.write( ficha.innerHTML );
                ventimp.document.close();
                ventimp.print( );
                ventimp.close();
        }


        Cargar_presupuesto=(id_prespusto)=>{


                Axios.get(`${Core.url_base}/api/cargar_presupuesto/${id_prespusto}`).then(data=>{
        
                        console.log("Datos correcto",data.data);
                        this.setState({presupuesto:data.data});
                        console.log("Presupuesto cargado",this.state.presupuesto);

                }).catch(error=>{
        
                alertify.message(error);
        
                });

        }

        
        retroceder=()=>{


                this.setState({select:'perfil'});
        
        }
        

    

       render(){





        if(this.state.select=='perfil'){


                return <PerfilPaciente  id_paciente={this.props.id_paciente}/>

        }

        let count = this.state.presupuesto.procedimientos.length;
        let precio_total = 0;
        console.log("datt",count);

       // alert(this.state.procedimientos.length);
/*
        this.state.presupuesto.procedimientos.forEach(element => {

                count++;
                console.log("datagrama aqui--->",element[count].nombre_procedimiento);

        });

*/

        console.log(this.state.presupuesto.factura);

        try{

        let factura  = JSON.parse(this.state.presupuesto.factura);

        // console.log("B SSSS",factura);

        }catch(e){

                console.log("error",e);
                console.log("LA FACTURA",this.state.presupuesto.factura);
        }

            return (<div className='col-md-8' >
                <div id="presupuesto">
                    <br/><br/><hr/>
                    <h3>{this.props.nombre_presupuesto}</h3>
                    <table className='table' >
                                <tr>
                                        <th>Procedimiento</th>
                                        <th>Paciente</th>
                                        <th>Cantidad</th>
                                        <th>Precio</th>
                                        <th>Monto</th>
                                        <th>Total</th>
                                      
                                </tr>
                                {            
                                this.state.presupuesto.procedimientos.map((data)=>(


                                        <tr>
                                                <td>{data.nombre_procedimiento}</td>
                                                <td>{this.state.paciente.nombre}</td>
                                                <td>{data.cantidad}</td>
                                                <td>{new Intl.NumberFormat().format((data.total/data.cantidad))}</td>
                                                <td>{new Intl.NumberFormat().format((data.total))}</td>
                                                <th></th>
                                        </tr>


                                ))        
                                

                                }
                                        <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td>RD$ {new Intl.NumberFormat().format((this.state.presupuesto.total))}</td>
                                        </tr>          
                        
                        </table>
                    </div>

                        <table className='table'>
                                <tr>
                                        <td><button onClick={this.retroceder} style={{background:'#2c008b',borderColor:'purple'}} className='btn btn-primary'>Retroceder</button></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td><button onClick={this.Imprimir} className='btn btn-primary'>Imprimir</button></td>
                                 </tr>

                        </table>
            </div>)
    

       }





}

export default VisualizarPresupuesto;