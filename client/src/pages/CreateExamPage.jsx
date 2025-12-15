import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle } from 'lucide-react';

const CreateExamPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        {
            text: '',
            type: 'multiple-choice',
            points: 10,
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        }
    ]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: '',
                type: 'multiple-choice',
                points: 10,
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
            }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const newQuestions = [...questions];
        if (field === 'isCorrect') {
            // Ensure only one correct answer for now (or multiple depending on logic, let's stick to simple radio-like behavior for UI)
            // Actually, let's allow multiple if needed, but for multiple-choice typically one is correct.
            // Let's reset others if we set this one to true? Or just let user manage it.
            // For simplicity/robustness, let's just update the value.
            // But usually checkboxes allow multiple correct. Let's stick to the value passed.
            newQuestions[qIndex].options[oIndex][field] = value;
        } else {
            newQuestions[qIndex].options[oIndex][field] = value;
        }
        setQuestions(newQuestions);
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(newQuestions);
    };

    const validateExam = () => {
        if (!title.trim()) return 'El título del examen es requerido.';
        if (questions.length === 0) return 'Debes agregar al menos una pregunta.';

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) return `La pregunta ${i + 1} no tiene texto.`;
            if (q.options.length < 2) return `La pregunta ${i + 1} debe tener al menos 2 opciones.`;

            let hasCorrect = false;
            for (let j = 0; j < q.options.length; j++) {
                if (!q.options[j].text.trim()) return `La opción ${j + 1} de la pregunta ${i + 1} está vacía.`;
                if (q.options[j].isCorrect) hasCorrect = true;
            }
            if (!hasCorrect) return `La pregunta ${i + 1} debe tener al menos una respuesta correcta.`;
        }
        return null;
    };

    const handleSaveExam = async () => {
        const error = validateExam();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            await api.post('/exams', { title, questions });
            toast.success('Examen creado exitosamente');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error al guardar el examen');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al Dashboard
                    </button>
                    <button
                        onClick={handleSaveExam}
                        className="flex items-center bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold transition-colors"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Guardar Examen
                    </button>
                </div>

                {/* Exam Title */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-8">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Título del Examen</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Ej. Parcial de Matemáticas - Unidad 1"
                    />
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 relative">
                            {/* Remove Question Button */}
                            <button
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                                title="Eliminar pregunta"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <h3 className="text-lg font-semibold text-gray-300 mb-4">Pregunta {qIndex + 1}</h3>

                            {/* Question Text & Points */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Texto de la pregunta</label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                        placeholder="¿Cuál es la capital de Francia?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Puntos</label>
                                    <input
                                        type="number"
                                        value={q.points}
                                        onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Opciones de respuesta</label>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOptionChange(qIndex, oIndex, 'isCorrect', !opt.isCorrect)}
                                            className={`p-2 rounded-full transition-colors ${opt.isCorrect ? 'text-green-500 bg-green-500/10' : 'text-gray-500 hover:bg-gray-700'}`}
                                            title="Marcar como correcta"
                                        >
                                            <CheckCircle className={`w-5 h-5 ${opt.isCorrect ? 'fill-current' : ''}`} />
                                        </button>
                                        <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                            className={`flex-1 px-3 py-2 bg-gray-700 border rounded text-white focus:outline-none transition-colors ${opt.isCorrect ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-600 focus:border-blue-500'}`}
                                            placeholder={`Opción ${oIndex + 1}`}
                                        />
                                        <button
                                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                                            className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                            disabled={q.options.length <= 2}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleAddOption(qIndex)}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center mt-2"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Agregar Opción
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Question Button */}
                    <button
                        onClick={handleAddQuestion}
                        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all flex items-center justify-center font-medium"
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Agregar Nueva Pregunta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateExamPage;
