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
        
        return (
            <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                <br />
                <hr />
               <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <button className="btn btn-primary" onClick={this.Imprimir} title="Imprimir">
                        <i className="fas fa-print"></i>
                    </button>

                    <button onClick={this.retroceder} className="btn btn-primary" title="Retroceder">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    </div>

                <hr />

                <div className="card" id="recibo" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <strong className="titulo_kadosh" style={{ fontSize: '16px' }}>
                    CLÍNICA DENTAL KADOSH OR SRL<br />
                    <span style={{ fontSize: '14px' }}>C/San Antonio #33A Los Alcarrizos<br />
                    Santo Domingo, R.D</span>
                    </strong>
                    <p>TEL: 809-620-8641 &nbsp;&nbsp; RNC: 131-76629-3</p>
                </div>

                <hr />
                <p style={{ textAlign: 'center' }}><strong>COMPROBANTE AUTORIZADO POR LA DGII</strong></p>
                <hr />

                <p><strong>Fecha de pago:</strong> {this.props.data_recibo.fecha_pago}</p>
                <p><strong>#</strong>{this.props.data_recibo.codigo_recibo}</p>

                <hr />
                <p><strong>FACTURA PARA CONSUMIDOR</strong></p>
                <hr />

                <p><strong>Lista de procedimientos:</strong></p>
                <div style={{ marginLeft: '20px' }}>
                    {
                    procedimientos.map((data) => (
                        <div key={data.nombre}>
                        <strong style={{ display: 'block', marginBottom: '5px' }}>
                            {data.nombre} x{data.cantidad} - RD$ {new Intl.NumberFormat().format(data.total)}
                        </strong>
                        <div style={{ display: 'none' }}>{this.state.monto_total += data.total}</div>
                        </div>
                    ))
                    }
                </div>

                <br />
                <p><strong>Total:</strong> RD$ {new Intl.NumberFormat().format(this.state.monto_total)}</p>
                <p><strong>Monto Pagado:</strong> RD$ {new Intl.NumberFormat().format(this.props.data_recibo.monto)}</p>
                <p><strong>Resto a pagar:</strong> RD$ {new Intl.NumberFormat().format(this.props.data_recibo.estado_actual)}</p>
                <p><strong>Tipo de pago:</strong> {this.props.data_recibo.concepto_pago}</p>

                <hr />
                <p><strong>Doctor:</strong> {this.props.data_recibo.nombre} {this.props.data_recibo.apellido}</p>
                <p><strong>Paciente:</strong> {this.props.data_recibo.paciente} {this.props.data_recibo.apellido_paciente}</p>

                <div style={{ textAlign: 'right', marginTop: '50px' }}>
                    <strong>Firma __________________________________</strong>
                </div>
                </div>
            </div>
            );


    }


}

export default ImprimirRecibo;