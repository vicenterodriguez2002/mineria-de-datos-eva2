export default function Button({ children, variant = 'primary', onClick, className = '' }) {
  const baseStyles = 'font-bold py-3 px-6 rounded-lg transition-colors duration-200';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
