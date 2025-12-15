import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, FileText, CheckCircle, Clock, Trash2, Users, School, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'classrooms'
    const [exams, setExams] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States for Classroom
    const [showClassModal, setShowClassModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [newClassCode, setNewClassCode] = useState('');

    const [selectedClassroom, setSelectedClassroom] = useState(null); // For detail view 
    const [newStudentMatricula, setNewStudentMatricula] = useState('');
    const [newStudentName, setNewStudentName] = useState('');

    // Student Edit State
    const [editingStudent, setEditingStudent] = useState(null);
    const [editName, setEditName] = useState('');
    const [editMatricula, setEditMatricula] = useState('');

    const handleRemoveStudent = async (classId, studentId) => {
        if (!window.confirm('¿Seguro que deseas remover a este alumno del salón?')) return;
        try {
            await api.delete(`/classrooms/${classId}/students/${studentId}`);
            toast.success('Alumno removido del salón');
            fetchData(); // Refresh list to update counts
            // Update local selected view
            const res = await api.get(`/classrooms/${classId}`);
            setSelectedClassroom(res.data);
        } catch (error) {
            toast.error('Error al remover alumno');
        }
    };

    const openEditStudent = (student) => {
        setEditingStudent(student);
        setEditName(student.name);
        setEditMatricula(student.controlNumber);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/classrooms/students/${editingStudent._id}`, {
                name: editName,
                controlNumber: editMatricula
            });
            toast.success('Datos del alumno actualizados');
            setEditingStudent(null);

            // Refresh
            if (activeTab === 'classrooms' && selectedClassroom) {
                const res = await api.get(`/classrooms/${selectedClassroom._id}`);
                setSelectedClassroom(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al actualizar');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'exams') {
                const res = user.role === 'teacher' ? await api.get('/exams/my-exams') : await api.get('/exams/available');
                setExams(res.data);
            } else if (activeTab === 'classrooms' && user.role === 'teacher') {
                const res = await api.get('/classrooms/my-classrooms');
                if (Array.isArray(res.data)) {
                    setClassrooms(res.data);
                } else {
                    setClassrooms([]);
                    console.error('Invalid classrooms response:', res.data);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- EXAM HANDLERS ---
    const handleTakeExam = (examId) => navigate(`/take-exam/${examId}`);

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('¿Eliminar examen?')) return;
        try {
            await api.delete(`/exams/${examId}`);
            toast.success('Examen eliminado');
            fetchData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    // --- CLASSROOM HANDLERS ---
    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classrooms', { name: newClassName, accessCode: newClassCode });
            toast.success('Salón creado');
            setShowClassModal(false);
            setNewClassName('');
            setNewClassCode('');
            // Refresh
            if (activeTab === 'classrooms') fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al crear salón');
        }
    };

    const handleAddStudent = async (classID) => {
        if (!newStudentMatricula) return;
        try {
            await api.post(`/classrooms/${classID}/students`, {
                studentMatricula: newStudentMatricula,
                name: newStudentName
            });
            toast.success('Alumno agregado');
            setNewStudentMatricula('');
            setNewStudentName(''); // Reset name

            // Update local state
            const res = await api.get(`/classrooms/${classID}`);
            setSelectedClassroom(res.data);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al agregar alumno');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Navbar */}
            <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <School className="w-8 h-8 text-blue-500" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        TecQuestion
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-gray-300 hidden md:block">
                        <span className="font-semibold text-white">{user?.name}</span> ({user?.role === 'teacher' ? 'Profesor' : 'Estudiante'})
                    </span>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all">
                        <LogOut className="w-4 h-4" /> Salir
                    </button>
                </div>
            </nav>

            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => { setActiveTab('exams'); setSelectedClassroom(null); }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'exams' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                            >
                                Exámenes
                            </button>
                            {user?.role === 'teacher' && (
                                <button
                                    onClick={() => { setActiveTab('classrooms'); setSelectedClassroom(null); }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'classrooms' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                >
                                    Mis Salones
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {user?.role === 'teacher' && (
                        <div>
                            {activeTab === 'exams' ? (
                                <button onClick={() => navigate('/create-exam')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all">
                                    <Plus className="w-5 h-5" /> Nuevo Examen
                                </button>
                            ) : (
                                <button onClick={() => setShowClassModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all">
                                    <Plus className="w-5 h-5" /> Crear Nuevo Salón
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Cargando...</div>
                ) : (
                    <>
                        {/* EXAMS TAB */}
                        {activeTab === 'exams' && (
                            exams?.length === 0 ? (
                                <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-gray-300">No hay exámenes</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exams?.map((exam) => {
                                        if (!exam) return null;
                                        return (
                                            <div key={exam._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/30 transition-all shadow-lg">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 bg-gray-700 rounded-lg"><FileText className="w-8 h-8 text-blue-400" /></div>
                                                    {user?.role === 'teacher' && <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Activo</span>}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{exam.title}</h3>

                                                {user?.role === 'teacher' ? (
                                                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
                                                        <button onClick={() => navigate(`/edit-exam/${exam._id}`)} className="text-blue-400 hover:text-white text-sm font-medium">Editar</button>
                                                        <button onClick={() => handleDeleteExam(exam._id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        {exam.attemptStatus === 'completed' ? (
                                                            <div className="w-full bg-green-600/20 text-green-400 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 border border-green-500/30">
                                                                <CheckCircle className="w-4 h-4" /> Completado
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleTakeExam(exam._id)}
                                                                className={`w-full font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-white transition-colors ${exam.attemptStatus === 'in-progress'
                                                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                                    }`}
                                                            >
                                                                {exam.attemptStatus === 'in-progress' ? (
                                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Continuar</span>
                                                                ) : (
                                                                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Iniciar</span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        )}

                        {/* CLASSROOMS TAB */}
                        {activeTab === 'classrooms' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* List of Classrooms */}
                                <div className="lg:col-span-1 space-y-4">
                                    {classrooms.map(cls => (
                                        <div
                                            key={cls._id}
                                            onClick={() => setSelectedClassroom(cls)}
                                            className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedClassroom?._id === cls._id ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-white">{cls.name}</h3>
                                                <School className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">Clave: <span className="font-mono text-yellow-400 bg-yellow-400/10 px-1 rounded">{cls.accessCode}</span></p>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {cls.students.length} alumnos
                                            </p>
                                        </div>
                                    ))}
                                    {classrooms.length === 0 && <p className="text-gray-500 text-center py-4">No has creado salones.</p>}
                                </div>

                                {/* Classroom Details / Students */}
                                <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-[400px]">
                                    {selectedClassroom ? (
                                        <>
                                            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-1">{selectedClassroom.name}</h2>
                                                    <p className="text-gray-400 flex items-center gap-2">
                                                        Código de Acceso:
                                                        <span className="bg-yellow-500/20 text-yellow-400 font-mono px-3 py-1 rounded text-lg tracking-widest select-all">
                                                            {selectedClassroom.accessCode}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-blue-500/10 rounded-full">
                                                    <Users className="w-8 h-8 text-blue-400" />
                                                </div>
                                            </div>

                                            <div className="mb-8">
                                                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Inscribir Alumno Manualmente</h3>
                                                <div className="flex flex-col md:flex-row gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre Completo (Ej. Juan Pérez)"
                                                        value={newStudentName}
                                                        onChange={(e) => setNewStudentName(e.target.value)}
                                                        className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Matrícula (Ej. 221080173)"
                                                        value={newStudentMatricula}
                                                        onChange={(e) => setNewStudentMatricula(e.target.value)}
                                                        className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <button
                                                        onClick={() => handleAddStudent(selectedClassroom._id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors whitespace-nowrap"
                                                    >
                                                        Registrar Alumno
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Lista de Asistencia ({selectedClassroom.students.length})</h3>
                                                <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                                                    {selectedClassroom.students.length === 0 ? (
                                                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                                            <Users className="w-12 h-12 mb-3 opacity-20" />
                                                            <p>Aún no hay alumnos inscritos.</p>
                                                            <p className="text-xs mt-1">Comparte el código <span className="text-yellow-500">{selectedClassroom.accessCode}</span></p>
                                                        </div>
                                                    ) : (
                                                        <div className="max-h-80 overflow-y-auto">
                                                            <table className="w-full text-left">
                                                                <thead className="bg-gray-800 text-gray-400 text-xs uppercase sticky top-0">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-center w-12">#</th>
                                                                        <th className="px-6 py-3">Nombre</th>
                                                                        <th className="px-6 py-3">Matrícula</th>
                                                                        <th className="px-6 py-3 text-center">Acciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-800">
                                                                    {selectedClassroom.students.map((student, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors group">
                                                                            <td className="px-6 py-4 text-gray-500 text-center">{idx + 1}</td>
                                                                            <td className="px-6 py-4 font-medium text-white">{student.name || 'Sin Nombre'}</td>
                                                                            <td className="px-6 py-4 font-mono text-gray-400 text-sm">{student.controlNumber}</td>
                                                                            <td className="px-6 py-4 flex justify-center gap-2">
                                                                                <button
                                                                                    onClick={() => openEditStudent(student)}
                                                                                    className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                                                    title="Editar Datos"
                                                                                >
                                                                                    <Pencil className="w-4 h-4" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleRemoveStudent(selectedClassroom._id, student._id)}
                                                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                                                                    title="Eliminar del Salón"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>

                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                            <School className="w-20 h-20 mb-4 opacity-10" />
                                            <p className="text-lg font-medium">Selecciona un salón para gestionar</p>
                                            <p className="text-sm opacity-60">O crea uno nuevo con el botón verde</p>
                                        </div>
                                    )}
                                </div>
                            </div >
                        )}
                    </>
                )}
            </main >

            {/* UPDATE STUDENT MODAL */}
            {
                editingStudent && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-4">Editar Alumno</h2>
                            <form onSubmit={handleUpdateStudent} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Matrícula</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        value={editMatricula}
                                        onChange={e => setEditMatricula(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 py-3 text-gray-400 hover:text-white">Cancelar</button>
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* CREATE CLASSROOM MODAL */}
            {
                showClassModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl transform transition-all scale-100">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <School className="w-8 h-8 text-blue-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Crear Nuevo Salón</h2>
                                <p className="text-gray-400 text-sm mt-1">Organiza a tus alumnos en grupos</p>
                            </div>

                            <form onSubmit={handleCreateClassroom} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Nombre del Grupo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-600"
                                        placeholder="Ej. Matemáticas I - Grupo A"
                                        value={newClassName}
                                        onChange={e => setNewClassName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Código de Acceso (Contraseña)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-600 font-mono"
                                        placeholder="Ej. MateA2025"
                                        value={newClassCode}
                                        onChange={e => setNewClassCode(e.target.value)}
                                    />
                                    <p className="text-xs text-blue-400 mt-2 flex items-start gap-1">
                                        <span className="font-bold">Nota:</span> Este será el código único que usarán tus alumnos para ingresar.
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-3 text-gray-400 hover:text-white font-medium transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]">
                                        Crear Salón
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default DashboardPage;
