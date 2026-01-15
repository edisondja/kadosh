import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';


class Nomina extends React.Component{


     constructor(props){
        
        super(props);
        this.state = {
            nominas: [],
            detalleVisible: null,
            mostrarFormularioPago: false,
            pagoSeleccionado: null,
            pagosRegistrados: []
        }

     }

     componentDidMount(){
        // Establecer fechas por defecto (mes actual)
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        document.getElementById("fecha_i").value = primerDia.toISOString().split('T')[0];
        document.getElementById("fecha_f").value = ultimoDia.toISOString().split('T')[0];
        
        this.cargar_nominas();
        this.cargarPagosRegistrados();
     }

     cargar_nominas=()=>{

        let fecha_i = document.getElementById("fecha_i").value;
        let fecha_f = document.getElementById("fecha_f").value;

        if (!fecha_i || !fecha_f) {
            Alertify.warning("Por favor seleccione ambas fechas");
            return;
        }

        Core.calcular_nomina_doctores(fecha_i, fecha_f).then(data=>{

            console.log(data);
            this.setState({nominas: data})
        
        }).catch(error=>{

            Alertify.error("Error: no se pudo cargar la nómina de los doctores");
            console.error(error);

        });

     }

     cargarPagosRegistrados = () => {
        Core.listar_pagos_nomina().then(data => {
            this.setState({ pagosRegistrados: data });
        }).catch(error => {
            console.error("Error al cargar pagos registrados:", error);
        });
     }

     mostrarDetalle = (doctorId) => {
        this.setState({ detalleVisible: this.state.detalleVisible === doctorId ? null : doctorId });
     }

     abrirFormularioPago = (nomina) => {
        this.setState({
            mostrarFormularioPago: true,
            pagoSeleccionado: nomina
        });
     }

     cerrarFormularioPago = () => {
        this.setState({
            mostrarFormularioPago: false,
            pagoSeleccionado: null
        });
     }

     registrarPago = () => {
        const { pagoSeleccionado } = this.state;
        const fecha_i = document.getElementById("fecha_i").value;
        const fecha_f = document.getElementById("fecha_f").value;
        const comentarios = document.getElementById("comentarios_pago").value || '';

        const datosPago = {
            doctor_id: pagoSeleccionado.doctor_id,
            fecha_pago: new Date().toISOString().split('T')[0],
            periodo_inicio: fecha_i,
            periodo_fin: fecha_f,
            monto_comisiones: pagoSeleccionado.ganancias_doctor,
            salario_base: 0,
            total_pago: pagoSeleccionado.ganancias_doctor,
            estado: 'pendiente',
            comentarios: comentarios,
            tipo: 'comision'
        };

        Core.registrar_pago_nomina(datosPago).then(response => {
            Alertify.success("Pago de nómina registrado correctamente");
            this.cerrarFormularioPago();
            this.cargarPagosRegistrados();
        }).catch(error => {
            Alertify.error("Error al registrar el pago");
            console.error(error);
        });
     }

     render(){

        const { nominas, detalleVisible, mostrarFormularioPago, pagoSeleccionado } = this.state;

        return(
            <div style={{ padding: '20px' }}>
                <h2>Módulo de Nómina</h2>
                <hr/>
                
                <div style={{ marginBottom: '20px' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td><strong>Fecha Inicial</strong></td>
                                <td><input type="date" id="fecha_i" className="form-control" style={{ margin: '5px' }}/></td>
                                <td><strong>Fecha Final</strong></td>
                                <td><input type="date" id="fecha_f" className="form-control" style={{ margin: '5px' }}/></td>
                                <td>
                                    <button className="btn btn-primary" onClick={this.cargar_nominas} style={{ margin: '5px' }}>
                                        Buscar
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr/>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-striped table-bordered" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Ganancias Clínica</th>
                                <th>Ganancias Doctor (Comisiones)</th>
                                <th>Ingresos Totales</th>
                                <th>Recibos Generados</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nominas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                        No hay datos para mostrar. Seleccione un rango de fechas y haga clic en "Buscar".
                                    </td>
                                </tr>
                            ) : (
                                nominas.map((data, index) => (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td>{data.nombre}</td>
                                            <td>{data.apellido}</td>
                                            <td>RD$ {new Intl.NumberFormat('es-DO').format(data.ganancias_clinica || 0)}</td>
                                            <td style={{ fontWeight: 'bold', color: '#28a745' }}>
                                                RD$ {new Intl.NumberFormat('es-DO').format(data.ganancias_doctor || 0)}
                                            </td>
                                            <td>RD$ {new Intl.NumberFormat('es-DO').format(data.monto || 0)}</td>
                                            <td>{data.recibos || 0}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-info" 
                                                    onClick={() => this.mostrarDetalle(data.doctor_id)}
                                                    style={{ marginRight: '5px' }}
                                                >
                                                    {detalleVisible === data.doctor_id ? 'Ocultar' : 'Ver'} Detalle
                                                </button>
                                                {data.ganancias_doctor > 0 && (
                                                    <button 
                                                        className="btn btn-sm btn-success" 
                                                        onClick={() => this.abrirFormularioPago(data)}
                                                    >
                                                        Registrar Pago
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {detalleVisible === data.doctor_id && data.detalle_procedimientos && (
                                            <tr>
                                                <td colSpan="7" style={{ backgroundColor: '#f8f9fa', padding: '15px' }}>
                                                    <h5>Detalle de Comisiones por Procedimiento:</h5>
                                                    <table className="table table-sm" style={{ marginTop: '10px' }}>
                                                        <thead>
                                                            <tr>
                                                                <th>Procedimiento</th>
                                                                <th>Cantidad</th>
                                                                <th>Precio Unitario</th>
                                                                <th>Comisión %</th>
                                                                <th>Total Comisión</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {data.detalle_procedimientos.map((proc, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{proc.nombre}</td>
                                                                    <td>{proc.cantidad}</td>
                                                                    <td>RD$ {new Intl.NumberFormat('es-DO').format(proc.precio_unitario)}</td>
                                                                    <td>{proc.comision_porcentaje}%</td>
                                                                    <td style={{ fontWeight: 'bold' }}>
                                                                        RD$ {new Intl.NumberFormat('es-DO').format(proc.total_comision)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal para registrar pago */}
                {mostrarFormularioPago && pagoSeleccionado && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            maxWidth: '500px',
                            width: '90%'
                        }}>
                            <h3>Registrar Pago de Nómina</h3>
                            <hr/>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Doctor:</strong> {pagoSeleccionado.nombre} {pagoSeleccionado.apellido}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Período:</strong> {document.getElementById("fecha_i").value} a {document.getElementById("fecha_f").value}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Monto a Pagar:</strong> 
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', marginLeft: '10px' }}>
                                    RD$ {new Intl.NumberFormat('es-DO').format(pagoSeleccionado.ganancias_doctor)}
                                </span>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label><strong>Comentarios:</strong></label>
                                <textarea 
                                    id="comentarios_pago" 
                                    className="form-control" 
                                    rows="3"
                                    placeholder="Comentarios adicionales (opcional)"
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={this.cerrarFormularioPago}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="btn btn-success" 
                                    onClick={this.registrarPago}
                                >
                                    Registrar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección de pagos registrados */}
                {this.state.pagosRegistrados.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <h3>Historial de Pagos de Nómina</h3>
                        <hr/>
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Fecha Pago</th>
                                    <th>Doctor/Empleado</th>
                                    <th>Período</th>
                                    <th>Comisiones</th>
                                    <th>Salario Base</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.pagosRegistrados.map((pago, idx) => (
                                    <tr key={idx}>
                                        <td>{pago.fecha_pago}</td>
                                        <td>
                                            {pago.doctor ? `${pago.doctor.nombre} ${pago.doctor.apellido || ''}` : 
                                             pago.empleado ? `${pago.empleado.nombre} ${pago.empleado.apellido || ''}` : 
                                             'N/A'}
                                        </td>
                                        <td>{pago.periodo_inicio} a {pago.periodo_fin}</td>
                                        <td>RD$ {new Intl.NumberFormat('es-DO').format(pago.monto_comisiones)}</td>
                                        <td>RD$ {new Intl.NumberFormat('es-DO').format(pago.salario_base)}</td>
                                        <td style={{ fontWeight: 'bold' }}>
                                            RD$ {new Intl.NumberFormat('es-DO').format(pago.total_pago)}
                                        </td>
                                        <td>
                                            <span className={`badge ${pago.estado === 'pagado' ? 'badge-success' : 'badge-warning'}`}>
                                                {pago.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
     }
} 

export default Nomina;
