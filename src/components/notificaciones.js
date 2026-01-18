import FuncionesExtras from './funciones_extras';
import React from 'react';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';
import HDB from '../hbd.png';
import okay from '../okay.png';
import '../css/notificaciones.css';

class Notificacion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notificaciones: [],
            nombreClinica: '', // Nombre de la clínica desde la configuración
        };
    }

    componentDidMount() {
        this.cargarConfiguracion();
        FuncionesExtras.notificar_cumple(this);
    }

    cargarConfiguracion = () => {
        Axios.get(`${FuncionesExtras.url_base}/api/configs`)
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    const config = res.data[0];
                    const nombreClinica = config.nombre_clinica || FuncionesExtras.Config.name_company || 'Clínica';
                    this.setState({ nombreClinica });
                } else {
                    // Fallback al nombre del JSON si no hay config en BD
                    this.setState({ nombreClinica: FuncionesExtras.Config.name_company || 'Clínica' });
                }
            })
            .catch((err) => {
                console.error('Error al cargar configuración:', err);
                // Fallback al nombre del JSON si falla la petición
                this.setState({ nombreClinica: FuncionesExtras.Config.name_company || 'Clínica' });
            });
    }

    ver_paciente = (id, id_doctor) => {
        this.props.history.push(`/perfil_paciente/${id}/${id_doctor}`);
    };

   
    compartirWhatsapp = (telefono, nombre) => {
        const nombreClinica = this.state.nombreClinica || FuncionesExtras.Config.name_company || 'Clínica';
        const mensaje = `🎉 ¡Hola ${nombre}! 🎂 El equipo de ${nombreClinica} te desea un feliz cumpleaños 🎈.`;
        const url = `https://web.whatsapp.com/send?phone=1${telefono}&text=${encodeURIComponent(mensaje)}`;

        if (this.waWindow && !this.waWindow.closed) {
            this.waWindow.location.href = url;
            this.waWindow.focus();
        } else {
            this.waWindow = window.open(url, 'whatsapp_kadosh');
        }
    }

     render() {
        if (this.state.notificaciones.length === 0) {
            return (
                <div className="col-md-8 mt-5">
                    <div className="mac-box-premium">
                        <p className="titulo">No hay notificaciones en este momento</p>
                        <img src={okay} alt="Okay" width="48" className="icono" />
                    </div>
                </div>
            );
        }

        return (
            <div className="col-md-8 mt-5">
                <div className="mac-box-premium">
                    <h3 className="titulo mb-4">🎉 Notificaciones</h3>

                    {this.state.notificaciones.map((data, index) => (
                        <div key={index} className="notificacion-card">
                            <div className="contenido">
                                <div className="texto">
                                    <p className="descripcion">
                                        Hoy está de cumpleaños <strong>{data.nombre} {data.apellido}</strong> 🎂.<br />
                                        Teléfono: <strong>{data.telefono}</strong><br />
                                        ¡Felicítalo y demuéstrale lo especial que es para la familia Kadoshor!
                                    </p>
                                    <div className="botones">
                                        <button className="btn-negro" onClick={() => this.ver_paciente(data.id, data.id_doctor)}>
                                            Ver perfil
                                        </button>
                                        <button className="btn-negro" onClick={() => this.compartirWhatsapp(data.telefono, data.nombre)}>
                                            Compartir por WhatsApp
                                        </button>
                                    </div>
                                </div>
                                <img src={HDB} alt="Cumpleaños" className="avatar" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withRouter(Notificacion);
