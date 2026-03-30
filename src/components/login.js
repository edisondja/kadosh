import React from 'react';
import Dashboard from './dashboard';
import Verificar from './funciones_extras';
import RegistroPacienteInvitacion from './registro_paciente_invitacion';
import RegistroDoctorInvitacion from './registro_doctor_invitacion';
import Axios from 'axios';
import alertify from 'alertifyjs';
import '../css/login.css';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			login: Verificar.login_status,
			cargando: false,
		};
	}

	notificarInicioSesion = (nombreCompleto) => {
		const nombre = nombreCompleto || 'Usuario';
		alertify.success(`Bienvenido, ${nombre}. Inicio de sesión correcto.`);

		if (typeof window === 'undefined' || !('Notification' in window)) return;

		const mostrar = () => {
			try {
				new Notification('OdontoED', {
					body: `Inicio de sesión detectado para ${nombre}`,
					icon: (Verificar.Config && Verificar.Config.app_logo) || undefined,
				});
			} catch (e) {
				// Ignorar errores del navegador en notificaciones
			}
		};

		if (Notification.permission === 'granted') {
			mostrar();
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission().then((perm) => {
				if (perm === 'granted') mostrar();
			});
		}
	};

	componentDidMount() {
		if (localStorage.getItem('login') === null) {
			this.setState({ login: false });
		} else {
			this.setState({ login: true });
		}
	}

	iniciar_sesion = (e) => {
		if (e && e.preventDefault) e.preventDefault();

		const usuario = document.querySelector('#usuario')?.value?.trim() || '';
		const clave = document.querySelector('#clave')?.value || '';

		if (!usuario || !clave) {
			alertify.warning('Ingrese usuario y contraseña.');
			return;
		}

		this.setState({ cargando: true });
		Axios.get(`${Verificar.url_base}/api/login/${encodeURIComponent(usuario)}/${encodeURIComponent(clave)}`)
			.then((data) => {
				if (data.data && data.data.id && data.data.token) {
					this.setState({ login: true });
					const nombreUsuario = `${data.data.nombre || ''} ${data.data.apellido || ''}`.trim();
					localStorage.setItem('login', nombreUsuario);
					localStorage.setItem('id_usuario', data.data.id);
					localStorage.setItem('token', data.data.token);
					localStorage.setItem('roll', data.data.roll);
					localStorage.setItem('permisos', JSON.stringify(data.data.permisos || {}));
					if (data.data.tipo) {
						localStorage.setItem('tipo_usuario', data.data.tipo);
					}
					this.notificarInicioSesion(nombreUsuario);
				} else {
					alertify.error('Usuario y contraseña no son correctos');
				}
			})
			.catch(() => {
				alertify.error('Usuario y contraseña no son correctos');
			})
			.finally(() => {
				this.setState({ cargando: false });
			});
	};

	render() {
		if (typeof window !== 'undefined') {
			const mPac = window.location.pathname.match(/^\/registro_paciente\/([^/]+)\/?$/i);
			if (mPac && mPac[1]) {
				return <RegistroPacienteInvitacion token={mPac[1]} />;
			}
			const mDoc = window.location.pathname.match(/^\/registro_doctor\/([^/]+)\/?$/i);
			if (mDoc && mDoc[1]) {
				return <RegistroDoctorInvitacion token={mDoc[1]} />;
			}
		}

		if (this.state.login === true) {
			return <Dashboard />;
		}

		const cfg = Verificar.Config || {};
		const nombreEmpresa = cfg.name_company || 'OdontoED';

		return (
			<div className="login-page">
				<div className="login-page__noise" aria-hidden="true" />
				<div className="login-page__inner">
					<div className="login-card">
						<div className="login-card__header">
							<div className="login-card__logo-wrap">
								<img
									src={cfg.app_logo}
									alt=""
									className="login-card__logo"
									width={cfg.logo_width_login || 160}
								/>
							</div>
							<h1 className="login-card__title">Iniciar sesión</h1>
							<p className="login-card__subtitle">{nombreEmpresa}</p>
						</div>

						<form className="login-card__form" onSubmit={this.iniciar_sesion} noValidate>
							<label className="login-field-label" htmlFor="usuario">
								<i className="fas fa-user login-field-icon" aria-hidden="true" />
								Usuario
							</label>
							<div className="login-input-wrap">
								<input
									type="text"
									id="usuario"
									name="usuario"
									className="login-input"
									placeholder="Su nombre de usuario"
									autoComplete="username"
									disabled={this.state.cargando}
								/>
							</div>

							<label className="login-field-label" htmlFor="clave">
								<i className="fas fa-lock login-field-icon" aria-hidden="true" />
								Contraseña
							</label>
							<div className="login-input-wrap">
								<input
									type="password"
									id="clave"
									name="clave"
									className="login-input"
									placeholder="••••••••"
									autoComplete="current-password"
									disabled={this.state.cargando}
								/>
							</div>

							<button
								type="submit"
								className="login-submit"
								id="boton_login"
								disabled={this.state.cargando}
							>
								{this.state.cargando ? (
									<>
										<span className="login-submit__spinner" aria-hidden="true" />
										Entrando…
									</>
								) : (
									<>
										<i className="fas fa-sign-in-alt mr-2" aria-hidden="true" />
										Entrar
									</>
								)}
							</button>
						</form>

						<footer className="login-card__footer">
							<p className="login-card__legal">
								{cfg.info_app}{' '}
								{cfg.website ? (
									<a href={`https://${cfg.website.replace(/^https?:\/\//, '')}`} className="login-card__link" target="_blank" rel="noopener noreferrer">
										{cfg.website}
									</a>
								) : null}
							</p>
						</footer>
					</div>
				</div>
			</div>
		);
	}
}

export default Login;
