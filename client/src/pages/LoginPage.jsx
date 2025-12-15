import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { LogIn, GraduationCap, School } from 'lucide-react';

const LoginPage = () => {
    const [role, setRole] = useState('student'); // 'student' | 'teacher'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        controlNumber: '',
        accessCode: ''
    });

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = role === 'teacher'
                ? { email: formData.email, password: formData.password, role: 'teacher' }
                : { controlNumber: formData.controlNumber, accessCode: formData.accessCode, role: 'student' };

            const res = await api.post('/auth/login', payload);
            login(res.data.user, res.data.token);
            toast.success('Sesión iniciada correctamente');
            navigate('/dashboard');
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                <div className="flex justify-center mb-6">
                    <div className={`p-3 rounded-full ${role === 'teacher' ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {role === 'teacher' ? <School className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center text-white mb-6">
                    {role === 'teacher' ? 'Portal Profesores' : 'Portal Estudiantes'}
                </h2>

                {/* Role Switcher */}
                <div className="flex bg-gray-700 rounded-lg p-1 mb-8">
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === 'student' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setRole('student')}
                    >
                        Estudiante
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === 'teacher' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setRole('teacher')}
                    >
                        Profesor
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {role === 'teacher' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email Institucional</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="profesor@tec.edu"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Número de Control</label>
                                <input
                                    type="text"
                                    name="controlNumber"
                                    value={formData.controlNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Ej. 221080173"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Código de Salón</label>
                                <input
                                    type="password"
                                    name="accessCode"
                                    value={formData.accessCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Clave compartida del curso"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className={`w-full py-3 px-4 font-bold rounded-lg transition-all duration-200 transform hover:scale-[1.02] text-white ${role === 'teacher'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                            }`}
                    >
                        {role === 'teacher' ? 'Iniciar Sesión' : 'Entrar al Curso'}
                    </button>
                </form>
                <div className="mt-6 text-center text-gray-400 text-sm">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className={`font-medium ${role === 'teacher' ? 'text-blue-400 hover:text-blue-300' : 'text-green-400 hover:text-green-300'}`}>
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
