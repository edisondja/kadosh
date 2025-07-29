import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert('Completa todos los campos');
      return;
    }

    setEvents([...events, {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    }]);

    setModalOpen(false);
    setNewEvent({ title: '', start: '', end: '' });
  };

  return (
    <div style={{ padding: '1rem' }} className='col-md-10'>
      <h2 className="text-xl font-semibold mb-4">Agenda</h2>
      <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 10 }}>
        Agregar Cita
      </button>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '80vh' }}
        messages={{
          next: "Sig.",
          previous: "Ant.",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay eventos en este rango.",
        }}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(6px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow" style={{
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Agregar nueva cita</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <form onSubmit={handleAddEvent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Inicio</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fin</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn btn-primary">Guardar</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Estilos básicos para el modal
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)', // un poco más suave
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    padding: '2rem',
    borderRadius: '16px',
    width: '340px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
};


export default Agenda;
