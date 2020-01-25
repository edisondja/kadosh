import React from 'react';
import Axios from 'axios';
import '../css/dashboard.css';
class ImprimirRecibo extends React.Component{

    constructor(props){
        super(props);
        this.state= {monto_total:0};

    }

    componentDidMount(){

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
        
        return (<div><hr/>
                    <div className="card" id="recibo">
                            <strong>#{this.props.data_recibo.codigo_recibo}</strong><br/>
                                <strong className="titulo_kadosh">CLINICA DENTAL KADOSH OR</strong>
                                <p>RL C/San Antonio #33A Los Alcarrizos Santo Domingo,R.D TEL: 809-620-864 RNC: 131-76629-3</p>
                                   
                                   <strong>Lista de procedimientos</strong><br/><br/>
                                
                                        {
                                            this.props.procedimientos_i.map((data=>( 
                                                    <strong style={{display: 'block'}}>{data.nombre} x{data.cantidad} $RD {new Intl.NumberFormat().format(data.total)}
                                                    <div style={{display:'none'}}>{this.state.monto_total+=data.total}</div>
                                                    </strong>          
                                            )))
                                            
                                        }
                                        <br/><br/><br/><strong>TOTAL $RD {new Intl.NumberFormat().format(this.state.monto_total)}</strong><br/>
                                        <strong>Tipo de pago: {this.props.data_recibo.tipo_de_pago}</strong><br/>
                                        <strong>Doctor: {this.props.data_recibo.nombre} {this.props.data_recibo.apellido}</strong><br/>
                                        <strong>Paciente: {this.props.data_recibo.paciente} {this.props.data_recibo.apellido_paciente}</strong><br/>
                                        <strong>Monto Pagado RD$ {new Intl.NumberFormat().format(this.props.data_recibo.monto)}</strong><br/>
                                        <strong>Resto a pagar RD$ {new Intl.NumberFormat().format(this.props.data_recibo.estado_actual)}</strong><br/>
                                
                                
                                        <br/>
                                        <strong>Fecha de pago: {this.props.data_recibo.fecha_pago}</strong><br/>
                                
                                    
                                        
                                   

                                <strong>Ref: {this.props.data_recibo.id_factura}</strong>
                                <strong style={{float:'rigth'}}>   Firma _______________________________</strong>
                    </div> 
                    <button className="btn btn-primary" onClick={this.Imprimir}>Imprimir</button>

            </div>);

    }


}

export default ImprimirRecibo;