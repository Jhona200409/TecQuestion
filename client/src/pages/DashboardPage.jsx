import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, FileText, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const DashboardPage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]); // Exams list (teacher's own or student's available)
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            fetchExams();
        }
    }, [user]);

    const fetchExams = async () => {
        try {
            let res;
            if (user.role === 'teacher') {
                res = await api.get('/exams/my-exams');
            } else {
                res = await api.get('/exams/available');
            }
            setExams(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTakeExam = (examId) => {
        navigate(`/take-exam/${examId}`);
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('¿Estás seguro de eliminar este examen? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/exams/${examId}`);
            toast.success('Examen eliminado');
            fetchExams(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar examen');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Navbar */}
            <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        TecQuestion
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-gray-300">
                        <span className="font-semibold text-white">{user?.name}</span> ({user?.role === 'teacher' ? 'Profesor' : 'Estudiante'})
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {user?.role === 'teacher' ? 'Mis Exámenes' : 'Exámenes Disponibles'}
                        </h1>
                        <p className="text-gray-400">
                            {user?.role === 'teacher'
                                ? 'Gestiona y crea nuevas evaluaciones.'
                                : 'Selecciona un examen para comenzar tu evaluación.'}
                        </p>
                    </div>
                    {user?.role === 'teacher' && (
                        <button
                            onClick={() => navigate('/create-exam')}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Nuevo Examen
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Cargando...</div>
                ) : exams.length === 0 ? (
                    <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No hay exámenes encontrados</h3>
                        <p className="text-gray-500">Intenta más tarde o crea uno nuevo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map((exam) => (
                            <div key={exam._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/30 transition-all shadow-lg hover:shadow-xl group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                                        <FileText className="w-8 h-8 text-blue-400" />
                                    </div>
                                    {user?.role === 'teacher' && (
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                            Activo
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{exam.title}</h3>
                                {user?.role === 'teacher' ? (
                                    <p className="text-gray-400 text-sm mb-4">
                                        {exam.questions?.length || 0} preguntas • Creado el {new Date(exam.createdAt).toLocaleDateString()}
                                    </p>
                                ) : (
                                    <div className="mb-4">
                                        <div className="flex items-center text-sm text-gray-400 mb-1">
                                            <span className="mr-2">Prof. {exam.creator?.name || 'Desconocido'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-yellow-500">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {exam.settings?.timeLimitPerQuestion ? `${exam.settings.timeLimitPerQuestion}s por pregunta` : 'Sin límite'}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-700 flex justify-between gap-3">
                                    {user?.role === 'teacher' ? (
                                        <>
                                            <button
                                                onClick={() => navigate(`/edit-exam/${exam._id}`)}
                                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors text-sm font-medium"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExam(exam._id)}
                                                className="bg-red-900/30 hover:bg-red-900/50 text-red-500 py-2 px-3 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleTakeExam(exam._id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Comenzar Examen
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
