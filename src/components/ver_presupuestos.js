import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import PerfilPaciente from './perfil_paciente';
import Lupa  from '../lupa.png';
import Eliminar  from '../eliminar.png';
import { Link } from 'react-router-dom';
import VerPresupuestoAhora from './visualizar_presupuesto';



class VerPresupuesto extends React.Component{


    constructor(props){
        super(props)

        this.state={select:"",presupuestos:[],presupuesto_id:0,nombre_p:""};

    }


    componentDidMount(){


        this.cargar_presupuestos(this.props.match.params.id);

        console.log(this.state.presupuestos);
    }


    cargar_presupuestos=(paciente_id)=>{


            Axios.get(`${Core.url_base}/api/cargar_presupuestos/${paciente_id}`).then(data=>{

                this.setState({presupuestos:data.data});

            }).catch(error=>{

                Alertify.message("error cargando prosupuestos");

            });

    }


    actualizar_presupuesto=(presupuesto)=>{


        Axios.post(`${Core.url_base}/actualizar_presupuesto`,presupuesto).then(data=>{


            Alertify.message("Presupuesto actualizado con exito");

        }).catch(error=>{

            Alertify.message("Error eliminando presupuesto");

        });



    }


    ver_presupuesto=(id_presupuesto,nombre_prespuesto)=>{

        this.setState({select:'ver_presupuesto'});
        this.setState({presupuesto_id:id_presupuesto,nombre_p:nombre_prespuesto});

      
    }



    buscar_prespuestos=(e)=>{


            Axios.get(`${Core.url_base}/api/buscar_presupuesto/${e.target.value}`).then(data=>{


                this.setState({presupuestos:data.data});


            }).catch(error=>{

              //  Alertify.message("fallo cargando data");

            });



    }



    eliminar_presupuesto=(presupuesto_id,nombre="")=>{


        Alertify.confirm("Eliminar prespuesto",`Estas seguro que deseas eliminar el presupuesto "${nombre}" de forma permanente?`,function(){


                Axios.post(`${Core.url_base}/api/eliminar_presupuesto`,{presupuesto_id:presupuesto_id}).then(data=>{

                    Alertify.message("Presupuesto eliminado cone exito");
                    document.getElementById(`presupuesto${presupuesto_id}`).remove();

                }).catch(error=>{

                        Alertify.message("Error eliminando prespuesto");
                      
                });
        },function(){


            Alertify.message("Presupeusto conservado");

        });


           

    }




    render(){


        
        if(this.state.select=="perfil"){

            return <PerfilPaciente id_paciente={this.props.IDpaciente} />
        
        }else if(this.state.select=="ver_presupuesto"){


             //   alert(this.state.id_presupuesto+" "+this.state.nombre_p);


            return <VerPresupuestoAhora 
                        id_paciente={this.props.IDpaciente} 
                        id_presupuesto={this.state.presupuesto_id}
                        nombre_presupuesto={this.state.nombre_p} />

        }


        return (<div className='col-md-8'>  
            <hr/><hr/>
            <h3>Lista de presupuestos</h3>  
            <Link to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
                <button className='btn-primary' style={{float:'right',margin:'5px'}}>Retroceder</button><br/>
            </Link>
 
            <input type='text' onChange={this.buscar_prespuestos} className='form-control' placeholder='Buscar el prespuesto por nombre' /><hr/>

            <table className='table'>
                <tr>
                    <td>Nombre de presupuesto</td>    
                    <td>Paciente</td>   
                    <td>Obervar</td>
                    <td>Suprimir</td>
                    <td>Fecha creado</td>
                </tr>           

                {this.state.presupuestos.map(data=>(


                    <tr id={"presupuesto"+data.id}>
                        <td>{data.nombre}</td>  
                        <td>{data.paciente.nombre}</td>
                        <td>
                            <Link to={`/presupuesto/${this.props.match.params.id}/${data.id}/${data.doctor_id}`}>

                                <img width="35" src={Lupa} style={{cursor:'pointer'}}/>

                             </Link>
                           
                        </td>
                        <td><img width="35" src={Eliminar} onClick={()=>this.eliminar_presupuesto(data.id,data.nombre)} style={{cursor:'pointer'}}/></td>
                        <td>{data.created_at}</td>
                    </tr>


                ))}



            </table>

        </div>);




    }

}

export default VerPresupuesto;
