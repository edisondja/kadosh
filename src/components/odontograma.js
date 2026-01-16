import React, { useState, useRef, useEffect, useCallback} from "react";
import { Link ,useParams} from 'react-router-dom';
import Odontograma from '../odontograma.png';
import Core  from './funciones_extras';
import Axios from "axios";
import Alertify from "alertifyjs";
import alertify from "alertifyjs";


const OPCIONES_TRATAMIENTO = [
  { id: 1, nombre: "Resina", precio: 45.00, color: "blue" },
  { id: 2, nombre: "Caries", precio: 30.00, color: "red" },
  { id: 3, nombre: "Sellante", precio: 25.00, color: "green" },
  { id: 4, nombre: "Extracción", precio: 60.00, color: "black" },
  { id: 5, nombre: "Implante", precio: 250.00, color: "purple" },
  { id: 6, nombre: "Restauración", precio: 50.00, color: "blue" },
  { id: 7, nombre: "Restaurado por repetir", precio: 55.00, color: "blue-red" },
];

// Dientes de adultos (permanentes)
const PIEZAS_ADULTO = [
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
];

// Dientes de leche (deciduos) - numeración pediátrica
// Superior: 55, 54, 53, 52, 51 | 61, 62, 63, 64, 65
// Inferior: 85, 84, 83, 82, 81 | 71, 72, 73, 74, 75
const PIEZAS_NINO = [
  [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
];

// --- COMPONENTE PRINCIPAL ---
const OdontogramaCompletoHibrido = () => {


  const { id_paciente, id_doctor } = useParams();
  // === ESTADOS GENERALES ===
  const [presupuesto, setPresupuesto] = useState([]);
  const [seleccionCara, setSeleccionCara] = useState(null); // Para el odontograma cara a cara
  const [colorDibujo, setColorDibujo] = useState("red"); // Para el canvas principal
  const [dibujoGuardado, setDibujoGuardado] = useState(Odontograma); // Almacena el Data URL del canvas principal
  const [opciones_tratamiento, setOpcionesTratamiento] = useState([]);
  const [filtroProcedimientos, setFiltroProcedimientos] = useState(""); // Filtro de búsqueda
  const [facturarMarcadoRapido, setFacturarMarcadoRapido] = useState(false); // Si el marcado rápido debe facturarse
  const [tipoOdontograma, setTipoOdontograma] = useState("adulto"); // "adulto" o "nino"
  const [paciente, setPaciente] = useState({ nombre: '', apellido: '' });
  const [doctor, setDoctor] = useState({ nombre: '', apellido: '' });
  const [doctorIdValido, setDoctorIdValido] = useState(null);

  // === Lógica del CANVAS PRINCIPAL ===
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const presupuestoScrollRef = useRef(null);

  useEffect(() => {


    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Si hay un dibujo guardado, cárgalo
    if (dibujoGuardado) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = dibujoGuardado;
    } else {
      // Si no hay, limpia y dibuja las líneas de la boca
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Dibuja aquí la forma base de la arcada o una cuadrícula ligera si lo deseas
      // Ejemplo:
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.1, canvas.height * 0.5);
      ctx.bezierCurveTo(canvas.width * 0.3, canvas.height * 0.1, 
                         canvas.width * 0.7, canvas.height * 0.1, 
                         canvas.width * 0.9, canvas.height * 0.5);
      ctx.moveTo(canvas.width * 0.1, canvas.height * 0.5);
      ctx.bezierCurveTo(canvas.width * 0.3, canvas.height * 0.9, 
                         canvas.width * 0.7, canvas.height * 0.9, 
                         canvas.width * 0.9, canvas.height * 0.5);
      ctx.stroke();
    }
  }, [dibujoGuardado]); // Se ejecuta al inicio o cuando carga un dibujo guardado

  const startDrawing = useCallback(({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    isDrawing.current = true;
  }, []);

  const draw = useCallback(({ nativeEvent }) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = colorDibujo;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  }, [colorDibujo]);

  
  const GuargarOdontograma = useCallback(() => {
    // Convertir el canvas actual a Data URL
    const canvas = canvasRef.current;
    if (!canvas) {
      Alertify.error("Error: No se puede acceder al canvas.");
      return;
    }

    // Redimensionar el canvas si es muy grande para reducir el tamaño
    const maxWidth = 1200;
    const maxHeight = 800;
    let width = canvas.width;
    let height = canvas.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    // Crear un canvas temporal con el tamaño reducido
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, width, height);

    // Convertir el canvas a JPEG con calidad reducida para reducir el tamaño
    const dibujoActual = tempCanvas.toDataURL('image/jpeg', 0.6);
    
    // Preparar los detalles (procedimientos) en el formato que espera el backend
    const detalles = presupuesto.map(proc => ({
      diente: proc.diente,
      cara: proc.cara,
      tipo: proc.tipo || 'procedimiento',
      descripcion: proc.nombre || proc.descripcion || '',
      precio: proc.precio || 0,
      color: proc.color || null
    }));

    // Validar que los datos requeridos estén presentes y sean válidos
    const pacienteId = parseInt(id_paciente);
    // Usar el doctorId válido si está disponible, sino intentar con el de la URL
    const doctorId = doctorIdValido || parseInt(id_doctor);
    
    if (!id_paciente || pacienteId <= 0) {
      Alertify.error("Error: Debe seleccionar un paciente válido.");
      return;
    }
    
    if (!doctorId || doctorId <= 0) {
      Alertify.error("Error: No hay un doctor válido disponible. Por favor, agregue un doctor primero.");
      return;
    }

    const usuarioId = localStorage.getItem("id_usuario");
    
    Axios.post(`${Core.url_base}/api/crear_odontograma`, {
      id_paciente: pacienteId,
      id_doctor: doctorId,
      dibujo_odontograma: dibujoActual, // El dibujo del canvas como Data URL
      detalles: detalles.length > 0 ? detalles : [], // Los procedimientos seleccionados
      usuario_id: usuarioId // Para auditoría
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    }).then(response => {
      Alertify.success("Odontograma guardado correctamente.");
      // Redirigir a la lista de odontogramas del paciente
      window.location.href = `/ver_odontogramas/${id_paciente}`;
    }).catch(error => {
      console.error("Error al guardar:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Error desconocido";
      Alertify.error("Error al guardar el odontograma: " + errorMessage);
    });
  }, [id_paciente, id_doctor, presupuesto]);


  const cargarOpcionesTratamiento = useCallback(() => {
    Axios.get(`${Core.url_base}/api/cargar_procedimientos`).then(data=>{

        setOpcionesTratamiento(data.data);

    }).catch(error=>{
        Alertify.message("No se pudieron cargar las opciones de tratamiento");
        Alertify.message("Reconectando...");
        cargarOpcionesTratamiento();
    }

    );
  }, []);

  const cargarPaciente = useCallback(() => {
    if (id_paciente) {
      Axios.get(`${Core.url_base}/api/paciente/${id_paciente}`)
        .then(response => {
          setPaciente(response.data || { nombre: '', apellido: '' });
        })
        .catch(error => {
          console.error("Error al cargar paciente:", error);
        });
    }
  }, [id_paciente]);

  const cargarDatosDoctor = useCallback((doctorId) => {
    Axios.get(`${Core.url_base}/api/cargar_doctor/${doctorId}`)
      .then(response => {
        setDoctor(response.data || { nombre: '', apellido: '' });
        setDoctorIdValido(doctorId);
      })
      .catch(error => {
        console.error("Error al cargar doctor:", error);
      });
  }, []);

  const cargarPrimerDoctor = useCallback(() => {
    Axios.get(`${Core.url_base}/api/doctores`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          const primerDoctorId = response.data[0].id;
          setDoctorIdValido(primerDoctorId);
          cargarDatosDoctor(primerDoctorId);
        } else {
          Alertify.error("No hay doctores disponibles. Por favor, agregue un doctor primero.");
        }
      })
      .catch(error => {
        console.error("Error al cargar lista de doctores:", error);
        Alertify.error("Error al cargar los doctores disponibles.");
      });
  }, [cargarDatosDoctor]);

  const cargarDoctor = useCallback(() => {
    const doctorId = parseInt(id_doctor);
    
    // Si el id_doctor es 0 o inválido, buscar un doctor válido
    if (!doctorId || doctorId <= 0) {
      // Intentar obtener el doctor del último odontograma del paciente
      Axios.get(`${Core.url_base}/api/listar_odontogramas_paciente/${id_paciente}`)
        .then(response => {
          if (response.data && response.data.length > 0 && response.data[0].doctor_id) {
            const ultimoDoctorId = response.data[0].doctor_id;
            setDoctorIdValido(ultimoDoctorId);
            cargarDatosDoctor(ultimoDoctorId);
          } else {
            // Si no hay odontogramas previos, obtener el primer doctor disponible
            cargarPrimerDoctor();
          }
        })
        .catch(() => {
          // Si falla, obtener el primer doctor disponible
          cargarPrimerDoctor();
        });
    } else {
      // Si el id_doctor es válido, usarlo
      setDoctorIdValido(doctorId);
      cargarDatosDoctor(doctorId);
    }
  }, [id_doctor, id_paciente, cargarDatosDoctor, cargarPrimerDoctor]);

  // Configurar Alertify para notificaciones blancas (solo una vez)
  useEffect(() => {
    if (typeof Alertify !== 'undefined' && !document.getElementById('alertify-white-theme')) {
      Alertify.set('notifier', 'position', 'top-right');
      // Configurar estilos personalizados para notificaciones blancas
      const style = document.createElement('style');
      style.id = 'alertify-white-theme';
      style.textContent = `
        .alertify-notifier .ajs-message.ajs-success {
          background: white !important;
          color: #28a745 !important;
          border: 2px solid #28a745 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-weight: 500 !important;
        }
        .alertify-notifier .ajs-message.ajs-error {
          background: white !important;
          color: #dc3545 !important;
          border: 2px solid #dc3545 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-weight: 500 !important;
        }
        .alertify-notifier .ajs-message.ajs-warning {
          background: white !important;
          color: #ffc107 !important;
          border: 2px solid #ffc107 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-weight: 500 !important;
        }
        .alertify-notifier .ajs-message {
          background: white !important;
          color: #333 !important;
          border: 2px solid #ddd !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-weight: 500 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    cargarOpcionesTratamiento();
    cargarPaciente();
    cargarDoctor();
  }, [cargarOpcionesTratamiento, cargarPaciente, cargarDoctor]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && seleccionCara) {
        setSeleccionCara(null);
        setFiltroProcedimientos("");
      }
    };
    
    if (seleccionCara) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [seleccionCara]);

  // Preservar la posición del scroll cuando cambia el tipo de odontograma
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    // Guardar la posición actual del scroll antes del cambio
    if (presupuestoScrollRef.current) {
      scrollPositionRef.current = presupuestoScrollRef.current.scrollTop;
    }
  }, [tipoOdontograma]);

  // Restaurar la posición del scroll después del render
  useEffect(() => {
    if (presupuestoScrollRef.current && scrollPositionRef.current > 0) {
      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      requestAnimationFrame(() => {
        if (presupuestoScrollRef.current) {
          presupuestoScrollRef.current.scrollTop = scrollPositionRef.current;
        }
      });
    }
  }, [tipoOdontograma, presupuesto]);

  const endDrawing = useCallback(() => {
    isDrawing.current = false;
    // Guardar el estado del canvas para poder cargarlo si se limpia
    setDibujoGuardado(canvasRef.current.toDataURL());
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDibujoGuardado(""); // Limpiar dibujo guardado
  }, []);

  // === Lógica del ODONTOGRAMA CARA A CARA ===
  // Función para reproducir sonido de click
  const reproducirSonidoClick = () => {
    try {
      // Crear un contexto de audio para generar un beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frecuencia del beep
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Si falla el audio, no hacer nada (silencioso)
      console.log('Audio no disponible');
    }
  };

  const handleCaraClick = (diente, cara, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Reproducir sonido de click
    reproducirSonidoClick();
    setSeleccionCara({ diente, cara });
  };

  const agregarProcedimiento = (proc, facturar = true) => {
    const nuevo = { 
      ...proc, 
      diente: seleccionCara.diente, 
      id_doctor:1,
      id_paciente:2,
      cara: seleccionCara.cara, 
      tipo: "procedimiento", 
      precio: facturar ? (proc.precio || 0) : 0, // Si no se factura, precio es 0
      tempId: Date.now() 
    };
    setPresupuesto([...presupuesto, nuevo]);
    setSeleccionCara(null); 
    setFiltroProcedimientos(""); // Limpiar filtro al agregar
  };

  // Función para agregar solo color sin procedimiento
  const agregarSoloColor = (color, nombreColor) => {
    if (!seleccionCara) return;
    
    // Crear un "procedimiento" ficticio solo con el color, sin precio
    const marcadoSoloColor = {
      diente: seleccionCara.diente,
      cara: seleccionCara.cara,
      color: color,
      nombre: nombreColor,
      tipo: "marcado_color",
      precio: 0, // Siempre precio 0 para solo color
      tempId: Date.now()
    };
    
    // Eliminar cualquier marcado previo en la misma cara
    const presupuestoActualizado = presupuesto.filter(
      p => !(p.diente === seleccionCara.diente && p.cara === seleccionCara.cara)
    );
    
    setPresupuesto([...presupuestoActualizado, marcadoSoloColor]);
    setSeleccionCara(null);
    setFiltroProcedimientos("");
    Alertify.success(`Color ${nombreColor} aplicado (sin facturar)`);
  };

    

  const total = presupuesto.reduce((acc, item) => acc + item.precio, 0);

  const DienteCaraACara = ({ num }) => {
    const getColor = (c) => {
      const found = presupuesto.find(p => p.diente === num && p.cara === c);
      if (!found) return "white";
      // Si el color es "blue-red", retornamos un gradiente especial
      if (found.color === "blue-red") {
        return `url(#blueRedGradient-${num})`;
      }
      return found.color;
    };

    const isSelected = (c) => {
      return seleccionCara && seleccionCara.diente === num && seleccionCara.cara === c;
    };

    const getStrokeColor = (c) => {
      if (isSelected(c)) {
        return "#FF0000"; // Rojo para la selección
      }
      return "#666";
    };

    const getStrokeWidth = (c) => {
      return isSelected(c) ? 3 : 1;
    };

    // Verificar si alguna cara tiene el color especial "blue-red"
    const tieneBlueRed = presupuesto.some(p => p.diente === num && p.color === "blue-red");
    const gradientId = `blueRedGradient-${num}`;
    
    return (
      <div className="text-center" style={{ width: "42px", display: "inline-block" }}>
        <div className="small font-weight-bold text-muted mb-1">{num}</div>
        <svg viewBox="0 0 100 100" width="36" height="36" style={{ cursor: "pointer" }}>
          {/* Definir gradiente para blue-red si es necesario */}
          {tieneBlueRed && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#0066ff", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#0066ff", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#ff0000", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#ff0000", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          )}
          <polygon 
            points="0,0 100,0 75,25 25,25" 
            fill={getColor("V")} 
            stroke={getStrokeColor("V")} 
            strokeWidth={getStrokeWidth("V")}
            onClick={(e) => handleCaraClick(num, "V", e)}
            style={{ transition: 'all 0.2s ease' }}
          />
          <polygon 
            points="25,75 75,75 100,100 0,100" 
            fill={getColor("L")} 
            stroke={getStrokeColor("L")} 
            strokeWidth={getStrokeWidth("L")}
            onClick={(e) => handleCaraClick(num, "L", e)}
            style={{ transition: 'all 0.2s ease' }}
          />
          <polygon 
            points="0,0 25,25 25,75 0,100" 
            fill={getColor("M")} 
            stroke={getStrokeColor("M")} 
            strokeWidth={getStrokeWidth("M")}
            onClick={(e) => handleCaraClick(num, "M", e)}
            style={{ transition: 'all 0.2s ease' }}
          />
          <polygon 
            points="100,0 100,100 75,75 75,25" 
            fill={getColor("D")} 
            stroke={getStrokeColor("D")} 
            strokeWidth={getStrokeWidth("D")}
            onClick={(e) => handleCaraClick(num, "D", e)}
            style={{ transition: 'all 0.2s ease' }}
          />
          <rect 
            x="25" 
            y="25" 
            width="50" 
            height="50" 
            fill={getColor("O")} 
            stroke={getStrokeColor("O")} 
            strokeWidth={getStrokeWidth("O")}
            onClick={(e) => handleCaraClick(num, "O", e)}
            style={{ transition: 'all 0.2s ease' }}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="container-fluid pt-2">
      {/* HEADER INFO */}
      <div className="card shadow-sm mb-3 border-left border-primary" style={{ borderLeftWidth: '5px' }}>
        <div className="card-body py-2">
          <div className="row">
            <div className="col-md-6 border-right">
              <label className="small font-weight-bold text-uppercase text-muted mb-0">Paciente</label>
              <div className="h5 font-weight-bold mb-0 text-dark">
                {paciente.nombre || 'Cargando...'} {paciente.apellido || ''}
              </div>
            </div>
            <div className="col-md-6">
              <label className="small font-weight-bold text-uppercase text-muted mb-0">Médico</label>
              <div className="h5 text-primary mb-0">
                {doctor.nombre ? `Dr. ${doctor.nombre} ${doctor.apellido || ''}` : 'Cargando...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <br /><br />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="font-weight-bold text-dark mb-0 border-bottom pb-2" style={{ flex: 1 }}>Creación de Odontograma</h4>
        <Link 
          to={`/ver_odontogramas/${id_paciente}`}
          className="btn btn-secondary ml-3"
          style={{
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}
        >
          <i className="fas fa-arrow-left me-2"></i>Volver
        </Link>
      </div>

      <div className="row">
        {/* COLUMNA PRINCIPAL (ODONTOGRAMAS) */}
        <div className="col-lg-8" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
          {/* SELECTOR DE TIPO DE ODONTOGRAMA */}
            <div className="card shadow-lg border-0 mb-4" style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                overflow: 'hidden'
              }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="mb-3 mb-md-0">
                  <h6 className="font-weight-bold mb-1" style={{ 
                    color: '#2c3e50',
                    fontSize: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <i className="fas fa-teeth me-2" style={{ color: '#667eea' }}></i>
                    Tipo de Odontograma
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                    Seleccione el tipo de dentición
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    onClick={() => setTipoOdontograma("adulto")}
                    style={{
                      background: tipoOdontograma === "adulto" 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'white',
                      color: tipoOdontograma === "adulto" ? 'white' : '#667eea',
                      border: tipoOdontograma === "adulto" ? 'none' : '2px solid #667eea',
                      borderRadius: '12px',
                      padding: '14px 28px',
                      fontWeight: '600',
                      fontSize: '15px',
                      boxShadow: tipoOdontograma === "adulto" 
                        ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: '160px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (tipoOdontograma !== "adulto") {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tipoOdontograma !== "adulto") {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <i className="fas fa-user" style={{ fontSize: '18px' }}></i>
                    <span>Adulto</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipoOdontograma("nino")}
                    style={{
                      background: tipoOdontograma === "nino" 
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                        : 'white',
                      color: tipoOdontograma === "nino" ? 'white' : '#f5576c',
                      border: tipoOdontograma === "nino" ? 'none' : '2px solid #f5576c',
                      borderRadius: '12px',
                      padding: '14px 28px',
                      fontWeight: '600',
                      fontSize: '15px',
                      boxShadow: tipoOdontograma === "nino" 
                        ? '0 4px 15px rgba(245, 87, 108, 0.4)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: '200px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (tipoOdontograma !== "nino") {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tipoOdontograma !== "nino") {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <i className="fas fa-child" style={{ fontSize: '18px' }}></i>
                    <span>Niño (Dientes de Leche)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ODONTOGRAMA CARA A CARA */}
          <div className="card shadow-sm p-4 bg-white text-center mb-4">
            <h6 className="font-weight-bold text-secondary mb-3">
              {tipoOdontograma === "nino" ? "Marcado de Caras Dentales - Dientes de Leche" : "Marcado de Caras Dentales"}
            </h6>
            <div className="mb-5">
              {(tipoOdontograma === "nino" ? PIEZAS_NINO[0] : PIEZAS_ADULTO[0]).map(n => (
                <DienteCaraACara key={n} num={n} />
              ))}
            </div>
            <div className="mt-4">
              {(tipoOdontograma === "nino" ? PIEZAS_NINO[1] : PIEZAS_ADULTO[1]).map(n => (
                <DienteCaraACara key={n} num={n} />
              ))}
            </div>
          </div>

          {/* MODAL DE SELECCIÓN DE PROCEDIMIENTOS */}
          {seleccionCara && (
            <div 
              className="modal fade show" 
              style={{ 
                display: 'block', 
                backgroundColor: 'rgba(0,0,0,0.6)',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1050,
                overflow: 'auto'
              }}
              tabIndex="-1"
              role="dialog"
              onClick={(e) => {
                // Cerrar modal si se hace clic fuera del contenido
                if (e.target === e.currentTarget) {
                  setSeleccionCara(null);
                  setFiltroProcedimientos("");
                }
              }}
            >
              <div 
                className="modal-dialog modal-dialog-centered modal-lg" 
                role="document"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content shadow-lg" style={{ borderRadius: '16px', border: 'none' }}>
                  {/* Header del Modal */}
                  <div 
                    className="modal-header text-white" 
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '16px 16px 0 0',
                      border: 'none',
                      padding: '20px 30px'
                    }}
                  >
                    <h5 className="modal-title font-weight-bold" style={{ fontSize: '20px' }}>
                      <i className="fas fa-tooth me-2"></i>
                      Diente {seleccionCara.diente} - Cara {seleccionCara.cara}
                    </h5>
                    <button 
                      type="button" 
                      className="close text-white" 
                      onClick={() => {
                        setSeleccionCara(null);
                        setFiltroProcedimientos("");
                      }}
                      style={{ 
                        fontSize: '28px',
                        fontWeight: '300',
                        opacity: 0.9,
                        textShadow: 'none'
                      }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>

                  {/* Body del Modal */}
                  <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Paleta de opciones rápidas */}
                    <div className="mb-4 pb-3 border-bottom">
                      <label className="form-label mb-2 d-block" style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
                        <i className="fas fa-palette me-2 text-primary"></i>Marcado Rápido:
                      </label>
                      <small className="text-muted d-block mb-3" style={{ fontSize: '12px' }}>
                        <strong>Azul:</strong> Solo para marcar trabajo realizado por otros (sin facturar). 
                        <strong className="ml-2">Azul/Rojo:</strong> Restaurado por repetir.
                      </small>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn"
                          style={{
                            background: 'linear-gradient(135deg, #0066ff 0%, #0066ff 50%, #ff0000 50%, #ff0000 100%)',
                            color: 'white',
                            border: '2px solid #333',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                          }}
                          onClick={() => {
                            agregarSoloColor('blue-red', 'Restaurado por repetir');
                          }}
                          title="Marcar como Restaurado por repetir (Azul y Rojo)"
                        >
                          <i className="fas fa-paint-brush me-2"></i>Restaurado (Azul/Rojo)
                        </button>
                        <button
                          className="btn"
                          style={{
                            background: '#0066ff',
                            color: 'white',
                            border: '2px solid #0044cc',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                            e.target.style.background = '#0052cc';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                            e.target.style.background = '#0066ff';
                          }}
                          onClick={() => {
                            // Restauración azul es solo para marcar trabajo por otros (sin facturar)
                            agregarSoloColor('blue', 'Restauración');
                          }}
                          title="Marcar como Restauración (Azul) - Trabajo por otros (sin facturar)"
                        >
                          <i className="fas fa-tooth me-2"></i>Restauración (Azul)
                        </button>
                      </div>
                      <div className="form-check mt-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="facturarMarcadoRapido"
                          checked={facturarMarcadoRapido}
                          onChange={(e) => setFacturarMarcadoRapido(e.target.checked)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                        <label className="form-check-label" htmlFor="facturarMarcadoRapido" style={{ fontSize: '13px', cursor: 'pointer', color: '#495057', marginLeft: '8px' }}>
                          <i className="fas fa-dollar-sign me-1"></i>Facturar procedimientos (solo aplica si eliges "Con Procedimiento")
                        </label>
                      </div>
                    </div>

                    {/* Lista de procedimientos filtrados mejorada */}
                    <div>
                      <label className="form-label mb-2 d-block" style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
                        <i className="fas fa-list me-2 text-primary"></i>Procedimientos Disponibles:
                        <span className="badge badge-primary ml-2" style={{ fontSize: '12px' }}>
                          {opciones_tratamiento.filter(o => 
                            o.nombre.toLowerCase().includes(filtroProcedimientos.toLowerCase())
                          ).length} encontrados
                        </span>
                      </label>
                      {/* Campo de búsqueda */}
                      <div className="mb-3">
                        <div className="input-group input-group-lg">
                          <div className="input-group-prepend">
                            <span className="input-group-text bg-light border-right-0" style={{ borderRadius: '10px 0 0 10px' }}>
                              <i className="fas fa-search text-muted"></i>
                            </span>
                          </div>
                          <input
                            type="text"
                            className="form-control border-left-0"
                            placeholder="Escribe para filtrar procedimientos..."
                            value={filtroProcedimientos}
                            onChange={(e) => setFiltroProcedimientos(e.target.value)}
                            style={{ 
                              fontSize: '15px',
                              borderRadius: '0 10px 10px 0',
                              borderLeft: 'none'
                            }}
                            autoFocus
                          />
                          {filtroProcedimientos && (
                            <div className="input-group-append">
                              <button
                                className="btn btn-outline-secondary border-left-0"
                                type="button"
                                onClick={() => setFiltroProcedimientos("")}
                                style={{ 
                                  fontSize: '14px', 
                                  padding: '8px 15px',
                                  borderRadius: '0 10px 10px 0'
                                }}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                        {opciones_tratamiento
                          .filter(o => 
                            o.nombre.toLowerCase().includes(filtroProcedimientos.toLowerCase())
                          )
                          .length === 0 ? (
                          <div className="text-center text-muted py-5" style={{ fontSize: '14px' }}>
                            <i className="fas fa-search fa-2x mb-3" style={{ opacity: 0.3 }}></i>
                            <p className="mb-0">No se encontraron procedimientos</p>
                            <small>Intenta con otro término de búsqueda</small>
                          </div>
                        ) : (
                          <div className="p-2">
                            {opciones_tratamiento
                              .filter(o => 
                                o.nombre.toLowerCase().includes(filtroProcedimientos.toLowerCase())
                              )
                              .map(o => (
                              <button 
                                key={o.id}
                                className="btn btn-outline-primary btn-block text-left mb-2 d-flex justify-content-between align-items-center"
                                style={{ 
                                  fontSize: '14px', 
                                  padding: '12px 16px',
                                  borderRadius: '10px',
                                  borderColor: o.color === 'blue' ? '#0066ff' : o.color === 'red' ? '#ff0000' : o.color === 'blue-red' ? '#666' : '#667eea',
                                  borderWidth: o.color === 'blue-red' ? '2px' : '1.5px',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateX(5px)';
                                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateX(0)';
                                  e.target.style.boxShadow = 'none';
                                }}
                                onClick={() => agregarProcedimiento(o)}
                              >
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                  <i className="fas fa-check-circle me-2" style={{ fontSize: '12px', opacity: 0.6 }}></i>
                                  {o.nombre}
                                </span>
                                <span 
                                  className="badge font-weight-bold" 
                                  style={{ 
                                    fontSize: '13px',
                                    background: o.color === 'blue' ? '#0066ff' : o.color === 'red' ? '#ff0000' : '#667eea',
                                    padding: '6px 12px',
                                    borderRadius: '8px'
                                  }}
                                >
                                  ${o.precio.toFixed(2)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer del Modal */}
                  <div 
                    className="modal-footer border-top"
                    style={{ 
                      padding: '15px 30px',
                      borderRadius: '0 0 16px 16px',
                      background: '#f8f9fa'
                    }}
                  >
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setSeleccionCara(null);
                        setFiltroProcedimientos("");
                      }}
                      style={{
                        borderRadius: '10px',
                        padding: '10px 25px',
                        fontWeight: '600'
                      }}
                    >
                      <i className="fas fa-times me-2"></i>Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ODONTOGRAMA DIBUJABLE (CANVAS GRANDE) */}
          <div className="card shadow-sm p-4 bg-white mb-3">
            <h6 className="font-weight-bold text-secondary mb-3">Notas y Marcadores Visuales</h6>
            <div className="d-flex justify-content-around align-items-center mb-3">
                <span className="font-weight-bold small mr-2">Color del Lápiz:</span>
                <button className={`btn btn-sm ${colorDibujo === 'red' ? 'btn-danger' : 'btn-outline-danger'}`} 
                        onClick={() => setColorDibujo("red")}>🔴</button>
                <button className={`btn btn-sm ${colorDibujo === 'blue' ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => setColorDibujo("blue")}>🔵</button>
                <button className={`btn btn-sm ${colorDibujo === 'green' ? 'btn-success' : 'btn-outline-success'}`} 
                        onClick={() => setColorDibujo("green")}>🟢</button>
                <button className={`btn btn-sm ${colorDibujo === 'black' ? 'btn-dark' : 'btn-outline-dark'}`} 
                        onClick={() => setColorDibujo("black")}>⚫</button>
                <button className="btn btn-sm btn-outline-secondary ml-3" onClick={clearCanvas}>
                    <i className="fa fa-eraser"></i> Borrar Todo
                </button>
            </div>
            <canvas
              ref={canvasRef}
              width={650} // Ancho del canvas
              height={350} // Alto del canvas
              style={{ border: '1px solid #ccc', cursor: 'crosshair', touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          </div>
        </div>

        {/* LISTA DE EVOLUCIÓN (DERECHA) */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-black font-weight-bold py-2">
              Resumen del Plan
            </div>
            <div 
              ref={presupuestoScrollRef}
              className="card-body p-0" 
              style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
            >
              <table className="table table-sm table-hover mb-0">
                <thead className="thead-light small">
                  <tr>
                    <th className="pl-3">PIEZA</th>
                    <th>TRATAMIENTO</th>
                    <th className="text-right pr-3">PRECIO</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {presupuesto.map(item => (
                    <tr key={item.tempId}>
                      <td className="font-weight-bold pl-3">{item.diente}-{item.cara}</td>
                      <td>{item.nombre}</td>
                      <td className="text-right pr-3 font-weight-bold text-primary">${item.precio.toFixed(2)}</td>
                    </tr>
                  ))}
                  {presupuesto.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-5 text-muted italic">Toque un diente para iniciar el registro</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-white border-top">
              <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <span className="font-weight-bold text-muted">TOTAL:</span>
                <span className="h4 font-weight-bold text-success mb-0">${total.toFixed(2)}</span>
              </div>
              <button 
                className="btn btn-primary btn-block font-weight-bold py-3 shadow"
                onClick={GuargarOdontograma}
              >
                💾 GUARDAR REGISTRO CLÍNICO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OdontogramaCompletoHibrido;