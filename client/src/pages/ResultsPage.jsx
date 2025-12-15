import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    BarChart3,
    Users,
    CheckCircle,
    Clock,
    XCircle,
    Trophy,
    Target,
    Percent
} from 'lucide-react';

const ResultsPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [resultsData, setResultsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load classrooms and exams on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [classRes, examRes] = await Promise.all([
                    api.get('/classrooms/my-classrooms'),
                    api.get('/exams/my-exams')
                ]);
                setClassrooms(classRes.data || []);
                setExams(examRes.data || []);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Load results when both classroom and exam are selected
    useEffect(() => {
        if (selectedClassroom && selectedExam) {
            loadResults();
        }
    }, [selectedClassroom, selectedExam]);

    const loadResults = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/exams/${selectedExam._id}/results/${selectedClassroom._id}`);
            setResultsData(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar resultados');
            setResultsData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-medium"><CheckCircle className="w-3 h-3" /> Completado</span>;
            case 'in-progress':
                return <span className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded text-xs font-medium"><Clock className="w-3 h-3" /> En progreso</span>;
            default:
                return <span className="flex items-center gap-1 text-gray-400 bg-gray-500/10 px-2 py-1 rounded text-xs font-medium"><XCircle className="w-3 h-3" /> Sin iniciar</span>;
        }
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        if (percentage >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    if (!user || user.role !== 'teacher') {
        navigate('/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold">Resultados de Exámenes</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Classroom Selector */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">
                            1. Seleccionar Salón
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {classrooms.map(cls => (
                                <button
                                    key={cls._id}
                                    onClick={() => { setSelectedClassroom(cls); setResultsData(null); }}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedClassroom?._id === cls._id
                                            ? 'bg-purple-600/20 border-purple-500 text-white'
                                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                                        }`}
                                >
                                    <p className="font-medium">{cls.name}</p>
                                    <p className="text-xs text-gray-400">{cls.students?.length || 0} alumnos</p>
                                </button>
                            ))}
                            {classrooms.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No tienes salones creados</p>
                            )}
                        </div>
                    </div>

                    {/* Exam Selector */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">
                            2. Seleccionar Examen
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {exams.map(exam => (
                                <button
                                    key={exam._id}
                                    onClick={() => { setSelectedExam(exam); }}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedExam?._id === exam._id
                                            ? 'bg-purple-600/20 border-purple-500 text-white'
                                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                                        }`}
                                >
                                    <p className="font-medium">{exam.title}</p>
                                    <p className="text-xs text-gray-400">{exam.questions?.length || 0} preguntas</p>
                                </button>
                            ))}
                            {exams.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No tienes exámenes creados</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {isLoading && selectedClassroom && selectedExam && (
                    <div className="text-center py-12 text-gray-500">Cargando resultados...</div>
                )}

                {resultsData && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">{resultsData.summary.totalStudents}</p>
                                <p className="text-xs text-gray-400">Total Alumnos</p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-400">{resultsData.summary.completed}</p>
                                <p className="text-xs text-gray-400">Completados</p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                                <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-yellow-400">{resultsData.summary.inProgress}</p>
                                <p className="text-xs text-gray-400">En Progreso</p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                                <XCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-gray-400">{resultsData.summary.notStarted}</p>
                                <p className="text-xs text-gray-400">Sin Iniciar</p>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/30 text-center">
                                <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-purple-400">{resultsData.summary.averageScore}%</p>
                                <p className="text-xs text-gray-400">Promedio</p>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                                <h3 className="text-lg font-bold text-white">
                                    Resultados: {resultsData.exam.title} - {resultsData.classroom.name}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Alumno</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Matrícula</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">Estado</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                                                <div className="flex items-center justify-center gap-1"><Target className="w-3 h-3" /> Aciertos</div>
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                                                <div className="flex items-center justify-center gap-1"><Percent className="w-3 h-3" /> Calificación</div>
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">Puntos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {resultsData.results.map((result, index) => (
                                            <tr key={result.studentId} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-white">{result.studentName}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-sm text-gray-400">{result.controlNumber}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {getStatusBadge(result.status)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-white font-medium">
                                                        {result.correctAnswers} / {result.totalQuestions}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                                                        {result.percentage}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-gray-300">
                                                        {result.score} / {result.maxScore}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {!selectedClassroom || !selectedExam ? (
                    <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">Selecciona un salón y un examen</h3>
                        <p className="text-gray-500">para ver los resultados de tus alumnos</p>
                    </div>
                ) : null}
            </main>
        </div>
    );
};

export default ResultsPage;
