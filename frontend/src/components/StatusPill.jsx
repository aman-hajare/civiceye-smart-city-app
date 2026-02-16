const statusStyles = {
  PENDING: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const StatusPill = ({ status }) => {
  const label = String(status || "UNKNOWN").replaceAll("_", " ");
  const style = statusStyles[status] || "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</span>;
};

export default StatusPill;
