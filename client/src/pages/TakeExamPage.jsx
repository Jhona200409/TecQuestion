import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const TakeExamPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);

    // Feedback state
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [timerPaused, setTimerPaused] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Fetch Exam & Attempt
    useEffect(() => {
        const fetchExamAndAttempt = async () => {
            try {
                const examRes = await api.get(`/exams/${id}`);
                setExam(examRes.data);

                const attemptRes = await api.post(`/exams/${id}/start`);
                const attempt = attemptRes.data;

                if (attempt.completed) {
                    toast.error('Este examen ya fue completado.');
                    navigate('/dashboard');
                    return;
                }

                if (attempt.answers && attempt.answers.length > 0) {
                    setAnswers(attempt.answers);
                    setCurrentQuestionIndex(attempt.lastQuestionIndex || 0);
                }

                if (examRes.data.settings?.timeLimitPerQuestion) {
                    setTimeLeft(examRes.data.settings.timeLimitPerQuestion);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar el examen');
                navigate('/dashboard');
            }
        };
        fetchExamAndAttempt();
    }, [id, navigate]);

    // Timer Logic
    useEffect(() => {
        if (!exam || loading || timerPaused) return;

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
    }, [currentQuestionIndex, exam, loading, timerPaused]);

    const handleTimeUp = () => {
        handleSelectAnswer(null);
    };

    const handleSelectAnswer = async (selectedOptionText) => {
        if (isChecking || showFeedback) return;

        const currentQuestion = exam.questions[currentQuestionIndex];
        setIsChecking(true);
        setTimerPaused(true);
        setSelectedAnswer(selectedOptionText);

        try {
            // Call backend to check the answer
            const res = await api.post(`/exams/${id}/check-answer`, {
                questionId: currentQuestion._id,
                selectedOptionText: selectedOptionText
            });

            setIsCorrect(res.data.isCorrect);
            setCorrectAnswer(res.data.correctAnswer);
            setShowFeedback(true);

            // Save answer locally
            const newAnswer = {
                questionId: currentQuestion._id,
                selectedOptionText: selectedOptionText
            };
            const updatedAnswers = [...answers, newAnswer];
            setAnswers(updatedAnswers);

            // Auto-save progress
            const nextIndex = currentQuestionIndex + 1;
            const isFinished = nextIndex >= exam.questions.length;
            api.put(`/exams/${id}/progress`, {
                answers: updatedAnswers,
                lastQuestionIndex: isFinished ? currentQuestionIndex : nextIndex
            }).catch(err => console.error("Autosave failed", err));

        } catch (error) {
            console.error("Error checking answer:", error);
            toast.error('Error al verificar respuesta');
        } finally {
            setIsChecking(false);
        }
    };

    const handleContinue = () => {
        const nextIndex = currentQuestionIndex + 1;
        const isFinished = nextIndex >= exam.questions.length;

        setShowFeedback(false);
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setTimerPaused(false);

        if (!isFinished) {
            setCurrentQuestionIndex(nextIndex);
            if (exam.settings?.timeLimitPerQuestion) {
                setTimeLeft(exam.settings.timeLimitPerQuestion);
            } else {
                setTimeLeft(30);
            }
        } else {
            submitExam(answers);
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

    const getOptionStyle = (optionText) => {
        if (!showFeedback) {
            return "bg-gray-700/50 hover:bg-blue-600/20 border-gray-600 hover:border-blue-500/50";
        }

        // During feedback - show correct answer in green
        if (optionText === correctAnswer) {
            return "bg-green-600/30 border-green-500 ring-2 ring-green-500";
        }
        // Show selected wrong answer in red
        if (optionText === selectedAnswer && !isCorrect) {
            return "bg-red-600/30 border-red-500 ring-2 ring-red-500";
        }
        return "bg-gray-700/30 border-gray-600 opacity-50";
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                {/* Header Info */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">{exam.title}</h2>
                        <span className="text-sm text-gray-500">Pregunta {currentQuestionIndex + 1} de {exam.questions.length}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${showFeedback
                            ? 'bg-gray-500/20 text-gray-400'
                            : timeLeft < 10
                                ? 'bg-red-500/20 text-red-500 animate-pulse'
                                : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        <Clock className="w-5 h-5" />
                        {showFeedback ? '⏸️' : `${timeLeft}s`}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
                    <div
                        className="bg-blue-500 h-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Feedback Banner */}
                {showFeedback && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${isCorrect
                            ? 'bg-green-600/20 border border-green-500/50'
                            : 'bg-red-600/20 border border-red-500/50'
                        }`}>
                        <div className="flex items-center gap-4">
                            {isCorrect ? (
                                <>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                    <div>
                                        <p className="text-xl font-bold text-green-400">¡Correcto!</p>
                                        <p className="text-green-300/80 text-sm">Excelente respuesta</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-8 h-8 text-red-500" />
                                    <div>
                                        <p className="text-xl font-bold text-red-400">
                                            {selectedAnswer ? 'Incorrecto' : 'Tiempo agotado'}
                                        </p>
                                        <p className="text-red-300/80 text-sm">
                                            La respuesta correcta está marcada en <span className="font-bold text-green-400">verde</span>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Question Card */}
                <div className={`bg-gray-800 border rounded-2xl p-8 shadow-2xl relative overflow-hidden ${showFeedback
                        ? isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                        : 'border-gray-700'
                    }`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${showFeedback
                            ? isCorrect ? 'bg-green-500' : 'bg-red-500'
                            : 'bg-blue-500'
                        }`}></div>

                    <h1 className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
                        {currentQuestion.text}
                    </h1>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => !showFeedback && !isChecking && handleSelectAnswer(option.text)}
                                disabled={showFeedback || isChecking}
                                className={`group relative p-6 border rounded-xl text-left transition-all duration-200 ${getOptionStyle(option.text)} ${!showFeedback && !isChecking ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${showFeedback && option.text === correctAnswer
                                            ? 'bg-green-500 text-white'
                                            : showFeedback && option.text === selectedAnswer && !isCorrect
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-600 group-hover:bg-blue-500'
                                        }`}>
                                        {showFeedback && option.text === correctAnswer ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : showFeedback && option.text === selectedAnswer && !isCorrect ? (
                                            <XCircle className="w-5 h-5" />
                                        ) : (
                                            String.fromCharCode(65 + idx)
                                        )}
                                    </div>
                                    <span className={`text-lg font-medium ${showFeedback && option.text === correctAnswer
                                            ? 'text-green-300'
                                            : showFeedback && option.text === selectedAnswer && !isCorrect
                                                ? 'text-red-300'
                                                : 'text-gray-200 group-hover:text-white'
                                        }`}>
                                        {option.text}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Continue Button or Instructions */}
                <div className="mt-6 text-center">
                    {showFeedback ? (
                        <button
                            onClick={handleContinue}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
                        >
                            {currentQuestionIndex + 1 >= exam.questions.length ? 'Finalizar Examen' : 'Continuar'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : isChecking ? (
                        <div className="flex items-center justify-center gap-2 text-blue-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verificando respuesta...
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            Selecciona una respuesta para continuar. <br />
                            <span className="text-red-400 flex items-center justify-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> Si el tiempo termina, la pregunta contará como incorrecta.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeExamPage;
