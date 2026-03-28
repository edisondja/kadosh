import React from 'react';
import Dashboard from './dashboard';
import Verificar from './funciones_extras';
import RegistroPacienteInvitacion from './registro_paciente_invitacion';
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
					localStorage.setItem('login', data.data.nombre + ' ' + data.data.apellido);
					localStorage.setItem('id_usuario', data.data.id);
					localStorage.setItem('token', data.data.token);
					localStorage.setItem('roll', data.data.roll);
					if (data.data.tipo) {
						localStorage.setItem('tipo_usuario', data.data.tipo);
					}
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
			const m = window.location.pathname.match(/^\/registro_paciente\/([^/]+)\/?$/i);
			if (m && m[1]) {
				return <RegistroPacienteInvitacion token={m[1]} />;
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
