import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, FileText, Users, School } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const DashboardPage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user && user.role === 'teacher') {
            fetchExams();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams/my-exams');
            setExams(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Navbar */}
            <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <School className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        TecQuestion
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-gray-300">
                        Hola, <span className="font-semibold text-white">{user?.name}</span> ({user?.role === 'teacher' ? 'Profesor' : 'Estudiante'})
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8 max-w-7xl mx-auto">
                {user?.role === 'teacher' ? (
                    // Teacher View
                    <div>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Mis Exámenes</h1>
                                <p className="text-gray-400">Gestiona y crea nuevas evaluaciones para tus estudiantes.</p>
                            </div>
                            <button
                                onClick={() => navigate('/create-exam')}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Crear Nuevo Examen
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12 text-gray-500">Cargando...</div>
                        ) : exams.length === 0 ? (
                            <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-300 mb-2">No has creado exámenes aún</h3>
                                <p className="text-gray-500 mb-6">Comienza creando tu primera evaluación para compartirla con tus alumnos.</p>
                                <button
                                    onClick={() => navigate('/create-exam')}
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    Crear examen ahora &rarr;
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.map((exam) => (
                                    <div key={exam._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors shadow-lg hover:shadow-xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                                                <FileText className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                                Activo
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{exam.title}</h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {exam.questions?.length || 0} preguntas • Creado el {new Date(exam.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                                            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                                Ver Detalles
                                            </button>
                                            <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                                Resultados
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Student View (Placeholder)
                    <div className="text-center py-20">
                        <div className="inline-block p-4 bg-gray-800 rounded-full mb-6 relative">
                            <Users className="w-16 h-16 text-green-500" />
                            <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">Coming Soon</div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Portal del Estudiante</h1>
                        <p className="text-gray-400 max-w-md mx-auto text-lg">
                            Próximamente podrás ver tus exámenes asignados y realizar evaluaciones desde aquí.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
