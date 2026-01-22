import React, { useState, useRef, useEffect, useCallback} from "react";
import { Link ,useParams} from 'react-router-dom';
import Odontograma from '../odontograma.jpeg';
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
  const [piezaAnimada, setPiezaAnimada] = useState(null); // Para animar la pieza clickeada
  const [piezaConImpacto, setPiezaConImpacto] = useState(null); // Para animación de impacto al agregar procedimiento/color
  const [imagenOdontograma, setImagenOdontograma] = useState(null); // Para almacenar la imagen cargada
  const [historialSuperior, setHistorialSuperior] = useState([]); // Historial de estados del canvas superior
  const [historialInferior, setHistorialInferior] = useState([]); // Historial de estados del canvas inferior

  // === Lógica de los CANVAS ===
  const canvasSuperiorRef = useRef(null);
  const canvasInferiorRef = useRef(null);
  const isDrawingSuperior = useRef(false);
  const isDrawingInferior = useRef(false);
  const presupuestoScrollRef = useRef(null);



  // Función helper para obtener coordenadas correctas del canvas
  const getCanvasCoordinates = useCallback((canvas, event) => {
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    // Manejar eventos táctiles
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } 
    // Manejar eventos de mouse
    else if (event.clientX !== undefined && event.clientY !== undefined) {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    // Fallback a offsetX/offsetY si están disponibles
    else if (event.offsetX !== undefined && event.offsetY !== undefined) {
      return {
        x: event.offsetX * scaleX,
        y: event.offsetY * scaleY
      };
    } else {
      return { x: 0, y: 0 };
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  // Guardar estado del canvas antes de dibujar
  const guardarEstadoCanvas = useCallback((canvas, esSuperior) => {
    if (!canvas) return;
    const estado = canvas.toDataURL('image/png');
    if (esSuperior) {
      setHistorialSuperior(prev => [...prev, estado]);
    } else {
      setHistorialInferior(prev => [...prev, estado]);
    }
  }, []);

  // Función para deshacer el último trazo
  const deshacerUltimoTrazo = useCallback((esSuperior) => {
    const canvas = esSuperior ? canvasSuperiorRef.current : canvasInferiorRef.current;
    const historial = esSuperior ? historialSuperior : historialInferior;
    
    if (!canvas || historial.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const estadoAnterior = historial[historial.length - 1];
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Remover el último estado del historial
      if (esSuperior) {
        setHistorialSuperior(prev => prev.slice(0, -1));
      } else {
        setHistorialInferior(prev => prev.slice(0, -1));
      }
    };
    img.src = estadoAnterior;
  }, [historialSuperior, historialInferior]);

  // Función para deshacer en el canvas activo (el último que se dibujó)
  const deshacer = useCallback(() => {
    // Intentar deshacer en ambos canvas, empezando por el que tenga historial
    if (historialSuperior.length > 0) {
      deshacerUltimoTrazo(true);
    } else if (historialInferior.length > 0) {
      deshacerUltimoTrazo(false);
    }
  }, [historialSuperior, historialInferior, deshacerUltimoTrazo]);

  // Funciones para dibujar en canvas superior
  const startDrawingSuperior = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasSuperiorRef.current;
    if (!canvas) return;
    
    // Guardar estado antes de empezar a dibujar
    guardarEstadoCanvas(canvas, true);
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isDrawingSuperior.current = true;
  }, [getCanvasCoordinates, guardarEstadoCanvas]);

  const drawSuperior = useCallback((e) => {
    if (!isDrawingSuperior.current) return;
    e.preventDefault();
    const canvas = canvasSuperiorRef.current;
    if (!canvas) return;
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = colorDibujo;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [colorDibujo, getCanvasCoordinates]);

  const endDrawingSuperior = useCallback((e) => {
    if (e) e.preventDefault();
    isDrawingSuperior.current = false;
  }, []);

  // Funciones para dibujar en canvas inferior
  const startDrawingInferior = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasInferiorRef.current;
    if (!canvas) return;
    
    // Guardar estado antes de empezar a dibujar
    guardarEstadoCanvas(canvas, false);
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isDrawingInferior.current = true;
  }, [getCanvasCoordinates, guardarEstadoCanvas]);

  const drawInferior = useCallback((e) => {
    if (!isDrawingInferior.current) return;
    e.preventDefault();
    const canvas = canvasInferiorRef.current;
    if (!canvas) return;
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = colorDibujo;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [colorDibujo, getCanvasCoordinates]);

  const endDrawingInferior = useCallback((e) => {
    if (e) e.preventDefault();
    isDrawingInferior.current = false;
  }, []);

  
  const GuargarOdontograma = useCallback(() => {
    // Combinar ambos canvas (superior e inferior) en uno solo
    const canvasSuperior = canvasSuperiorRef.current;
    const canvasInferior = canvasInferiorRef.current;
    
    if (!canvasSuperior || !canvasInferior) {
      Alertify.error("Error: No se puede acceder a los canvas.");
      return;
    }

    // Crear un canvas combinado
    const combinedWidth = Math.max(canvasSuperior.width, canvasInferior.width);
    const combinedHeight = canvasSuperior.height + canvasInferior.height;
    
    // Redimensionar si es muy grande
    const maxWidth = 1200;
    const maxHeight = 800;
    let finalWidth = combinedWidth;
    let finalHeight = combinedHeight;
    
    if (finalWidth > maxWidth || finalHeight > maxHeight) {
      const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
      finalWidth = finalWidth * ratio;
      finalHeight = finalHeight * ratio;
    }

    // Crear canvas temporal para la imagen combinada
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = finalWidth;
    tempCanvas.height = finalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Dibujar canvas superior escalado
    const superiorHeight = (canvasSuperior.height / combinedHeight) * finalHeight;
    tempCtx.drawImage(canvasSuperior, 0, 0, finalWidth, superiorHeight);
    
    // Dibujar canvas inferior escalado
    const inferiorHeight = (canvasInferior.height / combinedHeight) * finalHeight;
    tempCtx.drawImage(canvasInferior, 0, superiorHeight, finalWidth, inferiorHeight);

    // Convertir el canvas combinado a JPEG con calidad reducida
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
      // Reproducir sonido de logro al guardar el odontograma
      reproducirSonidoLogro();
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

  // Configurar Alertify para que alertify.message tenga fondo blanco (solo una vez)
  useEffect(() => {
    if (typeof Alertify !== 'undefined' && !document.getElementById('alertify-white-theme')) {
      Alertify.set('notifier', 'position', 'top-right');
      // Configurar estilos personalizados para alertify.message con fondo blanco
      const style = document.createElement('style');
      style.id = 'alertify-white-theme';
      style.textContent = `
        .alertify-notifier .ajs-message {
          background: white !important;
          color: #333 !important;
          border: 1px solid #ddd !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-weight: 500 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Cargar la imagen del odontograma y dibujarla en los canvas
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImagenOdontograma(img);
      
      // Dibujar mitad superior en canvas superior
      const canvasSuperior = canvasSuperiorRef.current;
      if (canvasSuperior) {
        const ctx = canvasSuperior.getContext('2d');
        // Establecer el tamaño del canvas igual a la mitad de la imagen
        canvasSuperior.width = img.width;
        canvasSuperior.height = img.height / 2;
        // Dibujar solo la mitad superior de la imagen (sourceY=0, sourceHeight=height/2)
        ctx.drawImage(
          img, 
          0, 0, img.width, img.height / 2,  // Source: desde (0,0) hasta (width, height/2)
          0, 0, img.width, img.height / 2   // Destination: todo el canvas
        );
      }
      
      // Dibujar mitad inferior en canvas inferior
      const canvasInferior = canvasInferiorRef.current;
      if (canvasInferior) {
        const ctx = canvasInferior.getContext('2d');
        // Establecer el tamaño del canvas igual a la mitad de la imagen
        canvasInferior.width = img.width;
        canvasInferior.height = img.height / 2;
        // Dibujar solo la mitad inferior de la imagen (sourceY=height/2, sourceHeight=height/2)
        ctx.drawImage(
          img, 
          0, img.height / 2, img.width, img.height / 2,  // Source: desde (0, height/2) hasta (width, height)
          0, 0, img.width, img.height / 2                 // Destination: todo el canvas
        );
      }
    };
    img.src = Odontograma;
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

  // Soporte para Ctrl+Z para deshacer
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z o Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historialSuperior.length > 0 || historialInferior.length > 0) {
          deshacer();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [historialSuperior, historialInferior, deshacer]);

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


  const clearCanvas = useCallback(() => {
    // Limpiar canvas superior
    if (canvasSuperiorRef.current) {
      const ctx = canvasSuperiorRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasSuperiorRef.current.width, canvasSuperiorRef.current.height);
      // Redibujar la imagen base si existe
      if (imagenOdontograma) {
        ctx.drawImage(
          imagenOdontograma, 
          0, 0, imagenOdontograma.width, imagenOdontograma.height / 2,
          0, 0, imagenOdontograma.width, imagenOdontograma.height / 2
        );
      }
    }
    // Limpiar canvas inferior
    if (canvasInferiorRef.current) {
      const ctx = canvasInferiorRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasInferiorRef.current.width, canvasInferiorRef.current.height);
      // Redibujar la imagen base si existe
      if (imagenOdontograma) {
        ctx.drawImage(
          imagenOdontograma, 
          0, imagenOdontograma.height / 2, imagenOdontograma.width, imagenOdontograma.height / 2,
          0, 0, imagenOdontograma.width, imagenOdontograma.height / 2
        );
      }
    }
    // Limpiar historiales
    setHistorialSuperior([]);
    setHistorialInferior([]);
    setDibujoGuardado(""); // Limpiar dibujo guardado
  }, [imagenOdontograma]);

  // === Lógica del ODONTOGRAMA CARA A CARA ===
  // Función para reproducir sonido de kick suave con bajo al hacer clic en piezas
  const reproducirSonidoMetalico = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear osciladores para el kick - más frecuencias para mejor audibilidad en laptop
      const oscBajo = audioContext.createOscillator();
      const oscMedio = audioContext.createOscillator();
      const oscAlto = audioContext.createOscillator(); // Agregar frecuencia más alta para laptops
      const gainNode = audioContext.createGain();
      
      // Conectar osciladores al gain
      oscBajo.connect(gainNode);
      oscMedio.connect(gainNode);
      oscAlto.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Frecuencias ajustadas para mejor audibilidad en laptop
      oscBajo.frequency.value = 80; // Bajo más audible
      oscMedio.frequency.value = 150; // Cuerpo del kick más presente
      oscAlto.frequency.value = 250; // Frecuencia alta para percusión clara en laptops
      
      // Usar tipo 'sine' para sonido más suave y redondeado
      oscBajo.type = 'sine';
      oscMedio.type = 'sine';
      oscAlto.type = 'sine';
      
      // Envolvente más fuerte para mejor audibilidad
      const now = audioContext.currentTime;
      // Ataque rápido y fuerte, decay más largo
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.6, now + 0.01); // Ataque más fuerte
      gainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.05); // Decay medio más alto
      gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.08); // Release más audible
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25); // Fade out suave
      
      // Modulación de frecuencia para efecto de kick más natural
      oscBajo.frequency.setValueAtTime(80, now);
      oscBajo.frequency.exponentialRampToValueAtTime(50, now + 0.05);
      
      oscMedio.frequency.setValueAtTime(150, now);
      oscMedio.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      
      oscAlto.frequency.setValueAtTime(250, now);
      oscAlto.frequency.exponentialRampToValueAtTime(180, now + 0.05);
      
      oscBajo.start(now);
      oscMedio.start(now);
      oscAlto.start(now);
      oscBajo.stop(now + 0.25);
      oscMedio.stop(now + 0.25);
      oscAlto.stop(now + 0.25);
    } catch (error) {
      console.log('Audio no disponible');
    }
  };

  // Función para reproducir sonido adicional (click/pop)
  const reproducirSonidoClick = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sonido de click/pop más agudo
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      oscillator.start(now);
      oscillator.stop(now + 0.08);
    } catch (error) {
      console.log('Audio no disponible');
    }
  };

  // Función para reproducir sonido de logro/éxito
  const reproducirSonidoLogro = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear una secuencia de notas ascendentes para sonido de logro
      const notas = [523.25, 659.25, 783.99]; // Do, Mi, Sol (acorde mayor)
      const duracion = 0.15;
      const tiempoInicio = audioContext.currentTime;
      
      notas.forEach((frecuencia, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frecuencia;
        oscillator.type = 'sine';
        
        const inicio = tiempoInicio + (index * 0.1);
        gainNode.gain.setValueAtTime(0.2, inicio);
        gainNode.gain.exponentialRampToValueAtTime(0.01, inicio + duracion);
        
        oscillator.start(inicio);
        oscillator.stop(inicio + duracion);
      });
    } catch (error) {
      console.log('Audio no disponible');
    }
  };

  const handleCaraClick = (diente, cara, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Reproducir sonido metálico al hacer clic en pieza
    reproducirSonidoMetalico();
    
    // Activar animación de la pieza
    const piezaKey = `${diente}-${cara}`;
    setPiezaAnimada(piezaKey);
    // Quitar la animación después de que termine
    setTimeout(() => {
      setPiezaAnimada(null);
    }, 600);
    
    setSeleccionCara({ diente, cara });
  };

  const agregarProcedimiento = (proc, facturar = true) => {
    // Reproducir sonido al seleccionar procedimiento
    reproducirSonidoClick();
    
    // Activar animación de impacto en la pieza
    const piezaKey = `${seleccionCara.diente}-${seleccionCara.cara}`;
    setPiezaConImpacto(piezaKey);
    setTimeout(() => {
      setPiezaConImpacto(null);
    }, 800);
    
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
    // alertify.message eliminado para no deformar el modal
  };

  // Función para agregar solo color sin procedimiento
  const agregarSoloColor = (color, nombreColor) => {
    if (!seleccionCara) return;
    
    // Reproducir sonido al seleccionar color
    reproducirSonidoClick();
    
    // Guardar valores antes de limpiar seleccionCara
    const dienteSeleccionado = seleccionCara.diente;
    const caraSeleccionada = seleccionCara.cara;
    
    // Activar animación de impacto en la pieza
    const piezaKey = `${dienteSeleccionado}-${caraSeleccionada}`;
    setPiezaConImpacto(piezaKey);
    setTimeout(() => {
      setPiezaConImpacto(null);
    }, 800);
    
    // Crear un "procedimiento" ficticio solo con el color, sin precio
    const marcadoSoloColor = {
      diente: dienteSeleccionado,
      cara: caraSeleccionada,
      color: color,
      nombre: nombreColor,
      tipo: "marcado_color",
      precio: 0, // Siempre precio 0 para solo color
      tempId: Date.now()
    };
    
    // Eliminar cualquier marcado previo en la misma cara
    const presupuestoActualizado = presupuesto.filter(
      p => !(p.diente === dienteSeleccionado && p.cara === caraSeleccionada)
    );
    
    setPresupuesto([...presupuestoActualizado, marcadoSoloColor]);
    setSeleccionCara(null);
    setFiltroProcedimientos("");
    // alertify.message eliminado para no deformar el modal
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
    
    // Verificar si esta pieza está siendo animada
    const estaAnimada = piezaAnimada && piezaAnimada.startsWith(`${num}-`);
    
    return (
      <div 
        className="text-center" 
        style={{ 
          width: "42px", 
          display: "inline-block",
          animation: estaAnimada ? 'pulsePieza 0.6s ease-in-out, shakePieza 0.6s ease-in-out' : 'none',
          transformOrigin: 'center center'
        }}
      >
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
            style={{ 
              transition: 'all 0.2s ease',
              animation: piezaAnimada === `${num}-V` ? 'pulsePieza 0.6s ease-in-out, shakePieza 0.6s ease-in-out' : 
                       piezaConImpacto === `${num}-V` ? 'impactoPieza 0.8s ease-out' : 'none',
              transformOrigin: 'center center'
            }}
          />
          <polygon 
            points="25,75 75,75 100,100 0,100" 
            fill={getColor("L")} 
            stroke={getStrokeColor("L")} 
            strokeWidth={getStrokeWidth("L")}
            onClick={(e) => handleCaraClick(num, "L", e)}
            style={{ 
              transition: 'all 0.2s ease',
              animation: piezaAnimada === `${num}-L` ? 'pulsePieza 0.6s ease-in-out, shakePieza 0.6s ease-in-out' : 
                       piezaConImpacto === `${num}-L` ? 'impactoPieza 0.8s ease-out' : 'none',
              transformOrigin: 'center center'
            }}
          />
          <polygon 
            points="0,0 25,25 25,75 0,100" 
            fill={getColor("M")} 
            stroke={getStrokeColor("M")} 
            strokeWidth={getStrokeWidth("M")}
            onClick={(e) => handleCaraClick(num, "M", e)}
            style={{ 
              transition: 'all 0.2s ease',
              animation: piezaAnimada === `${num}-M` ? 'pulsePieza 0.6s ease-in-out, shakePieza 0.6s ease-in-out' : 
                       piezaConImpacto === `${num}-M` ? 'impactoPieza 0.8s ease-out' : 'none',
              transformOrigin: 'center center'
            }}
          />
          <polygon 
            points="100,0 100,100 75,75 75,25" 
            fill={getColor("D")} 
            stroke={getStrokeColor("D")} 
            strokeWidth={getStrokeWidth("D")}
            onClick={(e) => handleCaraClick(num, "D", e)}
            style={{ 
              transition: 'all 0.2s ease',
              animation: piezaAnimada === `${num}-D` ? 'pulsePieza 0.6s ease-in-out, shakePieza 0.6s ease-in-out' : 
                       piezaConImpacto === `${num}-D` ? 'impactoPieza 0.8s ease-out' : 'none',
              transformOrigin: 'center center'
            }}
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
            style={{ 
              transition: 'all 0.2s ease',
              animation: piezaAnimada === `${num}-O` ? 'pulsePieza 0.6s ease-in-out, shakePieza 0.6s ease-in-out' : 
                       piezaConImpacto === `${num}-O` ? 'impactoPieza 0.8s ease-out' : 'none',
              transformOrigin: 'center center'
            }}
          />
        </svg>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes pulsePieza {
          0% {
            transform: scale(1) translateY(0);
          }
          25% {
            transform: scale(1.15) translateY(-3px);
          }
          50% {
            transform: scale(1.1) translateY(-5px);
          }
          75% {
            transform: scale(1.05) translateY(-2px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
        @keyframes shakePieza {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-2px) rotate(-1deg); }
          20% { transform: translateX(2px) rotate(1deg); }
          30% { transform: translateX(-2px) rotate(-1deg); }
          40% { transform: translateX(2px) rotate(1deg); }
          50% { transform: translateX(-1px) rotate(-0.5deg); }
          60% { transform: translateX(1px) rotate(0.5deg); }
          70% { transform: translateX(-1px) rotate(-0.5deg); }
          80% { transform: translateX(1px) rotate(0.5deg); }
          90% { transform: translateX(0) rotate(0deg); }
        }
        @keyframes impactoPieza {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          10% {
            transform: scale(1.3);
            filter: brightness(1.5);
          }
          20% {
            transform: scale(0.95);
            filter: brightness(0.8);
          }
          30% {
            transform: scale(1.15);
            filter: brightness(1.3);
          }
          40% {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
          50% {
            transform: scale(0.98);
            filter: brightness(0.9);
          }
          60% {
            transform: scale(1.08);
            filter: brightness(1.2);
          }
          70% {
            transform: scale(1.02);
            filter: brightness(1.05);
          }
          80% {
            transform: scale(0.99);
            filter: brightness(0.95);
          }
          90% {
            transform: scale(1.01);
            filter: brightness(1.02);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }
      `}</style>
      <div className="col-md-10" style={{ padding: '20px', minHeight: '100vh' }}>
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

          {/* PANEL DE LÁPIZ */}
          <div className="card shadow-sm p-4 bg-white mb-4">
            <h6 className="font-weight-bold text-secondary mb-3">
              <i className="fas fa-pencil-alt me-2"></i>Herramientas de Dibujo
            </h6>
            <div className="d-flex justify-content-around align-items-center flex-wrap gap-3">
                <span className="font-weight-bold small">Color del Lápiz:</span>
                <button 
                  className={`btn btn-sm ${colorDibujo === 'red' ? 'btn-danger' : 'btn-outline-danger'}`} 
                  onClick={() => setColorDibujo("red")}
                  style={{ minWidth: '60px' }}
                >
                  🔴 Rojo
                </button>
                <button 
                  className={`btn btn-sm ${colorDibujo === 'blue' ? 'btn-primary' : 'btn-outline-primary'}`} 
                  onClick={() => setColorDibujo("blue")}
                  style={{ minWidth: '60px' }}
                >
                  🔵 Azul
                </button>
                <button 
                  className={`btn btn-sm ${colorDibujo === 'green' ? 'btn-success' : 'btn-outline-success'}`} 
                  onClick={() => setColorDibujo("green")}
                  style={{ minWidth: '60px' }}
                >
                  🟢 Verde
                </button>
                <button 
                  className={`btn btn-sm ${colorDibujo === 'black' ? 'btn-dark' : 'btn-outline-dark'}`} 
                  onClick={() => setColorDibujo("black")}
                  style={{ minWidth: '60px' }}
                >
                  ⚫ Negro
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={clearCanvas}
                  style={{ minWidth: '100px' }}
                >
                  <i className="fa fa-eraser me-1"></i> Borrar Todo
                </button>
                <button 
                  className="btn btn-sm btn-outline-warning" 
                  onClick={deshacer}
                  disabled={historialSuperior.length === 0 && historialInferior.length === 0}
                  style={{ 
                    minWidth: '100px',
                    opacity: (historialSuperior.length === 0 && historialInferior.length === 0) ? 0.5 : 1,
                    cursor: (historialSuperior.length === 0 && historialInferior.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                  title="Deshacer último trazo (Ctrl+Z)"
                >
                  <i className="fas fa-undo me-1"></i> Deshacer
                </button>
            </div>
          </div>

          {/* ODONTOGRAMA CARA A CARA */}
          <div className="card shadow-sm p-4 bg-white text-center mb-4">
            <h6 className="font-weight-bold text-secondary mb-3">
              {tipoOdontograma === "nino" ? "Marcado de Caras Dentales - Dientes de Leche" : "Marcado de Caras Dentales"}
            </h6>
            
            {/* Canvas superior (mitad superior del odontograma) */}
            {imagenOdontograma && (
              <div 
                className="mb-3"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto',
                  overflow: 'auto'
                }}
              >
                <canvas
                  ref={canvasSuperiorRef}
                  style={{ 
                    border: '1px solid #ccc', 
                    cursor: 'crosshair', 
                    touchAction: 'none',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                  onMouseDown={startDrawingSuperior}
                  onMouseMove={drawSuperior}
                  onMouseUp={endDrawingSuperior}
                  onMouseLeave={endDrawingSuperior}
                  onTouchStart={startDrawingSuperior}
                  onTouchMove={drawSuperior}
                  onTouchEnd={endDrawingSuperior}
                />
              </div>
            )}
            
            {/* Dientes superiores */}
            <div className="mb-5">
              {(tipoOdontograma === "nino" ? PIEZAS_NINO[0] : PIEZAS_ADULTO[0]).map(n => (
                <DienteCaraACara key={n} num={n} />
              ))}
            </div>
            
            {/* Dientes inferiores */}
            <div className="mt-4">
              {(tipoOdontograma === "nino" ? PIEZAS_NINO[1] : PIEZAS_ADULTO[1]).map(n => (
                <DienteCaraACara key={n} num={n} />
              ))}
            </div>
            
            {/* Canvas inferior (mitad inferior del odontograma) */}
            {imagenOdontograma && (
              <div 
                className="mt-3"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto',
                  overflow: 'auto'
                }}
              >
                <canvas
                  ref={canvasInferiorRef}
                  style={{ 
                    border: '1px solid #ccc', 
                    cursor: 'crosshair', 
                    touchAction: 'none',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                  onMouseDown={startDrawingInferior}
                  onMouseMove={drawInferior}
                  onMouseUp={endDrawingInferior}
                  onMouseLeave={endDrawingInferior}
                  onTouchStart={startDrawingInferior}
                  onTouchMove={drawInferior}
                  onTouchEnd={endDrawingInferior}
                />
              </div>
            )}
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
                        <strong className="ml-2">Rojo:</strong> Marcar pieza en rojo.
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
                        <button
                          className="btn"
                          style={{
                            background: '#ff0000',
                            color: 'white',
                            border: '2px solid #cc0000',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255,0,0,0.4)';
                            e.target.style.background = '#cc0000';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                            e.target.style.background = '#ff0000';
                          }}
                          onClick={() => {
                            // Marcar solo en rojo
                            agregarSoloColor('red', 'Marcado en Rojo');
                          }}
                          title="Marcar pieza en rojo"
                        >
                          <i className="fas fa-circle me-2"></i>Marcar en Rojo
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
                                  transition: 'all 0.2s ease',
                                  minHeight: '48px'
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
                                <span style={{ 
                                  fontSize: '14px', 
                                  fontWeight: '500',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  minWidth: 0,
                                  marginRight: '10px'
                                }}
                                title={o.nombre}>
                                  <i className="fas fa-check-circle me-2" style={{ fontSize: '12px', opacity: 0.6 }}></i>
                                  {o.nombre}
                                </span>
                                <span 
                                  className="badge font-weight-bold" 
                                  style={{ 
                                    fontSize: '13px',
                                    background: o.color === 'blue' ? '#0066ff' : o.color === 'red' ? '#ff0000' : '#667eea',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    flexShrink: 0
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
                    <th className="pl-3" style={{ width: '20%', whiteSpace: 'nowrap' }}>PIEZA</th>
                    <th style={{ width: '50%' }}>TRATAMIENTO</th>
                    <th className="text-right pr-3" style={{ width: '30%', whiteSpace: 'nowrap' }}>PRECIO</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {presupuesto.map(item => (
                    <tr key={item.tempId}>
                      <td className="font-weight-bold pl-3" style={{ whiteSpace: 'nowrap' }}>{item.diente}-{item.cara}</td>
                      <td style={{ 
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={item.nombre}>
                        {item.nombre}
                      </td>
                      <td className="text-right pr-3 font-weight-bold text-primary" style={{ whiteSpace: 'nowrap' }}>${item.precio.toFixed(2)}</td>
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
    </>
  );
};

export default OdontogramaCompletoHibrido;