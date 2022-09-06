import React from 'react';
import Axios from 'axios';
import '../css/dashboard.css';
import PerfilPaciente from './perfil_paciente';
import alertify from 'alertifyjs';
import ActualizarPaciente from './actualizar_paciente';
class ImprimirRecibo extends React.Component{

    constructor(props){
        super(props);
        this.state= {monto_total:0,option:''};

    }

    componentDidMount(){
        
    
    }

    retroceder=()=>{
        this.setState({option:'ver_perfil'})
    }

    Imprimir(){
        
            var ficha = document.getElementById("recibo");
            var ventimp = window.open(' ', 'popimpr');
            ventimp.document.write( ficha.innerHTML );
            ventimp.document.close();
            ventimp.print( );
            ventimp.close();

    }


    render(){


       let procedimientos = this.props.data_recibo.procedimientos;

       if(procedimientos==""){

            procedimientos  = this.props.procedimientos_i;
       
        }else{

            procedimientos =  JSON.parse(this.props.data_recibo.procedimientos);

        }

        if(this.state.option=='ver_perfil'){

            return  <PerfilPaciente id_paciente={this.props.id_paciente}/>
        }
        
        return (<div><br/><br/><br/><br/><hr/><button className="btn btn-primary" onClick={this.Imprimir}>Imprimir</button>
        <button onClick={this.retroceder} className="btn btn-primary" style={{float:'right'}}>Retroceder</button><hr/>
                    <div className="card" id="recibo">
                                <strong className="titulo_kadosh">CLINICA DENTAL KADOSH OR SRL <br/>&nbsp;&nbsp;C/San Antonio #33A Los Alcarrizos<br/>&nbsp;&nbsp;Santo Domingo,R.D</strong>
                                <p> TEL: 809-620-8641 &nbsp;&nbsp; RNC: 131-76629-3</p>
                                   
                                   <p>_____________________________</p><br/>
                                   <p>COMPROBANTE AUTORIZADO POR LA DGII</p><br/>
                                   <strong>Fecha de pago: {this.props.data_recibo.fecha_pago}</strong><br/>
                                   <strong>#{this.props.data_recibo.codigo_recibo}</strong><br/>

                                   <p>____________________________</p><br/>
                                   <strong>FACTURA PARA CONSUMIDOR</strong><br/>
                                   <p>____________________________</p><br/>

                                   <strong>Lista de procedimientos</strong><br/><br/>

                                 
                                        {
                                            procedimientos.map((data=>( 
                                                    <strong style={{display: 'block'}}>{data.nombre} x{data.cantidad} $RD {new Intl.NumberFormat().format(data.total)}
                                                    <div style={{display:'none'}}>{this.state.monto_total+=data.total}</div>
                                                    </strong>          
                                            )))
                                            
                                        }
                                        <br/><br/><br/><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOTAL $RD {new Intl.NumberFormat().format(this.state.monto_total)}</strong><br/>
                                        <strong>Monto Pagado RD$ {new Intl.NumberFormat().format(this.props.data_recibo.monto)}</strong><br/>
                                        <strong>Resto a pagar RD$ {new Intl.NumberFormat().format(this.props.data_recibo.estado_actual)}</strong><br/>
                                        <br/><strong>Tipo de pago: {this.props.data_recibo.concepto_pago}</strong><br/>

                                        <br/>
                                        <p>_______________________________</p><br/>
                                        <strong>Doctor: {this.props.data_recibo.nombre} {this.props.data_recibo.apellido}</strong><br/>
                                        <strong>Paciente: {this.props.data_recibo.paciente} {this.props.data_recibo.apellido_paciente}</strong><br/>
                                        <strong style={{float:'rigth'}}>Firma __________________________________&nbsp;&nbsp;</strong>
                    </div> 

            </div>);

    }


}

export default ImprimirRecibo;