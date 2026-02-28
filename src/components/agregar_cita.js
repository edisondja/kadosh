import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import Axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Core from './funciones_extras';
import alertify from 'alertifyjs';
import { Link,Redirect } from 'react-router-dom';


  // Actualizar locale existente 'es' (evita deprecación de defineLocale)
moment.updateLocale('es', {
    weekdaysMin: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    weekdaysShort: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
});
moment.locale('es');
// ------------------------------------------------------------------
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
  const [seleccionActiva, setSeleccionActiva] = useState({ start: null, end: null });
  const [mostrarFormNuevoPaciente, setMostrarFormNuevoPaciente] = useState(false);
  const [datosNuevoPaciente, setDatosNuevoPaciente] = useState({ nombre: '', apellido: '', cedula: '', telefono: '' });
  const [guardandoPaciente, setGuardandoPaciente] = useState(false);
  const [dictandoMotivo, setDictandoMotivo] = useState(false);
  const recognitionRef = useRef(null);


     let  headers_s = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };



const localizer = momentLocalizer(moment)

  // Función para reproducir sonido al guardar/actualizar cita
  const reproducirSonidoGuardar = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log("Error al reproducir sonido:", error);
    }
  };

  // Función para reproducir sonido al eliminar cita
  const reproducirSonidoEliminar = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 400;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Error al reproducir sonido:", error);
    }
  };

  // Función para reproducir sonido al seleccionar slot
  const reproducirSonidoSeleccionar = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log("Error al reproducir sonido:", error);
    }
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
        reproducirSonidoEliminar();
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
          // Guardamos las IDs en el objeto del evento para usarlas al editar/ver paciente
          paciente_id: cita.paciente_id, 
          doctor_id: cita.doctor_id,
          // El title completo incluye el nombre del paciente
      
          // Agregamos el nombre completo para el tooltip y edición
          paciente_nombre: cita.paciente ? `${cita.paciente.nombre} ${cita.paciente.apellido}` : '',
          title: cita.paciente ? `${cita.paciente.nombre} ${cita.paciente.apellido} - ${cita.motivo}` : cita.motivo,
          doctor_nombre: doctors.find(d => d.id == cita.doctor_id) ? `${doctors.find(d => d.id == cita.doctor_id).nombre} ${doctors.find(d => d.id == cita.doctor_id).apellido}` : '',
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
            id: citaGuardada.id, // Es crucial tener el ID para futuras ediciones/eliminaciones
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
            motivo: newEvent.title,
            title: newEvent.title + ` - ${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
            paciente_nombre: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
            doctor_nombre: `${doctor.nombre} ${doctor.apellido}`,
          };

          setEvents([...events, nuevoEvento]);
          reproducirSonidoGuardar();
          cerrarModal();
          alertify.success('Cita guardada con éxito.');
        })
        .catch((err) => {
          console.error(err);
          alertify.error('Error al guardar la cita.');
        });
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
            motivo: newEvent.title,
            title: newEvent.title + ` - ${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
            paciente_nombre: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}`,
            doctor_nombre: `${doctor.nombre} ${doctor.apellido}`,
          };

          setEvents(events.map((e) => (e.id === citaActualizada.id ? eventoActualizado : e)));
          reproducirSonidoGuardar();
          cerrarModal();
          alertify.success('Cita actualizada con éxito.');
        })
        .catch((err) => {
          console.error(err);
          alertify.error('Error al actualizar la cita.');
        });
    }
  };

  const cerrarModal = () => {
    if (recognitionRef.current && dictandoMotivo) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setDictandoMotivo(false);
    }
    setModalOpen(false);
    setEditando(false);
    setNewEvent({ title: '', start: '', end: '' });
    setBusqueda('');
    setPacienteSeleccionado(null);
    setSeleccionActiva({ start: null, end: null });
    setMostrarFormNuevoPaciente(false);
    setDatosNuevoPaciente({ nombre: '', apellido: '', cedula: '', telefono: '' });
    setEventoSeleccionado(null);
  };

  const toggleDictarMotivo = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alertify.error('Tu navegador no soporta dictado por voz. Usa Chrome o Edge.');
      return;
    }
    if (dictandoMotivo) {
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}
      setDictandoMotivo(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setNewEvent(prev => ({
          ...prev,
          title: prev.title ? prev.title.trim() + ' ' + transcript.trim() : transcript.trim()
        }));
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        alertify.error('Error en reconocimiento de voz: ' + event.error);
      }
      setDictandoMotivo(false);
    };
    recognition.onend = () => setDictandoMotivo(false);
    try {
      recognition.start();
      setDictandoMotivo(true);
      alertify.success('Dictando... Habla el motivo de la cita. Haz clic de nuevo para detener.');
    } catch (e) {
      alertify.error('No se pudo iniciar el micrófono. Verifica los permisos.');
      setDictandoMotivo(false);
    }
  };

  const guardarNuevoPaciente = (e) => {
    e.preventDefault();
    if (!datosNuevoPaciente.nombre.trim() || !datosNuevoPaciente.apellido.trim()) {
      alertify.error('Nombre y apellido son requeridos.');
      return;
    }
    if (!doctorSeleccionado) {
      alertify.error('Debe seleccionar un doctor primero.');
      return;
    }
    setGuardandoPaciente(true);
    const formData = new FormData();
    formData.append('nombre', datosNuevoPaciente.nombre.trim());
    formData.append('apellido', datosNuevoPaciente.apellido.trim());
    formData.append('cedula', datosNuevoPaciente.cedula.trim() || 'Pendiente');
    formData.append('telefono', datosNuevoPaciente.telefono.trim() || '');
    formData.append('id_doctor', doctorSeleccionado);
    formData.append('sexo', 'm');
    formData.append('fecha_nacimiento', '1990-01-01');
    formData.append('correo_electronico', '');
    formData.append('nombre_tutor', '');

    Axios.post(`${Core.url_base}/api/guardar_paciente`, formData)
      .then((res) => {
        const pacienteCreado = res.data;
        setPacienteSeleccionado({ id: pacienteCreado.id, nombre: pacienteCreado.nombre, apellido: pacienteCreado.apellido });
        setBusqueda(`${pacienteCreado.nombre} ${pacienteCreado.apellido}`);
        setMostrarFormNuevoPaciente(false);
        setDatosNuevoPaciente({ nombre: '', apellido: '', cedula: '', telefono: '' });
        alertify.success('Paciente registrado. Puede completar y guardar la cita.');
        setGuardandoPaciente(false);
      })
      .catch((err) => {
        console.error(err);
        alertify.error('Error al registrar el paciente.');
        setGuardandoPaciente(false);
      });
  };

  const manejarEventoSeleccionado = (evento) => {
    // Busca el paciente completo si solo tienes el nombre/ID
    // Por ahora, usamos lo que tenemos en el evento
    setIdsEntidades({ id_paciente: evento.paciente_id, id_doctor: evento.doctor_id });
    setEventoSeleccionado(evento);
    setNewEvent({
      // Extrae solo el motivo si el título incluye el nombre del paciente
      title: evento.motivo || evento.title.split(' - ')[0], 
      start: moment(evento.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(evento.end).format('YYYY-MM-DDTHH:mm'),
    });
    setBusqueda(evento.paciente_nombre);
    // Para edición, necesitamos el ID del paciente, pero si no está en el evento, lo simulamos.
    setPacienteSeleccionado({ nombre: evento.paciente_nombre, id: evento.paciente_id }); 
    setDoctorSeleccionado(evento.doctor_id || '');
    setEditando(true);
    setModalOpen(true);
  };

  // NUEVA FUNCIÓN PARA SELECCIÓN DE SLOT (SOMBRADO)
  const manejarSeleccionSlot = ({ start, end }) => {
    if (!doctorSeleccionado) {
      alertify.error('Por favor, selecciona un doctor primero para agendar.');
      return;
    }

    reproducirSonidoSeleccionar();

    // Restablecer estados para una nueva cita
    setEditando(false); 
    setEventoSeleccionado(null);
    setPacienteSeleccionado(null);
    setBusqueda('');
    setResultadosPacientes([]);

    // Pre-llenar las fechas en el formulario de la nueva cita
    setNewEvent({
      title: '',
      start: moment(start).format('YYYY-MM-DDTHH:mm'),
      end: moment(end).format('YYYY-MM-DDTHH:mm'),
    });
    
    // Limpiar selección activa
    setSeleccionActiva({ start: null, end: null });
    
    setModalOpen(true); 
  };
  // FIN NUEVA FUNCIÓN

  // Función para manejar cuando el usuario está seleccionando (arrastrando)
  const manejarSeleccionando = ({ start, end }) => {
    if (start && end) {
      setSeleccionActiva({
        start: moment(start),
        end: moment(end)
      });
    } else {
      // Limpiar selección si no hay start o end
      setSeleccionActiva({ start: null, end: null });
    }
  };

  // Función para generar colores aleatorios para las columnas
  const obtenerColorColumna = (date) => {
    const fecha = moment(date);
    const diaSemana = fecha.day(); // 0 = Domingo, 6 = Sábado
    
    // Colores pastel aleatorios pero consistentes por día de la semana
    const colores = [
      'rgba(255, 182, 193, 0.15)', // Domingo - Rosa pastel
      'rgba(173, 216, 230, 0.15)', // Lunes - Azul cielo
      'rgba(144, 238, 144, 0.15)', // Martes - Verde claro
      'rgba(255, 218, 185, 0.15)', // Miércoles - Melocotón
      'rgba(221, 160, 221, 0.15)', // Jueves - Ciruela
      'rgba(176, 224, 230, 0.15)', // Viernes - Turquesa
      'rgba(255, 228, 196, 0.15)'  // Sábado - Bisque
    ];
    
    return colores[diaSemana];
  };

  // Componente personalizado para el encabezado de la columna de hora
  const TimeGutterHeader = ({ value, ...props }) => {
    return (
      <div style={{ 
        padding: '4px 8px', 
        fontSize: '12px', 
        fontWeight: 600, 
        color: '#4b5563',
        textAlign: 'center'
      }}>
        HORA
      </div>
    );
  };

  const TimeSlotContent = ({ value, ...props }) => {
    // No mostrar nada aquí
    return null;
  };

  const TimeSlotWrapper = ({ value, children, ...props }) => {
    if (!value) return <div {...props}>{children}</div>;
    return (
      <div 
        {...props} 
        className={props.className ? `${props.className} time-slot-wrapper` : 'time-slot-wrapper'}
        style={{ 
          ...props.style,
          position: 'relative',
          minHeight: '60px'
        }}
      >
        {children}
      </div>
    );
  };


  const inputStyle = {
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    padding: '12px 16px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    width: '100%',
    outline: 'none'
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(220,53,69,0.5); }
          50% { opacity: 0.85; box-shadow: 0 0 20px rgba(220,53,69,0.8); }
        }
        
        /* Sombreado para columnas con citas */
        .rbc-day-slot.has-events {
          background-color: rgba(102, 126, 234, 0.05) !important;
        }
        
        /* Vista de mes - sombrear celdas con eventos */
        .rbc-date-cell.has-events {
          background-color: rgba(102, 126, 234, 0.08) !important;
        }
        
        /* Centrar eventos en las celdas */
        .rbc-event {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          margin: 0 auto !important;
        }
        
        .rbc-event-content {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          text-align: center !important;
        }
        
        /* Asegurar que el contenido del evento esté centrado */
        .rbc-event-label {
          display: none !important;
        }
        
        /* Centrar eventos en vista de semana */
        .rbc-time-content .rbc-event {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
        }
        
        /* Líneas suaves en las columnas de días */
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #e5e7eb !important;
        }
        
        /* Líneas suaves entre días */
        .rbc-day-slot {
          border-left: 1px solid #f3f4f6 !important;
        }
        
        /* Estilos para la columna de horas - SOLO AQUÍ mostrar intervalos de media hora */
        .rbc-time-header-gutter,
        .rbc-time-gutter {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #4b5563 !important;
          width: 80px !important;
        }
        
        /* Marcar intervalos de media hora SOLO en la columna de tiempo */
        .rbc-time-gutter .rbc-time-slot {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 60px !important;
          border-top: 1px solid #9ca3af !important;
          position: relative;
        }
        
        /* Marcar cada hora completa con una línea más gruesa SOLO en la columna de tiempo */
        .rbc-time-gutter .rbc-time-slot:nth-child(2n) {
          border-top: 2px solid #6b7280 !important;
        }
        
        /* Estilos para las etiquetas de hora en la columna de tiempo - FORZAR VISIBILIDAD */
        .rbc-time-gutter .rbc-time-slot .rbc-label {
          padding: 4px 8px !important;
          font-size: 12px !important;
          color: #4b5563 !important;
          font-weight: 600 !important;
          display: block !important;
          text-align: center !important;
          width: 100% !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Asegurar que TODOS los slots muestren su hora */
        .rbc-time-gutter .rbc-time-slot {
          min-height: 60px !important;
        }
        
        /* Forzar que se muestre el contenido en cada slot */
        .rbc-time-gutter .rbc-time-slot > * {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Asegurar visibilidad de todos los números de hora en cada slot de la columna de tiempo */
        .rbc-time-gutter .rbc-time-slot:not(:empty) .rbc-label {
          display: block !important;
        }
        
        /* Mostrar el contenido del slot siempre */
        .rbc-time-gutter .rbc-time-slot .rbc-label,
        .rbc-time-gutter .rbc-time-slot > div {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Mostrar la hora SOLO en la columna de tiempo (gutter) */
        .rbc-time-gutter .time-slot-wrapper .time-label {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* OCULTAR la hora en las columnas de días */
        .rbc-day-slot .time-slot-wrapper .time-label {
          display: none !important;
        }
        
        /* Marcar cada hora completa en el contenido */
        .rbc-time-content .rbc-day-slot .rbc-time-slot:nth-child(2n) {
          border-top: 2px solid #6b7280 !important;
        }
        
        /* Ocultar la primera fila "all day" que muestra hora militar (00:00) */
        .rbc-time-view .rbc-allday-cell {
          display: none !important;
        }
        .rbc-time-view .rbc-allday-events {
          display: none !important;
        }
      `}</style>
      <div className="col-md-10" style={{ padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header */}
      <div className="card border-0 shadow-lg mb-4" style={{ 
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div className="card-body text-white py-2 px-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '14px',
                fontSize: '20px'
              }}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div>
                <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '22px', lineHeight: 1.2 }}>
                  Agenda de Citas
                </h2>
                <p className="mb-0" style={{ opacity: 0.9, fontSize: '13px', marginTop: '2px' }}>
                  Gestiona y programa las citas de tus pacientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de control */}
      <div className="card border-0 shadow-sm mb-4" style={{ 
        borderRadius: '16px',
        background: '#ffffff',
        overflow: 'hidden',
        animation: 'slideUp 0.6s ease'
      }}>
        <div className="card-body p-4">
          <div className="row align-items-end">
            <div className="col-md-8 mb-3">
              <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                <i className="fas fa-user-md me-2" style={{ color: '#667eea' }}></i>
                Seleccione el Doctor
              </label>
              <select
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  paddingRight: '40px'
                }}
                value={doctorSeleccionado}
                onChange={(e) => setDoctorSeleccionado(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}>
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
                className="btn w-100"
                onClick={() => {
                  if (doctorSeleccionado) {
                    setEditando(false);
                    setEventoSeleccionado(null);
                    setNewEvent({ title: '', start: '', end: '' });
                    setBusqueda('');
                    setPacienteSeleccionado(null);
                    setModalOpen(true);
                  } else {
                    alertify.error('Por favor, selecciona un doctor primero.');
                  }
                }}
                disabled={!doctorSeleccionado}
                style={{
                  background: doctorSeleccionado 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#e0e0e0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: doctorSeleccionado ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                  cursor: doctorSeleccionado ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={(e) => {
                  if (doctorSeleccionado) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (doctorSeleccionado) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }
                }}>
                <i className="fas fa-plus me-2"></i>
                Agregar Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="card border-0 shadow-sm" style={{ 
        borderRadius: '16px',
        background: '#ffffff',
        overflow: 'hidden',
        animation: 'slideUp 0.7s ease'
      }}>
        <div className="card-body p-4">
          <Calendar
            localizer={localizer}
            events={events}
            step={30}
            timeslots={1} 
            onSelectEvent={manejarEventoSeleccionado}
            selectable={true} 
            onSelectSlot={manejarSeleccionSlot}
            onSelecting={manejarSeleccionando}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '75vh' }}
            slotPropGetter={(date) => {
              // Verificar si este slot de tiempo específico está ocupado por alguna cita
              const slotTime = moment(date);
              const slotEnd = moment(date).add(30, 'minutes'); // Cada slot es de 30 minutos
              
              const hasEvent = events.some(event => {
                const eventStart = moment(event.start);
                const eventEnd = moment(event.end);
                
                // Verificar si el slot se superpone con el evento
                // El slot está ocupado si:
                // 1. El inicio del slot está dentro del evento, O
                // 2. El fin del slot está dentro del evento, O
                // 3. El slot contiene completamente el evento
                return (slotTime.isSameOrAfter(eventStart, 'minute') && slotTime.isBefore(eventEnd, 'minute')) ||
                       (slotEnd.isAfter(eventStart, 'minute') && slotEnd.isSameOrBefore(eventEnd, 'minute')) ||
                       (slotTime.isBefore(eventStart, 'minute') && slotEnd.isAfter(eventEnd, 'minute'));
              });
              
              return {
                className: hasEvent ? 'has-events' : '',
                style: hasEvent ? { 
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  borderLeft: '3px solid rgba(102, 126, 234, 0.5)'
                } : {}
              };
            }}
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
              noEventsInRange: 'No hay eventos en este rango.',
            }}
            formats={{
              eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
                // En la vista de semana, no mostrar el tiempo, solo el título
                return '';
              },
              eventTimeRangeStartFormat: ({ start }, culture, localizer) => {
                // No mostrar tiempo inicial
                return '';
              },
              eventTimeRangeEndFormat: ({ end }, culture, localizer) => {
                // No mostrar tiempo final
                return '';
              },
              timeGutterFormat: (date, culture, localizer) => {
                // Mostrar siempre las horas y medias horas
                return moment(date).format('HH:mm');
              },
              slotGroupHeaderFormat: (date, culture, localizer) => {
                // Formato para el encabezado de grupo de slots
                return moment(date).format('HH:mm');
              }
            }}
            tooltipAccessor={(event) =>
              `Paciente: ${event.paciente_nombre}\nDoctor: ${event.doctor_nombre}\nMotivo: ${event.motivo || event.title}`
            }
            titleAccessor={(event) => {
              // En todas las vistas, mostrar solo el nombre del paciente
              if (event.paciente_nombre) {
                return event.paciente_nombre;
              }
              // Si no hay paciente_nombre, intentar extraerlo del título
              if (event.title && event.title.includes(' - ')) {
                return event.title.split(' - ')[0];
              }
              return event.title || 'Sin nombre';
            }}
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 21, 0, 0)}
            components={{
              timeGutterHeader: TimeGutterHeader,
              timeSlotContent: TimeSlotContent,
              timeSlotWrapper: TimeSlotWrapper
            }}
            dayPropGetter={(date) => {
              const colorColumna = obtenerColorColumna(date);
              return {
                style: {
                  backgroundColor: colorColumna
                }
              };
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: '#667eea',
                borderColor: '#764ba2',
                borderRadius: '8px',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                fontSize: '13px',
                fontWeight: 500
              }
            })}
          />
        </div>
      </div>


      {modalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <div className="modal-header border-0" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px 25px'
              }}>
                <h5 className="modal-title mb-0" style={{ fontWeight: 600, fontSize: '20px' }}>
                  <i className="fas fa-calendar-plus me-2"></i>
                  {editando ? 'Editar Cita' : 'Nueva Cita'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={cerrarModal}
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <form onSubmit={(e) => handleSubmitEvent(e, editando ? 'actualizar' : 'guardar')}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                      <i className="fas fa-search me-2" style={{ color: '#667eea' }}></i>
                      Buscar Paciente
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={busqueda}
                      onChange={handleSearchPaciente}
                      disabled={editando}
                      placeholder="Escribe al menos 3 caracteres para buscar..."
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {resultadosPacientes.length > 0 && (
                      <div className="mt-2" style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: '#ffffff'
                      }}>
                        {resultadosPacientes.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => seleccionarPaciente(p)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#ffffff';
                            }}>
                            <strong>{p.nombre} {p.apellido}</strong>
                            <span className="text-muted ms-2" style={{ fontSize: '13px' }}> - {p.cedula}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {pacienteSeleccionado && (
                      <div className="mt-2 p-3" style={{
                        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                        borderRadius: '12px',
                        border: '2px solid #4caf50'
                      }}>
                        <i className="fas fa-check-circle me-2" style={{ color: '#4caf50' }}></i>
                        <strong>Paciente seleccionado:</strong> {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                      </div>
                    )}

                    {!editando && (
                      <div className="mt-3">
                        {!mostrarFormNuevoPaciente ? (
                          <button
                            type="button"
                            onClick={() => setMostrarFormNuevoPaciente(true)}
                            style={{
                              background: 'transparent',
                              color: '#667eea',
                              border: '2px dashed #667eea',
                              borderRadius: '12px',
                              padding: '10px 20px',
                              fontWeight: 600,
                              fontSize: '14px',
                              cursor: 'pointer',
                              width: '100%',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(102, 126, 234, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                            }}
                          >
                            <i className="fas fa-user-plus me-2"></i>
                            Agregar paciente nuevo (no registrado)
                          </button>
                        ) : (
                          <div className="p-3" style={{
                            background: '#f8f9fa',
                            borderRadius: '12px',
                            border: '2px solid #e0e0e0'
                          }}>
                            <h6 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
                              <i className="fas fa-user-plus me-2" style={{ color: '#667eea' }}></i>
                              Registro rápido de paciente
                            </h6>
                            <form onSubmit={guardarNuevoPaciente}>
                              <div className="row">
                                <div className="col-md-6 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Nombre *"
                                    value={datosNuevoPaciente.nombre}
                                    onChange={(e) => setDatosNuevoPaciente({ ...datosNuevoPaciente, nombre: e.target.value })}
                                    style={inputStyle}
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Apellido *"
                                    value={datosNuevoPaciente.apellido}
                                    onChange={(e) => setDatosNuevoPaciente({ ...datosNuevoPaciente, apellido: e.target.value })}
                                    style={inputStyle}
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Cédula (opcional)"
                                    value={datosNuevoPaciente.cedula}
                                    onChange={(e) => setDatosNuevoPaciente({ ...datosNuevoPaciente, cedula: e.target.value })}
                                    style={inputStyle}
                                  />
                                </div>
                                <div className="col-md-6 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Teléfono (opcional)"
                                    value={datosNuevoPaciente.telefono}
                                    onChange={(e) => setDatosNuevoPaciente({ ...datosNuevoPaciente, telefono: e.target.value })}
                                    style={inputStyle}
                                  />
                                </div>
                              </div>
                              <div className="d-flex mt-2" style={{ gap: '16px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMostrarFormNuevoPaciente(false);
                                    setDatosNuevoPaciente({ nombre: '', apellido: '', cedula: '', telefono: '' });
                                  }}
                                  style={{
                                    background: '#e0e0e0',
                                    color: '#495057',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 20px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  disabled={guardandoPaciente}
                                  style={{
                                    background: 'linear-gradient(135deg, #51d18a 0%, #3db870 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 20px',
                                    fontWeight: 600,
                                    cursor: guardandoPaciente ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {guardandoPaciente ? <><i className="fas fa-spinner fa-spin me-2"></i>Guardando...</> : <><i className="fas fa-save me-2"></i>Registrar y usar</>}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontWeight: 600, color: '#495057', fontSize: '14px', margin: 0 }}>
                        <i className="fas fa-comment-alt me-2" style={{ color: '#667eea' }}></i>
                        Motivo de la Cita
                      </label>
                      <button
                        type="button"
                        onClick={toggleDictarMotivo}
                        title={dictandoMotivo ? 'Detener dictado' : 'Dictar por voz'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          background: dictandoMotivo 
                            ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: dictandoMotivo ? '0 0 12px rgba(220,53,69,0.5)' : '0 2px 8px rgba(102, 126, 234, 0.3)',
                          animation: dictandoMotivo ? 'pulse 1.5s infinite' : 'none'
                        }}
                      >
                        <i className={`fas ${dictandoMotivo ? 'fa-stop' : 'fa-microphone'}`}></i>
                        {dictandoMotivo ? 'Detener' : 'Dictar'}
                      </button>
                    </div>
                    <textarea
                      style={{
                        ...inputStyle,
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Describe el motivo de la cita... o usa el botón Dictar para hablar."
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                        <i className="fas fa-clock me-2" style={{ color: '#667eea' }}></i>
                        Fecha y Hora de Inicio
                      </label>
                      <input
                        type="datetime-local"
                        style={inputStyle}
                        value={newEvent.start}
                        onChange={(e) => {
                          const nuevoStart = e.target.value;
                          const duracionMin = newEvent.start && newEvent.end ? moment(newEvent.end).diff(moment(newEvent.start), 'minutes') : 30;
                          const nuevoEnd = nuevoStart ? moment(nuevoStart).add(duracionMin, 'minutes').format('YYYY-MM-DDTHH:mm') : newEvent.end;
                          setNewEvent({ ...newEvent, start: nuevoStart, end: nuevoEnd });
                        }}
                        required
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                        <i className="fas fa-hourglass-half me-2" style={{ color: '#667eea' }}></i>
                        Duración
                      </label>
                      <select
                        style={inputStyle}
                        value={newEvent.start && newEvent.end ? moment(newEvent.end).diff(moment(newEvent.start), 'minutes') : 30}
                        onChange={(e) => {
                          const duracionMin = parseInt(e.target.value, 10);
                          const nuevoEnd = newEvent.start ? moment(newEvent.start).add(duracionMin, 'minutes').format('YYYY-MM-DDTHH:mm') : newEvent.end;
                          setNewEvent({ ...newEvent, end: nuevoEnd });
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        {(() => {
                          const duracionActual = newEvent.start && newEvent.end ? moment(newEvent.end).diff(moment(newEvent.start), 'minutes') : 30;
                          const opcionesStandard = [30, 60, 90, 120, 150, 180, 210, 240];
                          const incluirCustom = duracionActual > 0 && !opcionesStandard.includes(duracionActual);
                          return (
                            <>
                              <option value={30}>30 minutos</option>
                              <option value={60}>1 hora</option>
                              <option value={90}>1 hora 30 min</option>
                              <option value={120}>2 horas</option>
                              <option value={150}>2 horas 30 min</option>
                              <option value={180}>3 horas</option>
                              <option value={210}>3 horas 30 min</option>
                              <option value={240}>4 horas</option>
                              {incluirCustom && <option value={duracionActual}>{duracionActual} minutos</option>}
                            </>
                          );
                        })()}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4" style={{ background: '#f8f9fa' }}>
                  <div className="w-100 d-flex justify-content-end flex-wrap" style={{ gap: '20px' }}>
                    {editando && (
                      <>
                        <button 
                          type="button" 
                          className="btn"
                          onClick={eliminar_evento}
                          style={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 24px',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}>
                          <i className="fas fa-trash me-2"></i>Eliminar
                        </button>
                        <Link 
                          className='btn'
                          to={`/perfil_paciente/${ids_entidades.id_paciente}/${ids_entidades.id_doctor}`}
                          style={{
                            background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 24px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}>
                          <i className="fas fa-user me-2"></i>Ver Paciente
                        </Link>
                      </>
                    )}
                    <button 
                      type="button" 
                      className="btn"
                      onClick={cerrarModal}
                      style={{
                        background: '#e0e0e0',
                        color: '#495057',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 28px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#d0d0d0';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#e0e0e0';
                      }}>
                      <i className="fas fa-times me-2"></i>Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 32px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                      }}>
                      <i className="fas fa-save me-2"></i>
                      {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Agenda;