const StatCard = ({ title, value, color = 'bg-blue-500', icon = '📊', onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} rounded-lg p-3 text-2xl`}>
          {icon}
        </div>
      </div>
    </button>
  );
};

export default StatCard;
