import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, linkTo }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (linkTo) navigate(linkTo);
    };

    return (
        <div
            onClick={handleClick}
            className={`card-hover p-5 border-t-[3px] border-t-accent-500 ${linkTo ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-dark-500 text-xs font-medium uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-primary-800 mt-1">{value}</p>
                    {trend && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                            {trend}
                        </p>
                    )}
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
                    {Icon && <Icon className="w-5 h-5 text-accent-500" />}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
