'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Calendar, Globe, List, Target, TrendingDown, Upload, XCircle } from 'lucide-react';
import { getCountryZh } from "@/config/country-code";

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('foreign');
    const [activeView, setActiveView] = useState('details');
    const [activeChartTab, setActiveChartTab] = useState('always_inaccessible');
    const [activeDetailTab, setActiveDetailTab] = useState('always_inaccessible'); // 新增状态

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setData(jsonData);
                } catch (error) {
                    alert('JSON文件格式错误');
                }
            };
            reader.readAsText(file);
        }
    };

    const processedData = useMemo(() => {
        if (!data) return null;

        const processPatterns = (platforms) => {
            const patterns = {
                always_inaccessible: platforms.filter(p => p.pattern === 'always_inaccessible'),
                became_inaccessible: platforms.filter(p => p.pattern === 'became_inaccessible'),
                declining: platforms.filter(p => p.trend === 'declining')
            };

            const getDistribution = (platformList, field) => {
                const counts = {};
                platformList.forEach(platform => {
                    let values = platform[field];
                    if (Array.isArray(values)) {
                        values.forEach(value => {
                            if (value && value !== 'Unknown') {
                                counts[value] = (counts[value] || 0) + 1;
                            }
                        });
                    } else if (values && values !== 'Unknown') {
                        counts[values] = (counts[values] || 0) + 1;
                    }
                });
                return Object.entries(counts)
                    .map(([name, value]) => (
                        { name: field === 'country' ? getCountryZh(name) : name, value }
                    ))
                    .sort((a, b) => b.value - a.value)
                    // .slice(0, 10);
            };

            return {
                patterns,
                distributions: {
                    always_inaccessible: {
                        type: getDistribution(patterns.always_inaccessible, 'type'),
                        subject: getDistribution(patterns.always_inaccessible, 'subject'),
                        contentType: getDistribution(patterns.always_inaccessible, 'contentType'),
                        country: getDistribution(patterns.always_inaccessible, 'country')
                    },
                    became_inaccessible: {
                        type: getDistribution(patterns.became_inaccessible, 'type'),
                        subject: getDistribution(patterns.became_inaccessible, 'subject'),
                        contentType: getDistribution(patterns.became_inaccessible, 'contentType'),
                        country: getDistribution(patterns.became_inaccessible, 'country')
                    },
                    declining: {
                        type: getDistribution(patterns.declining, 'type'),
                        subject: getDistribution(patterns.declining, 'subject'),
                        contentType: getDistribution(patterns.declining, 'contentType'),
                        country: getDistribution(patterns.declining, 'country')
                    }
                }
            };
        };

        return {
            foreign: processPatterns(data.foreign_platforms?.platforms || []),
            domestic: processPatterns(data.domestic_platforms?.platforms || []),
            summary: data.summary || {}
        };
    }, [data]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#98fb98', '#f0e68c'];

    const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <Icon className="h-8 w-8" style={{ color }} />
            </div>
        </div>
    );

// 替换现有的 PlatformTable 组件
    const  PlatformTable = ({ platforms, title, patternType }) => {
        const [filteredPlatforms, setFilteredPlatforms] = useState(platforms);
        const [countryFilter, setCountryFilter] = useState('');
        const [sortBy, setSortBy] = useState(''); // 'asc' or 'desc'

        // 获取所有唯一的国家列表用于筛选
        const countries = useMemo(() => {
            const countrySet = new Set();
            platforms.forEach(platform => {
                if (platform.country) {
                    countrySet.add(platform.country);
                }
            });
            return Array.from(countrySet).sort();
        }, [platforms]);

        // 应用筛选和排序
        useEffect(() => {
            let result = [...platforms];

            // 应用国家筛选
            if (countryFilter) {
                result = result.filter(platform => platform.country === countryFilter);
            }

            // 应用可访问率排序
            if (sortBy) {
                result.sort((a, b) => {
                    if (sortBy === 'asc') {
                        return a.overall_accessibility_rate - b.overall_accessibility_rate;
                    } else {
                        return b.overall_accessibility_rate - a.overall_accessibility_rate;
                    }
                });
            }

            setFilteredPlatforms(result);
        }, [platforms, countryFilter, sortBy]);

        // 重置筛选和排序
        const resetFilters = () => {
            setCountryFilter('');
            setSortBy('');
        };

        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        {patternType === 'always_inaccessible' && <XCircle className="mr-2 h-5 w-5 text-red-500" />}
                        {patternType === 'became_inaccessible' && <Calendar className="mr-2 h-5 w-5 text-orange-500" />}
                        {patternType === 'declining' && <TrendingDown className="mr-2 h-5 w-5 text-yellow-500" />}
                        {title}
                    </h3>

                    {/* 筛选和排序控件 */}
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                            <option value="">所有国家</option>
                            {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                            <option value="">默认排序</option>
                            <option value="asc">可访问率升序</option>
                            <option value="desc">可访问率降序</option>
                        </select>

                        <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            重置
                        </button>
                    </div>
                </div>

                {filteredPlatforms.length === 0 ? (
                    <p className="text-gray-500">暂无数据</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    平台名称
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    国家
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    类型
                                </th>

                                {patternType !== "always_inaccessible" &&
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    总体平均可访问率
                                </th>
                                }
                                {patternType === 'became_inaccessible' && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        最后可访问时间
                                    </th>
                                )}
                                {patternType === 'always_inaccessible' && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        监控天数
                                    </th>
                                )}
                                {patternType === 'declining' && (
                                    <>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            上月可访问率
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            当月可访问率
                                        </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        可访问率趋势
                                    </th>
                                    </>
                                )}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPlatforms.map((platform, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs">
                                        <div className="truncate" title={platform.repositoryName}>
                                            {platform.repositoryName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {platform.country}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {platform.type}
                                    </td>
                                    {
                                        patternType !== "always_inaccessible" &&

                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            platform.overall_accessibility_rate === 0 ? 'bg-red-100 text-red-800' :
                                                platform.overall_accessibility_rate < 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                        }`}>
                                            {(platform.overall_accessibility_rate * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                    }
                                    {patternType === 'became_inaccessible' && (
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {platform.last_accessible_date}
                                        </td>
                                    )}
                                    {patternType === 'always_inaccessible' && (
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {platform.monitoring_days} 天
                                        </td>
                                    )}
                                    {patternType === 'declining' && (
                                        <>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                             <span className={`px-2 py-1 rounded-full text-xs ${
                                                 platform.prev_rate === 0 ? 'bg-red-100 text-red-800' :
                                                     platform.prev_rate < 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                                         'bg-green-100 text-green-800'
                                             }`}>
                                            {((platform.prev_rate || 0) * 100).toFixed(2)}%
                                        </span>
                                        </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                 <span className={`px-2 py-1 rounded-full text-xs ${
                                                     platform.current_rate === 0 ? 'bg-red-100 text-red-800' :
                                                         platform.current_rate < 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                                             'bg-green-100 text-green-800'
                                                 }`}>
                                            {((platform.current_rate || 0) * 100).toFixed(2)}%
                                                 </span>
                                            </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {platform.trend_slope?.toFixed(2)}
                                        </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const ChartSection = ({ title, data, type = 'bar' }) => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {data.length === 0 ? (
                <p className="text-gray-500">暂无数据</p>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    {type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-50} textAnchor="end" height={100} fontSize={12} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#2b7fff" />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#2b7fff"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            )}
        </div>
    );

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div >
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-4">上传JSON数据文件</h2>
                        <p className="text-gray-600 mb-6">请选择平台监控分析生成的JSON文件</p>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>
            </div>
        );
    }

    const currentData = processedData[activeTab];
    const summary = processedData.summary;

    return (
        <div className="w-full min-h-screen bg-gray-100">
            {/* 头部 */}
            <div className="bg-white shadow-sm">
                <div className=" px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">平台可访问性监控仪表板</h1>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-8">
                {/* 主要内容区域 - 使用侧边栏布局 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 侧边栏 - 平台类型选择 */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-8">
                            <h3 className="text-lg font-semibold mb-3">平台类型</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('foreign')}
                                    className={`w-full cursor-pointer flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === 'foreign'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    国外平台
                                </button>
                                <button
                                    onClick={() => setActiveTab('domestic')}
                                    className={`w-full cursor-pointer  flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === 'domestic'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    国内平台
                                </button>
                            </div>
                        </div>

                        {/* 概览统计卡片也可以放在侧边栏 */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-lg font-semibold mb-3">统计概览</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">平台始终不可访问</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {currentData.patterns.always_inaccessible.length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">平台从某时间点开始不可访问</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {currentData.patterns.became_inaccessible.length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <TrendingDown className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">平台访问率呈下降趋势</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {currentData.patterns.declining.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>

                    {/* 主内容区域 */}
                    <div className="flex-1">
                        {/* 视图切换 */}
                        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
                            <button
                                onClick={() => setActiveView('details')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    activeView === 'details'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <List className="inline mr-2 h-4 w-4" />
                                平台详情
                            </button>
                            <button
                                onClick={() => setActiveView('charts')}
                                className={`flex-1 cursor-point  py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    activeView === 'charts'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Target className="inline mr-2 h-4 w-4" />
                                统计图表
                            </button>
                        </div>

                        {/* 平台详情 */}
                        {activeView === 'details' && (
                            <div>
                                {/* 详情Tab导航 */}
                                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6 " >
                                    <button
                                        onClick={() => setActiveDetailTab('always_inaccessible')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                            activeDetailTab === 'always_inaccessible'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <XCircle className={`mr-2 h-4 w-4 ${activeDetailTab === 'always_inaccessible' ? 'text-red-500' : ''}`} />
                                        一直不可访问
                                    </button>
                                    <button
                                        onClick={() => setActiveDetailTab('became_inaccessible')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                            activeDetailTab === 'became_inaccessible'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <Calendar className={`mr-2 h-4 w-4 ${activeDetailTab === 'became_inaccessible' ? 'text-orange-500' : ''}`} />
                                        从某时间点开始不可访问
                                    </button>
                                    <button
                                        onClick={() => setActiveDetailTab('declining')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                            activeDetailTab === 'declining'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <TrendingDown className={`mr-2 h-4 w-4 ${activeDetailTab === 'declining' ? 'text-yellow-500' : ''}`} />
                                        访问率呈下降趋势
                                    </button>
                                </div>

                                {activeDetailTab === 'always_inaccessible' ? (
                                    <PlatformTable
                                        platforms={currentData.patterns.always_inaccessible}
                                        title="一直不可访问的平台"
                                        patternType="always_inaccessible"
                                    />
                                ) : activeDetailTab === 'became_inaccessible' ? (
                                    <PlatformTable
                                        platforms={currentData.patterns.became_inaccessible}
                                        title="从某时间点开始不可访问的平台"
                                        patternType="became_inaccessible"
                                    />
                                ) :  <PlatformTable
                                    platforms={currentData.patterns.declining}
                                    title="可访问率呈下降趋势的平台"
                                    patternType="declining"
                                />}
                            </div>
                        )}

                        {/* 统计图表 */}
                        {activeView === 'charts' && (
                            <div>
                                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6 " >
                                    <button
                                        onClick={() => setActiveChartTab('always_inaccessible')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                            activeChartTab === 'always_inaccessible'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <XCircle className={`mr-2 h-4 w-4 ${activeChartTab === 'always_inaccessible' ? 'text-red-500' : ''}`} />
                                        一直不可访问
                                    </button>
                                    <button
                                        onClick={() => setActiveChartTab('became_inaccessible')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                            activeChartTab === 'became_inaccessible'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <Calendar className={`mr-2 h-4 w-4 ${activeChartTab === 'became_inaccessible' ? 'text-orange-500' : ''}`} />
                                        从某时间点开始不可访问
                                    </button>
                                    <button
                                        onClick={() => setActiveChartTab('declining')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                                            activeChartTab === 'declining'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <TrendingDown className={`mr-2 h-4 w-4 ${activeChartTab === 'declining' ? 'text-yellow-500' : ''}`} />
                                        访问率呈下降趋势
                                    </button>
                                </div>

                                {
                                    activeChartTab === "always_inaccessible" && <>
                                <ChartSection
                                    title="按国家/地区分布(一直不可访问平台统计)"
                                    data={currentData.distributions.always_inaccessible.country}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2  gap-6 ">
                                    <ChartSection
                                        title="按平台类型分布(一直不可访问平台统计)"
                                        data={currentData.distributions.always_inaccessible.type}
                                        type="pie"
                                    />
                                    <ChartSection
                                        title="按资源内容类型分布(一直不可访问平台统计)"
                                        data={currentData.distributions.always_inaccessible.contentType}
                                    />
                                </div>
                                <ChartSection
                                    title="按学科分布(一直不可访问平台统计)"
                                    data={currentData.distributions.always_inaccessible.subject}
                                />
                                    </>
                }
                                {      activeChartTab === "became_inaccessible" && <>

                            <ChartSection
                                    title="按国家/地区分布(从某时间点开始不可访问)"
                                    data={currentData.distributions.became_inaccessible.country}
                                />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ChartSection
                                        title="按平台类型分布(从某时间点开始不可访问)"
                                        data={currentData.distributions.became_inaccessible.type}
                                        type="pie"
                                    />
                                    <ChartSection
                                        title="按资源类型分布(从某时间点开始不可访问)"
                                        data={currentData.distributions.became_inaccessible.contentType}
                                    />
                                </div>
                                <ChartSection
                                    title="按学科分布(从某时间点开始不可访问)"
                                    data={currentData.distributions.became_inaccessible.subject}
                                />
                            </>
                            }
                                {      activeChartTab === "declining" && <>

                                <ChartSection
                                    title="按国家/地区分布(访问量呈下降趋势)"
                                    data={currentData.distributions.declining.country}
                                />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                                    <ChartSection
                                        title="按平台类型分布(访问量呈下降趋势)"
                                        data={currentData.distributions.declining.type}
                                        type="pie"
                                    />
                                    <ChartSection
                                        title="按资源内容类型分布(访问量呈下降趋势)"
                                        data={currentData.distributions.declining.contentType}
                                    />
                                </div>
                                <ChartSection
                                    title="按学科分布(访问量呈下降趋势)"
                                    data={currentData.distributions.declining.subject}
                                />
                                </>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;