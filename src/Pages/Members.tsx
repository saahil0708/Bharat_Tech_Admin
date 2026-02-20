import { Search, Filter, Plus, Mail, Phone, Calendar } from 'lucide-react';

const Members = () => {
    const members = [
        { id: 1, name: 'Aryan Sharma', email: 'aryan@example.com', phone: '+91 98765 43210', plan: 'Gold', status: 'Active', joined: '12 Jan 2026' },
        { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '+91 98765 43211', plan: 'Silver', status: 'Active', joined: '15 Jan 2026' },
        { id: 3, name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91 98765 43212', plan: 'Platinum', status: 'Inactive', joined: '02 Feb 2026' },
        { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 98765 43213', plan: 'Gold', status: 'Active', joined: '10 Feb 2026' },
        { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 43214', plan: 'Gold', status: 'Active', joined: '12 Feb 2026' },
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Members <span className="text-[#ff0000]">Directory</span></h1>
                    <p className="text-gray-500">Manage and monitor all your members in one place.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#ff0000] hover:bg-[#d00000] text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)] font-semibold">
                    <Plus size={20} />
                    Add Member
                </button>
            </div>

            <div className="bg-[#121212] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[#1e1e1e] flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg py-2 pl-10 pr-4 text-sm text-gray-400 focus:outline-none focus:border-[#ff0000]/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Member</th>
                                <th className="px-6 py-4 font-semibold">Contact</th>
                                <th className="px-6 py-4 font-semibold">Plan</th>
                                <th className="px-6 py-4 font-semibold">Joined Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b0000] to-[#ff0000] flex items-center justify-center text-white font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-200">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail size={12} className="text-[#ff0000]" />
                                                {member.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone size={12} className="text-[#ff0000]" />
                                                {member.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <span className="px-3 py-1 bg-[#1e1e1e] rounded-full border border-[#ff0000]/10">{member.plan}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-500" />
                                            {member.joined}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${member.status === 'Active'
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-500 hover:text-[#ff0000] transition-colors p-2 hover:bg-[#ff0000]/5 rounded-lg">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Members;
