'use client';
import React, { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Calendar,
    Clock,
    FileText,
    Globe,
    Server,
    Target,
    TrendingDown,
    TrendingUp,
    Upload
} from 'lucide-react';

const JsonDataDashboard = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // 颜色配置
    const COLORS = {
        danger: '#DC2626',
        critical: '#EA580C',
        warning: '#D97706',
        primary: '#2563EB',
        success: '#059669',
        info: '#7C3AED',
        gray: '#6B7280'
    };

    // 加载JSON文件
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            setLoading(true);
            setError(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setReportData(jsonData);
                    setLoading(false);
                    console.log('JSON数据加载成功:', jsonData);
                } catch (err) {
                    setError('JSON文件格式错误，请检查文件内容');
                    setLoading(false);
                }
            };
            reader.readAsText(file);
        } else {
            setError('请选择有效的JSON文件');
        }
    };

    // 从URL加载JSON数据（如果有的话）
    const loadJsonFromUrl = async (url) => {
        try {
            setLoading(true);
            const response = await fetch(url);
            const data = await response.json();
            setReportData(data);
            setLoading(false);
        } catch (err) {
            setError('无法从URL加载数据: ' + err.message);
            setLoading(false);
        }
    };

    // 处理可访问率分组数据
    const getAccessibilityGroupData = () => {
        if (!reportData?.accessibility_rate_dimension?.rate_groups) return [];

        const groups = reportData.accessibility_rate_dimension.rate_groups;
        const total = reportData.metadata?.total_platforms || Object.values(groups).reduce((sum, count) => sum + count, 0);

        return Object.entries(groups).map(([range, count]) => ({
            range: range === 'completely_inaccessible' ? '完全不可访问(0%)' : range,
            count,
            percentage: ((count / total) * 100).toFixed(1),
            fill: range === 'completely_inaccessible' ? COLORS.danger :
                range === '1-50%' ? COLORS.critical :
                    range === '50-60%' ? COLORS.warning :
                        range === '99%+' ? COLORS.success : COLORS.primary
        }));
    };

    // 处理失效时间线数据
    const getFailureTimelineData = () => {
        if (!reportData?.country_dimension?.failure_timeline) return [];

        return Object.entries(reportData.country_dimension.failure_timeline)
            .map(([month, count]) => ({
                month: month.substring(5), // 只保留MM部分
                fullMonth: month,
                count,
                cumulative: Object.entries(reportData.country_dimension.failure_timeline)
                    .filter(([m, _]) => m <= month)
                    .reduce((sum, [_, c]) => sum + c, 0)
            }))
            .sort((a, b) => a.fullMonth.localeCompare(b.fullMonth));
    };

    // 处理国家分布数据
    const getCountryDistributionData = () => {
        if (!reportData?.country_dimension?.inaccessible_by_country) return [];

        return Object.entries(reportData.country_dimension.inaccessible_by_country)
            .map(([country, count]) => ({
                country: country === 'China' ? '中国' :
                    country === 'Germany' ? '德国' :
                        country === 'France' ? '法国' :
                            country === 'United States' ? '美国' :
                                country === 'United Kingdom' ? '英国' : country,
                count,
                percentage: ((count / (reportData.country_dimension.summary_stats?.total_completely_inaccessible || count)) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count);
    };

    // 处理平台类型分布数据
    const getTypeDistributionData = () => {
        if (!reportData?.country_dimension?.inaccessible_by_type) return [];

        return Object.entries(reportData.country_dimension.inaccessible_by_type)
            .map(([type, count], index) => ({
                type,
                count,
                fill: [COLORS.danger, COLORS.critical, COLORS.warning, COLORS.primary, COLORS.info, COLORS.gray][index % 6]
            }));
    };

    // 获取每日统计数据
    const getDailyStatsData = () => {
        if (!reportData?.time_dimension?.global_daily_stats) return [];

        return reportData.time_dimension.global_daily_stats.map(stat => ({
            ...stat,
            date: new Date(stat.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
        }));
    };

    // 统计卡片组件
    const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${
                        color === 'danger' ? 'bg-red-50 border border-red-100' :
                            color === 'success' ? 'bg-green-50 border border-green-100' :
                                color === 'warning' ? 'bg-yellow-50 border border-yellow-100' :
                                    color === 'info' ? 'bg-blue-50 border border-blue-100' :
                                        'bg-gray-50 border border-gray-100'
                    } mr-4`}>
                        <Icon className={`w-6 h-6 ${
                            color === 'danger' ? 'text-red-600' :
                                color === 'success' ? 'text-green-600' :
                                    color === 'warning' ? 'text-yellow-600' :
                                        color === 'info' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className={`text-2xl font-bold ${
                            color === 'danger' ? 'text-red-600' :
                                color === 'success' ? 'text-green-600' :
                                    color === 'warning' ? 'text-yellow-600' :
                                        color === 'info' ? 'text-blue-600' : 'text-gray-900'
                        }`}>{value}</p>
                        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                </div>
                {trend && (
                    <div className={`flex items-center text-sm ${
                        trend > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                        {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </div>
    );

    // 自定义Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // 文件上传组件
    const FileUploader = () => (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">加载分析报告</h3>
            <p className="text-gray-600 mb-6">请上传由Python分析脚本生成的JSON报告文件</p>

            <div className="space-y-4">
                <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <FileText className="w-5 h-5 mr-2" />
                    选择JSON文件
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>

                <p className="text-sm text-gray-500">
                    支持格式: JSON (.json)
                </p>
            </div>
        </div>
    );

    // 渲染概览页面
    const renderOverview = () => {
        const dailyStats = getDailyStatsData();
        const summaryStats = reportData?.country_dimension?.summary_stats || {};
        const metadata = reportData?.metadata || {};

        return (
            <div className="space-y-6">
                {/* 关键指标概览 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="总平台数"
                        value={metadata.total_platforms?.toLocaleString() || '0'}
                        subtitle="监控平台总数"
                        icon={Server}
                        color="info"
                    />
                    <StatCard
                        title="完全不可访问"
                        value={summaryStats.total_completely_inaccessible?.toString() || '0'}
                        subtitle="连续7天以上0%可访问率"
                        icon={AlertCircle}
                        color="danger"
                    />
                    <StatCard
                        title="平均失效时长"
                        value={`${Math.round(summaryStats.avg_failure_duration_days || 0)}天`}
                        subtitle="平台完全不可访问的平均持续时间"
                        icon={Clock}
                        color="warning"
                    />
                    <StatCard
                        title="从未可访问"
                        value={summaryStats.platforms_never_accessible?.toString() || '0'}
                        subtitle="自监控开始就无法访问的平台"
                        icon={AlertTriangle}
                        color="danger"
                    />
                </div>

                {/* 可访问率趋势 */}
                {dailyStats.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">全球平台可访问率趋势</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="accessibility_rate"
                                    stroke={COLORS.primary}
                                    strokeWidth={2}
                                    name="总体可访问率(%)"
                                    dot={{ fill: COLORS.primary }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="domestic_rate"
                                    stroke={COLORS.success}
                                    strokeWidth={2}
                                    name="国内可访问率(%)"
                                    dot={{ fill: COLORS.success }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="foreign_rate"
                                    stroke={COLORS.warning}
                                    strokeWidth={2}
                                    name="国外可访问率(%)"
                                    dot={{ fill: COLORS.warning }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* 失效时间线分析 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">平台失效时间线</h3>
                    <p className="text-sm text-gray-600 mb-4">显示各月份开始失效的平台数量</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={getFailureTimelineData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke={COLORS.danger}
                                fill={`${COLORS.danger}20`}
                                strokeWidth={2}
                                name="当月新增失效平台"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // 渲染国家分析页面
    const renderCountryAnalysis = () => {
        const countryData = getCountryDistributionData();
        const typeData = getTypeDistributionData();
        const inaccessiblePlatforms = reportData?.country_dimension?.completely_inaccessible_platforms || [];

        return (
            <div className="space-y-6">
                {/* 国家和类型分布 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">不可访问平台国家分布</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={countryData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="country" type="category" tick={{ fontSize: 12 }} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">平台类型分布</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="count"
                                    label={({ type, count }) => `${type}: ${count}`}
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 详细平台列表 */}
                {inaccessiblePlatforms.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">完全不可访问平台详情</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平台名称</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">国家</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失效开始</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失效天数</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后可访问</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {inaccessiblePlatforms.slice(0, 20).map((platform, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{platform.repositoryName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{platform.country || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{platform.type || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{platform.failure_start_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{platform.consecutive_failure_days}天</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{platform.last_accessible_date}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 渲染可访问性分析页面
    const renderAccessibilityAnalysis = () => {
        const accessibilityData = getAccessibilityGroupData();
        const inaccessibleDetails = reportData?.accessibility_rate_dimension?.completely_inaccessible_details || {};

        return (
            <div className="space-y-6">
                {/* 可访问率分组分布 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">可访问率等级分布</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={accessibilityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="range"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                                <p className="font-medium text-gray-900 mb-2">{label}</p>
                                                <p className="text-sm text-gray-600">平台数量: {data.count}</p>
                                                <p className="text-sm text-gray-600">占比: {data.percentage}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {accessibilityData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 国内外对比 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">完全不可访问平台 - 国内外分布</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">国内平台</h4>
                                    <p className="text-sm text-gray-600">完全不可访问的国内平台</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-red-600">{inaccessibleDetails.domestic || 0}</span>
                                    <span className="text-sm text-gray-500 ml-1">个</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">国外平台</h4>
                                    <p className="text-sm text-gray-600">完全不可访问的国外平台</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-orange-600">{inaccessibleDetails.foreign || 0}</span>
                                    <span className="text-sm text-gray-500 ml-1">个</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">关键统计指标</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">总计完全不可访问</span>
                                <span className="font-medium text-red-600">{inaccessibleDetails.total || 0}个</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">平均监控天数</span>
                                <span className="font-medium">{Math.round(inaccessibleDetails.avg_monitoring_days || 0)}天</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">最长失效时长</span>
                                <span className="font-medium text-red-600">{reportData?.country_dimension?.summary_stats?.longest_failure_duration || 0}天</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600">涉及国家数</span>
                                <span className="font-medium">{reportData?.country_dimension?.summary_stats?.countries_with_inaccessible_platforms || 0}个</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 如果数据未加载，显示上传界面
    if (!reportData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">平台监控数据分析仪表板</h1>
                        <p className="text-gray-600">基于Python分析脚本生成的JSON报告数据</p>
                    </div>

                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600">正在加载数据...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    <FileUploader />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">平台监控数据分析仪表板</h1>
                    <p className="text-gray-600">基于实际JSON数据的完整分析报告</p>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            分析周期: {reportData.metadata?.analysis_period?.start_date} 至 {reportData.metadata?.analysis_period?.end_date}
                        </div>
                        <button
                            onClick={() => setReportData(null)}
                            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            重新加载数据
                        </button>
                    </div>
                </div>

                {/* 导航标签 */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { key: 'overview', label: '总览', icon: Activity },
                                { key: 'country', label: '国家分析', icon: Globe },
                                { key: 'accessibility', label: '可访问性分析', icon: Target }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* 内容区域 */}
                <div>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'country' && renderCountryAnalysis()}
                    {activeTab === 'accessibility' && renderAccessibilityAnalysis()}
                </div>
            </div>
        </div>
    );
};

export default JsonDataDashboard;