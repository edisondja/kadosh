import React, { useState, useRef, useEffect, useCallback} from "react";
import { Link ,useParams} from 'react-router-dom';
import Odontograma from '../odontograma.jpeg';
import Core  from './funciones_extras';
import Axios from "axios";
import Alertify from "alertifyjs";
import alertify from "alertifyjs";

const TORNILLO_SIZE = 85;
const TORNILLO_ROJO_URL = `${process.env.PUBLIC_URL || ''}/tornillo_rojo.png`;
const TORNILLO_AZUL_URL = `${process.env.PUBLIC_URL || ''}/tornillo_azul.png`;


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

// Cursor con forma de borrador: al elegir Borrador el mouse se transforma en este icono sobre el canvas
const CURSOR_BORRADOR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="3" y="12" width="20" height="14" rx="2" fill="#f5a9c8" stroke="#222" stroke-width="2"/><rect x="5" y="14" width="16" height="10" rx="1" fill="#ffcce0"/></svg>';
const CURSOR_BORRADOR = 'url("data:image/svg+xml,' + encodeURIComponent(CURSOR_BORRADOR_SVG) + '") 16 24, crosshair';

// --- COMPONENTE PRINCIPAL ---
const OdontogramaCompletoHibrido = (props = {}) => {
  const params = useParams();
  const id_paciente = props.id_paciente != null ? props.id_paciente : params.id_paciente;
  const id_doctor = props.id_doctor != null ? props.id_doctor : params.id_doctor;
  const id_odontograma = props.id_odontograma ?? null;
  const initialDibujo = props.initialDibujo ?? null;
  const initialPresupuesto = props.initialPresupuesto ?? [];

  // === ESTADOS GENERALES ===
  const [presupuesto, setPresupuesto] = useState(initialPresupuesto.length > 0 ? initialPresupuesto : []);
  const [seleccionCara, setSeleccionCara] = useState(null); // Para el odontograma cara a cara
  const [colorDibujo, setColorDibujo] = useState("red"); // Para el canvas principal
  const [modoBorrador, setModoBorrador] = useState(false); // true = cursor borrador, los trazos que toque se eliminan
  const [modoTornillo, setModoTornillo] = useState(null); // 'rojo' | 'azul' | null - simular implante con tornillos
  const [modoMoverTornillo, setModoMoverTornillo] = useState(false); // true = seleccionar y arrastrar tornillos
  const [tornillosSuperior, setTornillosSuperior] = useState([]); // [{ x, y, color, rotacion? }]
  const [tornillosInferior, setTornillosInferior] = useState([]);
  const [orientacionTornillo, setOrientacionTornillo] = useState(0); // 0, 90, 180, 270 (grados) para nuevos
  const [modoRotarTornillo, setModoRotarTornillo] = useState(false); // clic en tornillo = ciclar rotación
  const [modoRX, setModoRX] = useState(false); // clic en canvas = colocar texto "RX"
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
  // Historial unificado: último trazo entrado es el primero en deshacerse (LIFO)
  const [historialUnificado, setHistorialUnificado] = useState([]); // [{ esSuperior, state }]

  // === Lógica de los CANVAS ===
  const canvasSuperiorRef = useRef(null);       // Base: solo imagen del odontograma
  const canvasInferiorRef = useRef(null);
  const canvasSuperiorStrokesRef = useRef(null); // Capa de trazos (lo que dibuja/borra el usuario)
  const canvasInferiorStrokesRef = useRef(null);
  const isDrawingSuperior = useRef(false);
  const isDrawingInferior = useRef(false);
  const presupuestoScrollRef = useRef(null);
  const imgTornilloRojoRef = useRef(null);
  const imgTornilloAzulRef = useRef(null);
  const canvasSuperiorTornillosRef = useRef(null);
  const canvasInferiorTornillosRef = useRef(null);
  const draggingTornilloRef = useRef(null); // { superior: boolean, index: number }



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

  // Cargar imágenes PNG de tornillos (desde public/)
  useEffect(() => {
    const rojo = new Image();
    rojo.onload = () => { imgTornilloRojoRef.current = rojo; };
    rojo.src = TORNILLO_ROJO_URL;
    const azul = new Image();
    azul.onload = () => { imgTornilloAzulRef.current = azul; };
    azul.src = TORNILLO_AZUL_URL;
    return () => {
      imgTornilloRojoRef.current = null;
      imgTornilloAzulRef.current = null;
    };
  }, []);

  // Dibujar un tornillo (implante) en el canvas; rotacion en grados (0, 90, 180, 270)
  const dibujarTornillo = useCallback((ctx, x, y, color, rotacion = 0) => {
    if (!ctx) return;
    const esRojo = color === 'rojo';
    const img = esRojo ? imgTornilloRojoRef.current : imgTornilloAzulRef.current;
    const half = TORNILLO_SIZE / 2;
    const rad = (rotacion * Math.PI) / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rad);
    ctx.translate(-half, -half);
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, 0, 0, TORNILLO_SIZE, TORNILLO_SIZE);
      ctx.restore();
      return;
    }
    ctx.translate(half, half);
    ctx.fillStyle = esRojo ? '#c00' : '#06c';
    ctx.strokeStyle = esRojo ? '#800' : '#004';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.stroke();
    ctx.restore();
  }, []);

  // Redibujar la capa de tornillos para superior o inferior
  const redrawTornillosLayer = useCallback((esSuperior) => {
    const canvas = esSuperior ? canvasSuperiorTornillosRef.current : canvasInferiorTornillosRef.current;
    const list = esSuperior ? tornillosSuperior : tornillosInferior;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (list.length) list.forEach((t) => dibujarTornillo(ctx, t.x, t.y, t.color, t.rotacion ?? 0));
  }, [tornillosSuperior, tornillosInferior, dibujarTornillo]);

  // Guardar estado del canvas antes de dibujar (para deshacer último trazo en orden LIFO)
  const guardarEstadoCanvas = useCallback((canvas, esSuperior) => {
    if (!canvas) return;
    const estado = canvas.toDataURL('image/png');
    setHistorialUnificado(prev => [...prev, { esSuperior, state: estado }]);
  }, []);

  // Deshacer siempre el último trazo (restaura la capa de trazos; la imagen base no se toca)
  const deshacer = useCallback(() => {
    if (historialUnificado.length === 0) return;
    const canvasSuperiorStrokes = canvasSuperiorStrokesRef.current;
    const canvasInferiorStrokes = canvasInferiorStrokesRef.current;
    const ultimo = historialUnificado[historialUnificado.length - 1];
    const canvas = ultimo.esSuperior ? canvasSuperiorStrokes : canvasInferiorStrokes;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistorialUnificado(prev => prev.slice(0, -1));
    };
    img.src = ultimo.state;
  }, [historialUnificado]);

  // Funciones para dibujar en la capa de trazos (solo trazos; la imagen base no se toca)
  const startDrawingSuperior = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasSuperiorStrokesRef.current;
    if (!canvas) return;
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');

    if (modoTornillo) {
      setTornillosSuperior(prev => [...prev, { x: coords.x, y: coords.y, color: modoTornillo, rotacion: orientacionTornillo }]);
      reproducirSonidoTornillo();
      return;
    }
    if (modoRX) {
      guardarEstadoCanvas(canvas, true);
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RX', coords.x, coords.y);
      return;
    }
    
    guardarEstadoCanvas(canvas, true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isDrawingSuperior.current = true;
  }, [getCanvasCoordinates, guardarEstadoCanvas, modoTornillo, orientacionTornillo, modoRX]);

  const drawSuperior = useCallback((e) => {
    if (!isDrawingSuperior.current) return;
    e.preventDefault();
    const canvas = canvasSuperiorStrokesRef.current;
    if (!canvas) return;
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');
    if (modoBorrador) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = colorDibujo;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }, [colorDibujo, modoBorrador, getCanvasCoordinates]);

  const endDrawingSuperior = useCallback((e) => {
    if (e) e.preventDefault();
    isDrawingSuperior.current = false;
  }, []);

  const startDrawingInferior = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasInferiorStrokesRef.current;
    if (!canvas) return;
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');

    if (modoTornillo) {
      setTornillosInferior(prev => [...prev, { x: coords.x, y: coords.y, color: modoTornillo, rotacion: orientacionTornillo }]);
      reproducirSonidoTornillo();
      return;
    }
    if (modoRX) {
      guardarEstadoCanvas(canvas, false);
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RX', coords.x, coords.y);
      return;
    }
    
    guardarEstadoCanvas(canvas, false);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isDrawingInferior.current = true;
  }, [getCanvasCoordinates, guardarEstadoCanvas, modoTornillo, orientacionTornillo, modoRX]);

  const drawInferior = useCallback((e) => {
    if (!isDrawingInferior.current) return;
    e.preventDefault();
    const canvas = canvasInferiorStrokesRef.current;
    if (!canvas) return;
    
    const event = e.nativeEvent || e;
    const coords = getCanvasCoordinates(canvas, event);
    const ctx = canvas.getContext('2d');
    if (modoBorrador) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = colorDibujo;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }, [colorDibujo, modoBorrador, getCanvasCoordinates]);

  const endDrawingInferior = useCallback((e) => {
    if (e) e.preventDefault();
    isDrawingInferior.current = false;
  }, []);

  const halfTornillo = TORNILLO_SIZE / 2;
  const hitTestTornillo = (list, x, y) => {
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      if (x >= t.x - halfTornillo && x <= t.x + halfTornillo && y >= t.y - halfTornillo && y <= t.y + halfTornillo) return i;
    }
    return -1;
  };

  const handleTornillosMouseDown = useCallback((esSuperior, e) => {
    e.preventDefault();
    const canvas = esSuperior ? canvasSuperiorTornillosRef.current : canvasInferiorTornillosRef.current;
    if (!canvas) return;
    const coords = getCanvasCoordinates(canvas, e.nativeEvent || e);
    const list = esSuperior ? tornillosSuperior : tornillosInferior;
    const index = hitTestTornillo(list, coords.x, coords.y);
    if (modoRotarTornillo) {
      if (index >= 0) {
        const siguiente = ((list[index].rotacion ?? 0) + 90) % 360;
        if (esSuperior) {
          setTornillosSuperior(prev => {
            const next = [...prev];
            next[index] = { ...next[index], rotacion: siguiente };
            return next;
          });
        } else {
          setTornillosInferior(prev => {
            const next = [...prev];
            next[index] = { ...next[index], rotacion: siguiente };
            return next;
          });
        }
        reproducirSonidoClick();
      }
      return;
    }
    if (!modoMoverTornillo) return;
    if (index >= 0) draggingTornilloRef.current = { superior: esSuperior, index };
  }, [modoMoverTornillo, modoRotarTornillo, getCanvasCoordinates, tornillosSuperior, tornillosInferior]);

  const handleTornillosMouseMove = useCallback((esSuperior, e) => {
    const dr = draggingTornilloRef.current;
    if (!dr || dr.superior !== esSuperior) return;
    e.preventDefault();
    const canvas = esSuperior ? canvasSuperiorTornillosRef.current : canvasInferiorTornillosRef.current;
    if (!canvas) return;
    const coords = getCanvasCoordinates(canvas, e.nativeEvent || e);
    if (esSuperior) {
      setTornillosSuperior(prev => {
        const next = [...prev];
        if (next[dr.index]) next[dr.index] = { ...next[dr.index], x: coords.x, y: coords.y };
        return next;
      });
    } else {
      setTornillosInferior(prev => {
        const next = [...prev];
        if (next[dr.index]) next[dr.index] = { ...next[dr.index], x: coords.x, y: coords.y };
        return next;
      });
    }
  }, [getCanvasCoordinates]);

  const handleTornillosMouseUp = useCallback(() => {
    draggingTornilloRef.current = null;
  }, []);

  const GuargarOdontograma = useCallback(() => {
    const canvasSuperior = canvasSuperiorRef.current;
    const canvasInferior = canvasInferiorRef.current;
    const canvasSuperiorStrokes = canvasSuperiorStrokesRef.current;
    const canvasInferiorStrokes = canvasInferiorStrokesRef.current;

    if (!canvasSuperior || !canvasInferior || !canvasSuperiorStrokes || !canvasInferiorStrokes) {
      Alertify.error("Error: No se puede acceder a los canvas.");
      return;
    }

    const canvasSuperiorTornillos = canvasSuperiorTornillosRef.current;
    const canvasInferiorTornillos = canvasInferiorTornillosRef.current;

    // Componer base + trazos + tornillos para cada arco
    const compSuperior = document.createElement('canvas');
    compSuperior.width = canvasSuperior.width;
    compSuperior.height = canvasSuperior.height;
    const ctxSup = compSuperior.getContext('2d');
    ctxSup.drawImage(canvasSuperior, 0, 0);
    ctxSup.drawImage(canvasSuperiorStrokes, 0, 0);
    if (canvasSuperiorTornillos) ctxSup.drawImage(canvasSuperiorTornillos, 0, 0);

    const compInferior = document.createElement('canvas');
    compInferior.width = canvasInferior.width;
    compInferior.height = canvasInferior.height;
    const ctxInf = compInferior.getContext('2d');
    ctxInf.drawImage(canvasInferior, 0, 0);
    ctxInf.drawImage(canvasInferiorStrokes, 0, 0);
    if (canvasInferiorTornillos) ctxInf.drawImage(canvasInferiorTornillos, 0, 0);

    const combinedWidth = Math.max(compSuperior.width, compInferior.width);
    const combinedHeight = compSuperior.height + compInferior.height;

    const maxWidth = 1200;
    const maxHeight = 800;
    let finalWidth = combinedWidth;
    let finalHeight = combinedHeight;

    if (finalWidth > maxWidth || finalHeight > maxHeight) {
      const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
      finalWidth = finalWidth * ratio;
      finalHeight = finalHeight * ratio;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = finalWidth;
    tempCanvas.height = finalHeight;
    const tempCtx = tempCanvas.getContext('2d');

    const superiorHeight = (compSuperior.height / combinedHeight) * finalHeight;
    tempCtx.drawImage(compSuperior, 0, 0, finalWidth, superiorHeight);

    const inferiorHeight = (compInferior.height / combinedHeight) * finalHeight;
    tempCtx.drawImage(compInferior, 0, superiorHeight, finalWidth, inferiorHeight);

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

    const payload = {
      dibujo_odontograma: dibujoActual,
      detalles: detalles.length > 0 ? detalles : [],
      usuario_id: usuarioId
    };

    if (id_odontograma) {
      Axios.post(`${Core.url_base}/api/actualizar_odontograma/${id_odontograma}`, payload, {
        headers: { 'Content-Type': 'application/json' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }).then(() => {
        reproducirSonidoLogro();
        Alertify.success("Odontograma actualizado correctamente.");
        window.location.href = `/ver_odontogramas/${id_paciente}`;
      }).catch(error => {
        console.error("Error al actualizar:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Error desconocido";
        Alertify.error("Error al actualizar el odontograma: " + errorMessage);
      });
    } else {
      Axios.post(`${Core.url_base}/api/crear_odontograma`, {
        id_paciente: pacienteId,
        id_doctor: doctorId,
        ...payload
      }, {
        headers: { 'Content-Type': 'application/json' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }).then(() => {
        reproducirSonidoLogro();
        Alertify.success("Odontograma guardado correctamente.");
        window.location.href = `/ver_odontogramas/${id_paciente}`;
      }).catch(error => {
        console.error("Error al guardar:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Error desconocido";
        Alertify.error("Error al guardar el odontograma: " + errorMessage);
      });
    }
  }, [id_paciente, id_doctor, id_odontograma, presupuesto]);


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

  // Cargar la imagen del odontograma: base en un canvas, trazos en otra capa
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImagenOdontograma(img);
      const w = img.width;
      const h = img.height / 2;

      const canvasSuperior = canvasSuperiorRef.current;
      if (canvasSuperior) {
        canvasSuperior.width = w;
        canvasSuperior.height = h;
        const ctx = canvasSuperior.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);
      }

      const canvasInferior = canvasInferiorRef.current;
      if (canvasInferior) {
        canvasInferior.width = w;
        canvasInferior.height = h;
        const ctx = canvasInferior.getContext('2d');
        ctx.drawImage(img, 0, h, w, h, 0, 0, w, h);
      }
    };
    img.src = Odontograma;
  }, []);

  // Dimensionar la capa de trazos cuando ya está en el DOM (tras tener imagenOdontograma)
  useEffect(() => {
    if (!imagenOdontograma) return;
    const w = imagenOdontograma.width;
    const h = imagenOdontograma.height / 2;
    if (canvasSuperiorStrokesRef.current) {
      canvasSuperiorStrokesRef.current.width = w;
      canvasSuperiorStrokesRef.current.height = h;
    }
    if (canvasInferiorStrokesRef.current) {
      canvasInferiorStrokesRef.current.width = w;
      canvasInferiorStrokesRef.current.height = h;
    }
    if (canvasSuperiorTornillosRef.current) {
      canvasSuperiorTornillosRef.current.width = w;
      canvasSuperiorTornillosRef.current.height = h;
    }
    if (canvasInferiorTornillosRef.current) {
      canvasInferiorTornillosRef.current.width = w;
      canvasInferiorTornillosRef.current.height = h;
    }
  }, [imagenOdontograma]);

  // Modo edición: cargar dibujo guardado en las capas de trazos (mitad superior e inferior)
  useEffect(() => {
    if (!id_odontograma || !initialDibujo || !imagenOdontograma) return;
    const canvasSup = canvasSuperiorStrokesRef.current;
    const canvasInf = canvasInferiorStrokesRef.current;
    if (!canvasSup || !canvasInf) return;
    const w = imagenOdontograma.width;
    const h = imagenOdontograma.height / 2;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctxSup = canvasSup.getContext('2d');
      const ctxInf = canvasInf.getContext('2d');
      ctxSup.drawImage(img, 0, 0, img.width, img.height / 2, 0, 0, w, h);
      ctxInf.drawImage(img, 0, img.height / 2, img.width, img.height / 2, 0, 0, w, h);
    };
    img.onerror = () => console.warn('No se pudo cargar el dibujo del odontograma para edición');
    img.src = initialDibujo;
  }, [id_odontograma, initialDibujo, imagenOdontograma]);

  // Modo edición: cargar las piezas marcadas (detalles) desde la base de datos solo al abrir
  const appliedInitialPresupuestoRef = useRef(null);
  useEffect(() => {
    if (!id_odontograma || !initialPresupuesto || initialPresupuesto.length === 0) return;
    if (appliedInitialPresupuestoRef.current === id_odontograma) return;
    appliedInitialPresupuestoRef.current = id_odontograma;
    setPresupuesto(initialPresupuesto.map((d) => ({
      diente: Number(d.diente) ?? d.diente,
      cara: d.cara != null ? String(d.cara) : '',
      tipo: d.tipo || 'procedimiento',
      descripcion: d.descripcion || '',
      nombre: d.descripcion || d.nombre || '',
      precio: parseFloat(d.precio) || 0,
      color: d.color || null
    })));
  }, [id_odontograma, initialPresupuesto]);

  // Redibujar capas de tornillos cuando cambian las listas
  useEffect(() => {
    redrawTornillosLayer(true);
    redrawTornillosLayer(false);
  }, [tornillosSuperior, tornillosInferior, redrawTornillosLayer]);

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
        if (historialUnificado.length > 0) {
          deshacer();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [historialUnificado, deshacer]);

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
    // Limpiar capa de trazos y capa de tornillos
    if (canvasSuperiorStrokesRef.current) {
      const ctx = canvasSuperiorStrokesRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasSuperiorStrokesRef.current.width, canvasSuperiorStrokesRef.current.height);
    }
    if (canvasInferiorStrokesRef.current) {
      const ctx = canvasInferiorStrokesRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasInferiorStrokesRef.current.width, canvasInferiorStrokesRef.current.height);
    }
    if (canvasSuperiorTornillosRef.current) {
      const ctx = canvasSuperiorTornillosRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasSuperiorTornillosRef.current.width, canvasSuperiorTornillosRef.current.height);
    }
    if (canvasInferiorTornillosRef.current) {
      const ctx = canvasInferiorTornillosRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasInferiorTornillosRef.current.width, canvasInferiorTornillosRef.current.height);
    }
    setHistorialUnificado([]);
    setTornillosSuperior([]);
    setTornillosInferior([]);
    setDibujoGuardado("");
  }, []);

  // === Lógica del ODONTOGRAMA CARA A CARA ===
  // Sonido metálico al colocar tornillo (ting/clink de metal)
  const reproducirSonidoTornillo = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.log('Audio no disponible');
    }
  };

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
      color: 'red', // Por defecto se marca la pieza en rojo al agregar un procedimiento
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

  // Limpiar el color/procedimiento de una cara (diente-cara)
  const limpiarCara = useCallback((diente, cara) => {
    setPresupuesto(prev => prev.filter(p => !(p.diente === diente && p.cara === cara)));
    setSeleccionCara(null);
    setFiltroProcedimientos("");
  }, []);

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
      {/* HEADER: Volver + Paciente / Médico */}
      <div className="card shadow-sm mb-3 border-left border-primary" style={{ borderLeftWidth: '5px' }}>
        <div className="card-body py-2 d-flex justify-content-between align-items-center flex-wrap">
          <div className="row flex-grow-1 mb-0">
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
          <Link 
            to={`/ver_odontogramas/${id_paciente}`}
            className="btn btn-secondary ml-2"
            style={{
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            <i className="fas fa-arrow-left me-2"></i>Volver
          </Link>
        </div>
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
                      borderRadius: '10px',
                      padding: '8px 18px',
                      fontWeight: '600',
                      fontSize: '13px',
                      boxShadow: tipoOdontograma === "adulto" 
                        ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '100px',
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
                    <i className="fas fa-user" style={{ fontSize: '14px' }}></i>
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
                      borderRadius: '10px',
                      padding: '8px 18px',
                      fontWeight: '600',
                      fontSize: '13px',
                      boxShadow: tipoOdontograma === "nino" 
                        ? '0 4px 15px rgba(245, 87, 108, 0.4)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '140px',
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
                    <i className="fas fa-child" style={{ fontSize: '14px' }}></i>
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
                  overflow: 'auto',
                  cursor: modoBorrador ? CURSOR_BORRADOR : 'crosshair'
                }}
              >
                <div 
                  style={{ 
                    position: 'relative', 
                    display: 'inline-block',
                    cursor: modoBorrador ? CURSOR_BORRADOR : 'crosshair'
                  }}
                >
                  <canvas
                    ref={canvasSuperiorRef}
                    style={{ 
                      border: '1px solid #ccc', 
                      display: 'block',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      verticalAlign: 'top',
                      pointerEvents: 'none'
                    }}
                  />
                  <canvas
                    ref={canvasSuperiorStrokesRef}
                    style={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      border: '1px solid #ccc',
                      cursor: modoBorrador ? CURSOR_BORRADOR : 'crosshair',
                      touchAction: 'none',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      display: 'block',
                      pointerEvents: (modoMoverTornillo || modoRotarTornillo) ? 'none' : 'auto'
                    }}
                    onMouseDown={startDrawingSuperior}
                    onMouseMove={drawSuperior}
                    onMouseUp={endDrawingSuperior}
                    onMouseLeave={endDrawingSuperior}
                    onTouchStart={startDrawingSuperior}
                    onTouchMove={drawSuperior}
                    onTouchEnd={endDrawingSuperior}
                  />
                  <canvas
                    ref={canvasSuperiorTornillosRef}
                    style={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      border: 'none',
                      pointerEvents: (modoMoverTornillo || modoRotarTornillo) ? 'auto' : 'none',
                      cursor: modoMoverTornillo ? 'grab' : (modoRotarTornillo ? 'pointer' : 'default'),
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      display: 'block'
                    }}
                    onMouseDown={(e) => handleTornillosMouseDown(true, e)}
                    onMouseMove={(e) => handleTornillosMouseMove(true, e)}
                    onMouseUp={handleTornillosMouseUp}
                    onMouseLeave={handleTornillosMouseUp}
                    onTouchStart={(e) => handleTornillosMouseDown(true, e)}
                    onTouchMove={(e) => handleTornillosMouseMove(true, e)}
                    onTouchEnd={handleTornillosMouseUp}
                  />
                </div>
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
                  overflow: 'auto',
                  cursor: modoBorrador ? CURSOR_BORRADOR : 'crosshair'
                }}
              >
                <div 
                  style={{ 
                    position: 'relative', 
                    display: 'inline-block',
                    cursor: modoBorrador ? CURSOR_BORRADOR : 'crosshair'
                  }}
                >
                  <canvas
                    ref={canvasInferiorRef}
                    style={{ 
                      border: '1px solid #ccc', 
                      display: 'block',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      verticalAlign: 'top',
                      pointerEvents: 'none'
                    }}
                  />
                  <canvas
                    ref={canvasInferiorStrokesRef}
                    style={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      border: '1px solid #ccc',
                      cursor: modoBorrador ? CURSOR_BORRADOR : 'crosshair',
                      touchAction: 'none',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      display: 'block',
                      pointerEvents: (modoMoverTornillo || modoRotarTornillo) ? 'none' : 'auto'
                    }}
                    onMouseDown={startDrawingInferior}
                    onMouseMove={drawInferior}
                    onMouseUp={endDrawingInferior}
                    onMouseLeave={endDrawingInferior}
                    onTouchStart={startDrawingInferior}
                    onTouchMove={drawInferior}
                    onTouchEnd={endDrawingInferior}
                  />
                  <canvas
                    ref={canvasInferiorTornillosRef}
                    style={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      border: 'none',
                      pointerEvents: (modoMoverTornillo || modoRotarTornillo) ? 'auto' : 'none',
                      cursor: modoMoverTornillo ? 'grab' : (modoRotarTornillo ? 'pointer' : 'default'),
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      display: 'block'
                    }}
                    onMouseDown={(e) => handleTornillosMouseDown(false, e)}
                    onMouseMove={(e) => handleTornillosMouseMove(false, e)}
                    onMouseUp={handleTornillosMouseUp}
                    onMouseLeave={handleTornillosMouseUp}
                    onTouchStart={(e) => handleTornillosMouseDown(false, e)}
                    onTouchMove={(e) => handleTornillosMouseMove(false, e)}
                    onTouchEnd={handleTornillosMouseUp}
                  />
                </div>
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
                    className="modal-header text-white d-flex align-items-center justify-content-between flex-wrap" 
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '16px 16px 0 0',
                      border: 'none',
                      padding: '20px 30px'
                    }}
                  >
                    <h5 className="modal-title font-weight-bold mb-0" style={{ fontSize: '20px' }}>
                      <i className="fas fa-tooth me-2"></i>
                      Diente {seleccionCara.diente} - Cara {seleccionCara.cara}
                    </h5>
                    <div className="d-flex align-items-center gap-2">
                      {presupuesto.some(p => p.diente === seleccionCara.diente && p.cara === seleccionCara.cara) && (
                        <button
                          type="button"
                          className="btn font-weight-bold"
                          onClick={() => limpiarCara(seleccionCara.diente, seleccionCara.cara)}
                          title="Quitar color y procedimiento de esta cara"
                          style={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.45)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <i className="fas fa-eraser me-2"></i> Limpiar cara
                        </button>
                      )}
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
                  </div>

                  {/* Body del Modal */}
                  <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Opción destacada: Limpiar cara */}
                    {presupuesto.some(p => p.diente === seleccionCara.diente && p.cara === seleccionCara.cara) && (
                      <div className="mb-4 p-3 rounded" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', border: '2px solid #fecaca' }}>
                        <span className="d-block mb-2 small text-muted font-weight-bold text-uppercase">Quitar marcado de esta cara</span>
                        <button
                          type="button"
                          className="btn font-weight-bold"
                          onClick={() => limpiarCara(seleccionCara.diente, seleccionCara.cara)}
                          style={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)'
                          }}
                        >
                          <i className="fas fa-eraser me-2"></i> Limpiar cara
                        </button>
                      </div>
                    )}
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

        {/* HERRAMIENTAS + RESUMEN DEL PLAN (DERECHA) */}
        <div className="col-lg-4">
          {/* Herramientas de dibujo - flotante al hacer scroll */}
          <div
            className="mb-3"
            style={{
              position: 'sticky',
              top: 16,
              zIndex: 100,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
              }}>
                <i className="fas fa-pencil-alt"></i>
              </span>
              <h6 style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#334155' }}>Herramientas de dibujo</h6>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Implantes</span>
                <button onClick={() => { reproducirSonidoClick(); setModoMoverTornillo(false); setModoRotarTornillo(false); setModoBorrador(false); setModoRX(false); setModoTornillo(modoTornillo === 'rojo' ? null : 'rojo'); }} title="Tornillo rojo" style={{ minWidth: 80, padding: '5px 10px', borderRadius: '8px', border: modoTornillo === 'rojo' ? '2px solid #dc2626' : '1px solid #fecaca', background: modoTornillo === 'rojo' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#fff', color: modoTornillo === 'rojo' ? '#fff' : '#b91c1c', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={TORNILLO_ROJO_URL} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> Rojo
                </button>
                <button onClick={() => { reproducirSonidoClick(); setModoMoverTornillo(false); setModoRotarTornillo(false); setModoBorrador(false); setModoRX(false); setModoTornillo(modoTornillo === 'azul' ? null : 'azul'); }} title="Tornillo azul" style={{ minWidth: 80, padding: '5px 10px', borderRadius: '8px', border: modoTornillo === 'azul' ? '2px solid #2563eb' : '1px solid #bfdbfe', background: modoTornillo === 'azul' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#fff', color: modoTornillo === 'azul' ? '#fff' : '#1d4ed8', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={TORNILLO_AZUL_URL} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> Azul
                </button>
                <button onClick={() => { reproducirSonidoClick(); setModoTornillo(null); setModoBorrador(false); setModoRotarTornillo(false); setModoRX(false); setModoMoverTornillo(prev => !prev); }} title="Mover tornillos" style={{ minWidth: 100, padding: '5px 10px', borderRadius: '8px', border: modoMoverTornillo ? '2px solid #0d9488' : '1px solid #99f6e4', background: modoMoverTornillo ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : '#fff', color: modoMoverTornillo ? '#fff' : '#0f766e', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                  <i className="fas fa-arrows-alt me-1"></i> Mover
                </button>
                <button onClick={() => { reproducirSonidoClick(); setModoTornillo(null); setModoBorrador(false); setModoMoverTornillo(false); setModoRX(false); setModoRotarTornillo(prev => !prev); }} title="Rotar tornillo" style={{ minWidth: 90, padding: '5px 10px', borderRadius: '8px', border: modoRotarTornillo ? '2px solid #7c3aed' : '1px solid #ddd6fe', background: modoRotarTornillo ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#fff', color: modoRotarTornillo ? '#fff' : '#5b21b6', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                  <i className="fas fa-sync-alt me-1"></i> Rotar
                </button>
                <button onClick={() => { reproducirSonidoClick(); setModoTornillo(null); setModoBorrador(false); setModoMoverTornillo(false); setModoRotarTornillo(false); setModoRX(prev => !prev); }} title="Clic en el canvas para colocar texto RX (radiografía)" style={{ minWidth: 56, padding: '5px 10px', borderRadius: '8px', border: modoRX ? '2px solid #0f766e' : '1px solid #99f6e4', background: modoRX ? '#0f766e' : '#fff', color: modoRX ? '#fff' : '#0f766e', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  RX
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Lápiz</span>
                {[{ id: 'red', emoji: '🔴', bg: '#ef4444', border: '#fecaca' }, { id: 'blue', emoji: '🔵', bg: '#3b82f6', border: '#bfdbfe' }, { id: 'green', emoji: '🟢', bg: '#22c55e', border: '#bbf7d0' }, { id: 'black', emoji: '⚫', bg: '#1e293b', border: '#cbd5e1' }].map((c) => (
                  <button key={c.id} onClick={() => { setModoMoverTornillo(false); setModoRotarTornillo(false); setModoBorrador(false); setModoTornillo(null); setModoRX(false); setColorDibujo(c.id); }} title={c.id} style={{ width: 36, height: 36, borderRadius: '8px', border: colorDibujo === c.id ? `2px solid ${c.bg}` : `1px solid ${c.border}`, background: colorDibujo === c.id ? c.bg : '#fff', color: colorDibujo === c.id ? '#fff' : c.bg, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.emoji}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Acciones</span>
                <button onClick={() => { reproducirSonidoClick(); setModoMoverTornillo(false); setModoRotarTornillo(false); setModoTornillo(null); setModoRX(false); setModoBorrador(!modoBorrador); }} title="Borrador" style={{ padding: '5px 10px', borderRadius: '8px', border: modoBorrador ? '2px solid #64748b' : '1px solid #e2e8f0', background: modoBorrador ? '#475569' : '#fff', color: modoBorrador ? '#fff' : '#475569', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                  <i className="fa fa-eraser me-1"></i> {modoBorrador ? 'ON' : 'Borrador'}
                </button>
                <button onClick={() => { setModoMoverTornillo(false); setModoRotarTornillo(false); setModoRX(false); clearCanvas(); }} style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                  <i className="fa fa-trash me-1"></i> Borrar
                </button>
                <button onClick={() => { setModoMoverTornillo(false); setModoRotarTornillo(false); setModoRX(false); deshacer(); }} disabled={historialUnificado.length === 0} title="Deshacer" style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #fcd34d', background: historialUnificado.length === 0 ? '#fef3c7' : '#fef9c3', color: historialUnificado.length === 0 ? '#a3a3a3' : '#b45309', fontWeight: 600, fontSize: '12px', cursor: historialUnificado.length === 0 ? 'not-allowed' : 'pointer', opacity: historialUnificado.length === 0 ? 0.7 : 1 }}>
                  <i className="fas fa-undo me-1"></i> Deshacer
                </button>
              </div>
            </div>
          </div>

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
                {id_odontograma ? '💾 ACTUALIZAR REGISTRO CLÍNICO' : '💾 GUARDAR REGISTRO CLÍNICO'}
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