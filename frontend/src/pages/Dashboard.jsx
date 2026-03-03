import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatCard from '../components/dashboard/StatCard';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import { Users, BookOpen, Lightbulb, Award, Mic, FileCheck, TrendingUp, Download, FileSpreadsheet, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAcademicYears from '../hooks/useAcademicYears';
import RankingsPanel from '../components/dashboard/RankingsPanel';
import DomainChart from '../components/dashboard/DomainChart';
import ReminderBanner from '../components/ui/ReminderBanner';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [topContributors, setTopContributors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({ department: '', academicYear: '' });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const { academicYears } = useAcademicYears();

    useEffect(() => {
        fetchData();
        if (user.role === 'admin') {
            fetchDepartments();
        }
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/users/departments');
            setDepartments(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.department) params.department = filters.department;
            if (filters.academicYear) params.academicYear = filters.academicYear;

            const [statsRes, chartRes, trendRes, topRes] = await Promise.all([
                API.get('/dashboard/stats', { params }),
                API.get('/dashboard/chart', { params }),
                API.get('/dashboard/trends', { params }),
                API.get('/dashboard/top-contributors', { params }),
            ]);

            setStats(statsRes.data.data);
            setChartData(chartRes.data.data);
            setTrendData(trendRes.data.data);
            setTopContributors(topRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        setExporting(true);
        try {
            const params = {};
            if (filters.department) params.department = filters.department;
            if (filters.academicYear) params.academicYear = filters.academicYear;

            const endpoint = type === 'naac' ? '/export/naac' : '/export/excel';
            const filename = type === 'naac' ? 'NAAC_Report.xlsx' : 'RDMS_Report.xlsx';

            const response = await API.get(endpoint, { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            {/* Reminder Banner */}
            <ReminderBanner />

            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
                    <p className="text-dark-500 text-sm mt-1">
                        {user.role === 'admin' ? 'Overview of all departments' : `${user.department} Department Overview`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="btn-secondary flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                        onClick={() => handleExport('naac')}
                        disabled={exporting}
                        className="btn-accent flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> NAAC
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    {user.role === 'admin' && (
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="select-field w-full sm:w-auto sm:min-w-[180px]"
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filters.academicYear}
                        onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                        className="select-field w-full sm:w-auto sm:min-w-[160px]"
                    >
                        <option value="">All Years</option>
                        {academicYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    {(filters.department || filters.academicYear) && (
                        <button
                            onClick={() => setFilters({ department: '', academicYear: '' })}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
                        <StatCard title="Faculty" value={stats?.totalFaculty || 0} icon={Users} color="primary" linkTo="/faculty" />
                        <StatCard title="Publications" value={stats?.totalPublications || 0} icon={BookOpen} color="emerald" linkTo="/explore?tab=publications" />
                        <StatCard title="Patents" value={stats?.totalPatents || 0} icon={Lightbulb} color="amber" linkTo="/explore?tab=patents" />
                        <StatCard title="Workshops" value={stats?.totalWorkshops || 0} icon={Award} color="rose" linkTo="/explore?tab=workshops" />
                        <StatCard title="Seminars" value={stats?.totalSeminars || 0} icon={Mic} color="violet" linkTo="/explore?tab=seminars" />
                        <StatCard title="Certifications" value={stats?.totalCertifications || 0} icon={FileCheck} color="sky" linkTo="/explore?tab=certifications" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Department Chart */}
                        <div className="card p-5">
                            <h2 className="text-lg font-semibold text-primary-800 mb-4">Department-wise Research Output</h2>
                            <DepartmentChart data={chartData} />
                        </div>

                        {/* Year Trend Chart */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-accent-500" />
                                <h2 className="text-lg font-semibold text-primary-800">Year-over-Year Trends</h2>
                            </div>
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '13px' }} />
                                        <Legend wrapperStyle={{ fontSize: '13px' }} />
                                        <Line type="monotone" dataKey="publications" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4 }} name="Publications" />
                                        <Line type="monotone" dataKey="patents" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Patents" />
                                        <Line type="monotone" dataKey="workshops" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Workshops" />
                                        <Line type="monotone" dataKey="seminars" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Seminars" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-dark-400 text-sm">No trend data available</div>
                            )}
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-5 h-5 text-accent-500" />
                            <h2 className="text-lg font-semibold text-primary-800">Top Contributors</h2>
                        </div>
                        {topContributors.length > 0 ? (
                            <div className="overflow-x-auto -mx-5">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead>
                                        <tr className="bg-primary-800">
                                            <th className="text-left py-3 px-4 font-medium text-white">Rank</th>
                                            <th className="text-left py-3 px-4 font-medium text-white">Faculty Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-white">Department</th>
                                            <th className="text-center py-3 px-4 font-medium text-white">Publications</th>
                                            <th className="text-center py-3 px-4 font-medium text-white">Patents</th>
                                            <th className="text-center py-3 px-4 font-medium text-white">Workshops</th>
                                            <th className="text-center py-3 px-4 font-medium text-white">Seminars</th>
                                            <th className="text-center py-3 px-4 font-medium text-white">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topContributors.map((c, i) => (
                                            <tr key={c._id} className="border-t border-dark-100 hover:bg-accent-50">
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-dark-50 text-dark-500'
                                                        }`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-medium text-dark-900">{c.name}</td>
                                                <td className="py-3 px-4 text-dark-600">{c.department}</td>
                                                <td className="py-3 px-4 text-center text-primary-800 font-semibold">{c.publications}</td>
                                                <td className="py-3 px-4 text-center text-primary-800 font-semibold">{c.patents}</td>
                                                <td className="py-3 px-4 text-center text-primary-800 font-semibold">{c.workshops}</td>
                                                <td className="py-3 px-4 text-center text-primary-800 font-semibold">{c.seminars}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-accent-100 text-accent-700 font-bold text-sm px-3 py-1 rounded-full">
                                                        {c.total}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-6">No contributors data available</p>
                        )}
                    </div>

                    {/* Rankings & Domain Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <RankingsPanel />
                        <DomainChart />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
