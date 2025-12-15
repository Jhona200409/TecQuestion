import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const TakeExamPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // [{ questionId, selectedOptionText }]
    const [timeLeft, setTimeLeft] = useState(30); // Default, will update from setup

    // Fetch Exam
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await api.get(`/exams/${id}`);
                setExam(res.data);
                // Set initial timer based on settings
                if (res.data.settings?.timeLimitPerQuestion) {
                    setTimeLeft(res.data.settings.timeLimitPerQuestion);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar el examen');
                navigate('/dashboard');
            }
        };
        fetchExam();
    }, [id, navigate]);

    // Timer Logic
    useEffect(() => {
        if (!exam || loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, exam, loading]);

    const handleTimeUp = () => {
        // Auto-submit empty or current selection if we tracked it differently
        // For strict rules: if time is up, they missed it.
        handleNextQuestion(null);
    };

    const handleNextQuestion = (selectedOptionText) => {
        const currentQuestion = exam.questions[currentQuestionIndex];

        // Save Answer
        const newAnswer = {
            questionId: currentQuestion._id,
            selectedOptionText: selectedOptionText // can be null if timed out
        };

        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);

        // Move to next or Submit
        if (currentQuestionIndex < exam.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            // Reset timer for next question
            if (exam.settings?.timeLimitPerQuestion) {
                setTimeLeft(exam.settings.timeLimitPerQuestion);
            } else {
                setTimeLeft(30); // Fallback
            }
        } else {
            submitExam(newAnswers);
        }
    };

    const submitExam = async (finalAnswers) => {
        try {
            setLoading(true);
            await api.post(`/exams/${id}/submit`, { answers: finalAnswers });
            toast.success('¡Examen completado!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar respuestas');
            setLoading(false);
        }
    };

    if (loading || !exam) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    const currentQuestion = exam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / exam.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                {/* Header Info */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">{exam.title}</h2>
                        <span className="text-sm text-gray-500">Pregunta {currentQuestionIndex + 1} de {exam.questions.length}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${timeLeft < 10 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Clock className="w-5 h-5" />
                        {timeLeft}s
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
                    <div
                        className="bg-blue-500 h-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                    <h1 className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
                        {currentQuestion.text}
                    </h1>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleNextQuestion(option.text)}
                                className="group relative p-6 bg-gray-700/50 hover:bg-blue-600/20 border border-gray-600 hover:border-blue-500/50 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-600 group-hover:bg-blue-500 flex items-center justify-center text-lg font-bold transition-colors">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-lg font-medium text-gray-200 group-hover:text-white">
                                        {option.text}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-500 text-sm">
                    Selecciona una respuesta para avanzar automáticamente. <br />
                    <span className="text-red-400 flex items-center justify-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Si el tiempo termina, la pregunta contará como incorrecta.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TakeExamPage;
