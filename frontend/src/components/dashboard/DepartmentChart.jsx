import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DepartmentChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-dark-400 text-sm">
                No chart data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="department"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        fontSize: '13px',
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar dataKey="publications" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Publications" />
                <Bar dataKey="patents" fill="#f97316" radius={[4, 4, 0, 0]} name="Patents" />
                <Bar dataKey="workshops" fill="#10b981" radius={[4, 4, 0, 0]} name="Workshops" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DepartmentChart;
