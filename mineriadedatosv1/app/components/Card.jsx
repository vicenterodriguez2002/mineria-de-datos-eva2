export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
