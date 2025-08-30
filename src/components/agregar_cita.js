import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import Axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Core from './funciones_extras';
import alertify from 'alertifyjs';
import { Link,Redirect } from 'react-router-dom';


moment.locale('es');
const localizer = momentLocalizer(moment);

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [resultadosPacientes, setResultadosPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [ids_entidades, setIdsEntidades] = useState({ id_paciente: null, id_doctor: null });


     let  headers_s = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

  
  useEffect(() => {
    Axios.get(`${Core.url_base}/api/doctores`)
      .then((data) => setDoctors(data.data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (doctorSeleccionado) {
      cargarCitasDoctor(doctorSeleccionado);
    }
  }, [doctorSeleccionado]);


  const eliminar_evento = () => {

    alertify.confirm('¿Estás seguro de eliminar esta cita?', ()  => {

  
      Axios.delete(`${Core.url_base}/api/eliminar_cita/${eventoSeleccionado.id}`, { headers: headers_s }).then((res) => {

        cerrarModal();
         setEventoSeleccionado(null);
        alertify.success('Cita eliminada');


        }).catch((err) => console.error(err));
      setEvents(events.filter((e) => e.id !== eventoSeleccionado.id));
    },()=>{
      alertify.error('Eliminación cancelada');
    });

  }

  const ver_paciente = () => {

    
    alert(`/perfil_paciente/${ids_entidades.id_paciente}/${ids_entidades.id_doctor}`);
        // Redirigir al perfil del paciente seleccionado
      return <Redirect to={`/perfil_paciente/${ids_entidades.id_paciente}/${ids_entidades.id_doctor}`} />

    };

  const cargarCitasDoctor = (doctorId) => {
    Axios.get(`${Core.url_base}/api/citas_doctor/${doctorId}`)
      .then((response) => {
        const citas = response.data.map((cita) => ({
          ...cita,
          title: cita.motivo + (cita.paciente ? ` - ${cita.paciente.nombre} ${cita.paciente.apellido}` : ''),
          start: new Date(cita.inicio),
          end: new Date(cita.fin)
        }));
        setEvents(citas);
      })
      .catch((error) => console.error('Error al cargar citas:', error));
  };

  const searchPaciente = (query) => {
    Axios.get(`${Core.url_base}/api/buscar_paciente/${query}`)
      .then((response) => setResultadosPacientes(response.data))
      .catch((error) => console.log(error));
  };

  const handleSearchPaciente = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length >= 3) {
      searchPaciente(valor);
    } else {
      setResultadosPacientes([]);
    }
  };

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setBusqueda(`${paciente.nombre} ${paciente.apellido}`);
    setResultadosPacientes([]);
  };

  const handleSubmitEvent = (e, config = 'guardar') => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start || !newEvent.end || !pacienteSeleccionado || !doctorSeleccionado) {
      alert('Completa todos los campos.');
      return;
    }

    const evento = {
      inicio: newEvent.start,
      fin: newEvent.end,
      paciente_id: pacienteSeleccionado.id,
      doctor_id: doctorSeleccionado,
      motivo: newEvent.title,
    };

    if (config === 'guardar') {

      let  headers_s = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      Axios.post(`${Core.url_base}/api/guardar_cita`, evento)
        .then((res) => {
          const citaGuardada = res.data;
          const doctor = doctors.find((d) => d.id == doctorSeleccionado);

          const nuevoEvento = {
            ...evento,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
            title: newEvent.title,
            paciente_nombre: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
            doctor_nombre: `${doctor.nombre} ${doctor.apellido}`,
          };

          setEvents([...events, nuevoEvento]);
          cerrarModal();
        })
        .catch((err) => console.error(err));
    } else if (config === 'actualizar') {
      Axios.put(`${Core.url_base}/api/actualizar_cita/${eventoSeleccionado.id}`, evento, { headers: headers_s })
        .then((res) => {
          const citaActualizada = res.data.cita;
          const doctor = doctors.find((d) => d.id == doctorSeleccionado);

          const eventoActualizado = {
            ...evento,
            id: citaActualizada.id,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
            title: newEvent.title,
            paciente_nombre: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
            doctor_nombre: `${doctor.nombre} ${doctor.apellido}`,
          };

          setEvents(events.map((e) => (e.id === citaActualizada.id ? eventoActualizado : e)));
          cerrarModal();
        })
        .catch((err) => console.error(err));
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(false);
    setNewEvent({ title: '', start: '', end: '' });
    setBusqueda('');
    setPacienteSeleccionado(null);
    setDoctorSeleccionado('');
    setEventoSeleccionado(null);
  };

  const manejarEventoSeleccionado = (evento) => {


    setIdsEntidades({ id_paciente: evento.paciente_id, id_doctor: evento.doctor_id });
    setEventoSeleccionado(evento);
    setNewEvent({
      title: evento.title,
      start: moment(evento.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(evento.end).format('YYYY-MM-DDTHH:mm'),
    });
    setBusqueda(evento.paciente_nombre);
    setPacienteSeleccionado({ nombre: evento.paciente_nombre });
    setDoctorSeleccionado(evento.doctor_id || '');
    setEditando(true);
    setModalOpen(true);
  };




  return (
    <div className="col-md-10 p-4">
      <h2 className="mb-4">Agenda</h2>

      <div className="card shadow-sm p-4 mb-4">
        <h5 className="mb-3">
          <strong>Paciente:</strong>{' '}
          {pacienteSeleccionado ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido || ''}` : 'Ninguno'}
        </h5>

        <div className="row align-items-end">
          <div className="col-md-8 mb-3">
            <label>Seleccione el doctor</label>
            <select
              className="form-control"
              value={doctorSeleccionado}
              onChange={(e) => setDoctorSeleccionado(e.target.value)}>
              <option value="">Seleccione un doctor</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.nombre} {doc.apellido}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <button
              className="btn btn-primary w-100"
              onClick={() => setModalOpen(true)}
              disabled={!doctorSeleccionado}>
              Agregar Cita
            </button>
          </div>
        </div>
      </div>

     <Calendar
      localizer={localizer}
      events={events}
      onSelectEvent={manejarEventoSeleccionado}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '80vh' }}
      messages={{
        next: 'Sig.',
        previous: 'Ant.',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay eventos.',
      }}
      tooltipAccessor={(event) =>
        `Paciente: ${event.paciente_nombre}\nDoctor: ${event.doctor_nombre}\nMotivo: ${event.title}`
      }
      titleAccessor={(event) =>
        `${event.title} - ${event.paciente_nombre || ''}`
      }
      min={new Date(0, 0, 0, 8, 0, 0)} // Empieza a mostrar desde las 8:00 AM
    />


      {modalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editando ? 'Editar Cita' : 'Nueva Cita'}</h5>
                <button type="button" className="btn-close" onClick={cerrarModal} />
              </div>
              <form onSubmit={(e) => handleSubmitEvent(e, editando ? 'actualizar' : 'guardar')} className="p-3">
                <div className="modal-body">
                  <label>Buscar paciente</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    value={busqueda}
                    onChange={handleSearchPaciente}
                    disabled={editando}
                  />
                  {resultadosPacientes.length > 0 && (
                    <ul className="list-group">
                      {resultadosPacientes.map((p) => (
                        <li
                          key={p.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => seleccionarPaciente(p)}>
                          {p.nombre} {p.apellido} - {p.cedula}
                        </li>
                      ))}
                    </ul>
                  )}

                  <label>Motivo</label>
                  <textarea
                    className="form-control mb-3"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />

                  <label>Inicio</label>
                  <input
                    type="datetime-local"
                    className="form-control mb-3"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    required
                  />

                  <label>Fin</label>
                  <input
                    type="datetime-local"
                    className="form-control mb-3"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-footer">
                  {editando && (
                    <button type="button" className="btn btn-danger" onClick={eliminar_evento}>Eliminar</button>
                  )}

                  {editando && (
                    <Link className='btn btn-secondary' to={`/perfil_paciente/${ids_entidades.id_paciente}/${ids_entidades.id_doctor}`}> Ver paciente</Link>
                  )}

                  <button type="submit" className="btn btn-primary">Guardar</button>
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
