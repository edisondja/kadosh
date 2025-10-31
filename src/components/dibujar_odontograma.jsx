import React, { useState, useEffect, useRef, useCallback } from "react";

// --- Configuración Global ---
// Usamos una URL de placeholder para la imagen base, ya que las rutas locales fallan.
const ODONTOGRAMA_IMAGE_URL = "https://placehold.co/800x600/D0E7E5/333333?text=Odontograma+Base+para+Dibujo";
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Definición de las piezas dentales (manteniendo la estructura para la numeración)
const TOOTH_PIECES = {
    superior_derecho: ['18', '17', '16', '15', '14', '13', '12', '11'],
    superior_izquierdo: ['21', '22', '23', '24', '25', '26', '27', '28'],
    inferior_derecho: ['48', '47', '46', '45', '44', '43', '42', '41'],
    inferior_izquierdo: ['31', '32', '33', '34', '35', '36', '37', '38'],
};

// Componente principal OdontogramaClinico (adaptado para usar Canvas y Registro)
const OdontogramaClinico = () => {
    // Referencias para el Canvas y la imagen cargada
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const ctxRef = useRef(null); // Contexto de dibujo
    
    // Estado de la herramienta de dibujo
    const [color, setColor] = useState("red");
    const [isDrawing, setIsDrawing] = useState(false);
    
    // NUEVO: Estado para el diente actualmente seleccionado para el registro
    const [selectedTooth, setSelectedTooth] = useState(null); 
    const [procedureText, setProcedureText] = useState('');

    // Estado del paciente y del historial de procedimientos
    const [paciente] = useState({ nombre: 'Edison De Jesus Abreu', apellido: 'Pérez' });
    // Estructura: [{ tooth: '18', procedure: 'Caries simple', color: 'red', timestamp: Date.now() }]
    const [procedimientosAplicados, setProcedimientosAplicados] = useState([]); 

    // --- Lógica de Inicialización del Canvas y Carga de Imagen ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Configurar el contexto y dimensiones
        const context = canvas.getContext("2d");
        ctxRef.current = context;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // 2. Cargar y dibujar la imagen base
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = ODONTOGRAMA_IMAGE_URL;
        
        image.onload = () => {
            imageRef.current = image;
            // Dibujar la imagen base una vez cargada
            context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        };
        
        image.onerror = () => {
             console.error("Error al cargar la imagen base del odontograma.");
        };
    }, []);

    // --- Handlers de Dibujo (optimizados con useCallback) ---
    const getCoordinates = (e) => {
        // Manejo de eventos de ratón o toque para obtener las coordenadas
        if (e.touches && e.touches.length > 0) {
            const rect = canvasRef.current.getBoundingClientRect();
            return { 
                x: e.touches[0].clientX - rect.left, 
                y: e.touches[0].clientY - rect.top 
            };
        }
        return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    };

    const iniciarDibujo = useCallback((e) => {
        if (!ctxRef.current) return;
        e.preventDefault(); 
        const { x, y } = getCoordinates(e);

        setIsDrawing(true);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
    }, []);

    const dibujar = useCallback((e) => {
        if (!isDrawing || !ctxRef.current) return;
        e.preventDefault(); 
        const { x, y } = getCoordinates(e);

        ctxRef.current.strokeStyle = color;
        ctxRef.current.lineWidth = 4;
        ctxRef.current.lineCap = 'round';
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
    }, [isDrawing, color]);

    const terminarDibujo = useCallback(() => {
        setIsDrawing(false);
        if (ctxRef.current) {
            ctxRef.current.closePath();
        }
    }, []);

    // --- Handlers de Interacción y Botones ---
    
    const handleToothClick = (toothNum) => {
        // Si se hace clic en el mismo diente, se deselecciona, sino se selecciona
        setSelectedTooth(prev => prev === toothNum ? null : toothNum);
        setProcedureText('');
    };

    const addProcedure = (e) => {
        e.preventDefault();
        if (selectedTooth && procedureText.trim()) {
            setProcedimientosAplicados(prev => [
                ...prev,
                {
                    tooth: selectedTooth,
                    procedure: procedureText.trim(),
                    color: color, // Usar el color de dibujo actual para indicar el tipo de acción
                    timestamp: Date.now(),
                }
            ].sort((a, b) => a.tooth.localeCompare(b.tooth))); // Ordenar por número de diente

            // Limpiar selección y texto
            setSelectedTooth(null);
            setProcedureText('');
        }
    };

    const cambiarColor = (nuevoColor) => {
        setColor(nuevoColor);
    };

    const limpiarCanvas = () => {
        const context = ctxRef.current;
        const canvas = canvasRef.current;
        if (!context || !canvas) return;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (imageRef.current) {
            context.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        } else {
             context.fillStyle = '#FFFFFF';
             context.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const guardarImagen = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const dataURL = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `odontograma_${paciente.nombre}_${paciente.apellido}_${new Date().toISOString()}.png`;
            link.href = dataURL;
            link.click();
        } catch (error) {
            console.error("Error al guardar la imagen. Asegúrese de que la imagen base permite la exportación (CORS).", error);
        }
    };

    // --- Renderizado de Filas de Dientes (Estructura de Tabla Funcional) ---
    
    const renderToothNumberRow = (pieces) => (
        // El contenedor de cuadrante (8 celdas) solo maneja el diseño flex
        <div className="flex flex-1 text-center">
            {pieces.map((num) => {
                const hasProcedures = procedimientosAplicados.some(p => p.tooth === num);
                const isSelected = selectedTooth === num;

                return (
                    <div 
                        key={num} 
                        onClick={() => handleToothClick(num)}
                        className={`
                            relative flex-1 h-12 flex items-center justify-center 
                            font-extrabold text-gray-800 text-lg cursor-pointer transition-all duration-150 p-1 
                            border-r border-gray-300 // Borde divisor entre celdas
                            ${isSelected 
                                ? 'bg-indigo-100 ring-4 ring-indigo-500 rounded-lg shadow-lg scale-105 z-10' 
                                : 'bg-white hover:bg-gray-100 hover:shadow-md'
                            }
                        `}
                        // Se aumentó h-10 a h-12 para una proporción más cuadrada
                        style={{ borderBottom: hasProcedures ? '3px solid #10B981' : '2px solid #E5E7EB' }}
                        title={`Diente ${num}. Click para registrar procedimiento.`}
                    >
                        {num}
                        {hasProcedures && (
                             // Indicador de procedimiento registrado (punto verde)
                             <span className="w-2 h-2 ml-1 bg-green-500 rounded-full absolute -top-1 right-0"></span>
                        )}
                    </div>
                );
            })}
        </div>
    );

    // --- Formulario de Procedimiento (Render Condicional) ---
    const ProcedureForm = () => (
        <form onSubmit={addProcedure} className="w-full max-w-2xl mx-auto bg-indigo-50 p-4 my-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">
                Registrar Procedimiento en Diente: <span className="text-xl">{selectedTooth}</span>
            </h3>
            <div className="flex items-end gap-3">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Tratamiento/Diagnóstico</label>
                    <input
                        type="text"
                        value={procedureText}
                        onChange={(e) => setProcedureText(e.target.value)}
                        placeholder="Ej: Caries simple, Extracción, Resina"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`px-4 py-2 font-semibold rounded-md shadow-md transition-all whitespace-nowrap ${color === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                    Guardar ({color === 'red' ? 'Diagnóstico' : 'Restauración'})
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTooth(null)}
                    className="px-4 py-2 bg-gray-400 text-white font-semibold rounded-md shadow-md hover:bg-gray-500 transition whitespace-nowrap"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );


    // --- Render Principal ---

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b-4 border-indigo-500 pb-2">
                🦷 Odontograma Clínico Interactivo - **{paciente.nombre} {paciente.apellido}**
            </h1>
            
            {/* Contenedor Principal: Grilla de 2 Columnas (Odontograma | Historial) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
                
                {/* COLUMNA IZQUIERDA/CENTRO: Canvas de Dibujo y Tabla Funcional */}
                <div className="lg:col-span-2 flex flex-col items-center">
                    <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-200 w-full">
                        <h2 className="text-xl font-semibold mb-4 text-center text-indigo-700">Diagrama y Registro Odontológico</h2>
                        
                        {/* Controles de Dibujo */}
                        <div className="flex justify-center flex-wrap gap-4 mb-4 p-3 bg-gray-100 rounded-lg">
                            <button
                                className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-all ${color === "blue" ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}
                                onClick={() => cambiarColor("blue")}
                            >
                                🔵 Restauración (Azul)
                            </button>
                            <button
                                className={`px-4 py-2 font-semibold rounded-lg shadow-md transition-all ${color === "red" ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-red-200 text-red-800 hover:bg-red-300'}`}
                                onClick={() => cambiarColor("red")}
                            >
                                🔴 Diagnóstico (Rojo)
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition"
                                onClick={limpiarCanvas}
                            >
                                🧹 Limpiar Dibujo
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
                                onClick={guardarImagen}
                            >
                                💾 Guardar PNG
                            </button>
                        </div>

                        {/* --- NÚMEROS SUPERIORES (Cuadrantes 1 y 2) --- */}
                        <div className="flex justify-center w-full my-2">
                            {/* Borde completo excepto abajo para la fila superior */}
                            <div className="flex w-full border border-gray-300 border-b-0" style={{ maxWidth: `${CANVAS_WIDTH}px` }}>
                                {/* Cuadrante Superior Derecho (1) */}
                                {renderToothNumberRow(TOOTH_PIECES.superior_derecho)}
                                
                                {/* Línea media divisora */}
                                <div className="w-2 border-l-2 border-r-2 border-indigo-500 bg-gray-100"></div>
                                
                                {/* Cuadrante Superior Izquierdo (2) */}
                                {renderToothNumberRow(TOOTH_PIECES.superior_izquierdo)}
                            </div>
                        </div>

                        {/* 2. Formulario de Procedimiento CONDICIONAL */}
                        {selectedTooth && <ProcedureForm />}

                        {/* 3. ÁREA DE DIBUJO (Canvas) */}
                        <div className="flex justify-center my-1">
                            <canvas
                                ref={canvasRef}
                                className="border-4 border-gray-400 rounded-xl cursor-crosshair shadow-lg"
                                style={{
                                    width: '100%',
                                    maxWidth: `${CANVAS_WIDTH}px`,
                                    height: 'auto',
                                }}
                                // Eventos de ratón y toque (para ser responsive)
                                onMouseDown={iniciarDibujo}
                                onMouseMove={dibujar}
                                onMouseUp={terminarDibujo}
                                onMouseLeave={terminarDibujo}
                                onTouchStart={iniciarDibujo}
                                onTouchMove={dibujar}
                                onTouchEnd={terminarDibujo}
                            />
                        </div>

                        {/* --- NÚMEROS INFERIORES (Cuadrantes 4 y 3) --- */}
                         <div className="flex justify-center w-full my-2">
                            {/* Borde completo excepto arriba para la fila inferior */}
                            <div className="flex w-full border border-gray-300 border-t-0" style={{ maxWidth: `${CANVAS_WIDTH}px` }}>
                                {/* Cuadrante Inferior Derecho (4) - Reversa */}
                                {renderToothNumberRow(TOOTH_PIECES.inferior_derecho.slice().reverse())}
                                
                                {/* Línea media divisora */}
                                <div className="w-2 border-l-2 border-r-2 border-indigo-500 bg-gray-100"></div>
                                
                                {/* Cuadrante Inferior Izquierdo (3) */}
                                {renderToothNumberRow(TOOTH_PIECES.inferior_izquierdo)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Historial de Procedimientos */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-xl rounded-xl border border-gray-200">
                        <div className="p-4 bg-indigo-500 text-white font-semibold rounded-t-xl text-center">
                            📝 Historial de Tratamientos ({procedimientosAplicados.length})
                        </div>
                        <div className="p-0" style={{ maxHeight: '750px', overflowY: 'auto' }}>
                            {procedimientosAplicados.length === 0 ? (
                                <p className="text-center text-gray-500 p-4">
                                    No hay procedimientos registrados. Haz clic en un número de diente (ej. 18) para empezar.
                                </p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {procedimientosAplicados.map((p, index) => (
                                        <li key={p.tooth + p.timestamp} className="flex flex-col p-3 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xl mr-2 text-indigo-600">Diente {p.tooth}</span>
                                                <span 
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${p.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                                                >
                                                    {p.color === 'red' ? 'DIAGNÓSTICO' : 'RESTAURACIÓN'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 text-sm">{p.procedure}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OdontogramaClinico;
