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
                            <h4>#{this.props.data_recibo.codigo_recibo}</h4>
                                <strong className="titulo_kadosh">CLINICA DENTAL KADOSH</strong>
                                <p>RL C/San Antonio #33A Los Alcarrizos Santo Domingo,R.D TEL: 809-620-864 RNC: 131-76629-3</p>
                                <table className="table">
                                    <tr>
                                        <td>Procedimiento</td>
                                        <td>Precio</td>
                                        <td>Cantidad</td>
                                        <td>Total</td>
                                    </tr>
                                
                                        {
                                            this.props.procedimientos_i.map((data=>( 
                                                <tr>
                                                    <td>{data.nombre}</td>
                                                    <td>{data.precio}</td>
                                                    <td>{data.cantidad}</td>
                                                    <td>{data.total}</td>
                                                    <td style={{display:'none'}}><strong>{this.state.monto_total+=data.total}</strong></td>
                                                </tr>
                                            )))

                                        }
                                    <tr>
                                        <td><strong>TOTAL</strong></td>
                                        <td><strong>{new Intl.NumberFormat().format(this.state.monto_total)}</strong></td>
                                    </tr>
                                </table><hr/>
                                <table className="table">
                                    <tr>
                                        <td>Doctor</td>
                                        <td>Paciente</td>
                                        <td>Monto Pagado</td>
                                        <td>Resto a pagar</td>
                                    </tr>
                                    <tr><td>{this.props.data_recibo.nombre} {this.props.data_recibo.apellido}</td>
                                        <td>{this.props.data_recibo.paciente} {this.props.data_recibo.apellido_paciente}</td>
                                        <td>RD$ {new Intl.NumberFormat().format(this.props.data_recibo.monto)}</td>
                                        <td>RD$ {new Intl.NumberFormat().format(this.props.data_recibo.estado_actual)}</td>
                                    </tr>
                                    <tr>
                                        <td>Concepto de pago</td>
                                        <td>Tipo de pago</td>
                                        <td>RNC</td>
                                        <td>Fecha de pago</td>
                                    </tr>
                                    <tr>
                                        <td>ABONO</td>
                                        <td>EFECTIVO</td>
                                        <td>131-76629-3</td>
                                        <td>{this.props.data_recibo.fecha_pago}</td>
                                    </tr>
                                   
                                </table>    

                                <strong>Ref: {this.props.data_recibo.id_factura}</strong>
                                <strong style={{float:'rigth'}}>   Firma _______________________________</strong>
                    </div> 
                    <button className="btn btn-primary" onClick={this.Imprimir}>Imprimir</button>

            </div>);

    }


}

export default ImprimirRecibo;