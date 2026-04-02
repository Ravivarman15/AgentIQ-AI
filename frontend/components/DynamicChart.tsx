"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis } from "recharts";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface ChartProps {
    chart: {
        type: string;
        title: string;
        data: any;
        color?: string;
        description?: string;
    };
}

export default function DynamicChart({ chart }: ChartProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Corporate Color Palette (Bloomberg/Tableau style) - Deep Blues, Emeralds, Violets
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6'];

    const chartData = useMemo(() => {
        if (!chart.data) return [];

        // 1. Handle Array Data (Simple Charts)
        if (Array.isArray(chart.data)) {
            return chart.data.slice(0, 50); // Increased limit for scatter/line
        }

        // 2. Handle BoxPlot Data (Nested Dictionary: {cls: {min, max, mean...}})
        if (chart.type === 'boxplot' || chart.title.includes('Box Plot')) {
            return Object.entries(chart.data).map(([k, v]: any) => ({
                name: k,
                ...v, // detailed stats
                value: v.mean || v.median || 0 // fallback for bar chart
            }));
        }

        // 3. Handle PCA Projection (Arrays: {pc1:[], pc2:[], labels:[]})
        if (chart.data.pc1 && chart.data.pc2) {
            const points = chart.data.pc1.map((x: number, i: number) => ({
                x: x,
                y: chart.data.pc2[i],
                name: chart.data.labels ? chart.data.labels[i] : `Point ${i}`,
                cluster: chart.data.clusters ? chart.data.clusters[i] : 0
            }));
            return points.slice(0, 300); // Limit points for performance
        }

        // 4. Handle PairPlot / Correlation Matrix / Stats Table
        // Return raw data structure for custom renderers
        if (['pairplot', 'correlation_matrix', 'heatmap', 'stats_table'].includes(chart.type?.toLowerCase())) {
            return chart.data;
        }

        // 5. Handle Generic Scatter (x arrays and y arrays)
        if (chart.data.x && chart.data.y && Array.isArray(chart.data.x)) {
            return chart.data.x.map((x: any, i: number) => ({
                x: typeof x === 'number' ? x : i,
                y: chart.data.y[i],
                name: `Point ${i}`,
                xLabel: chart.data.x_label,
                yLabel: chart.data.y_label,
                cluster: chart.data.cluster ? chart.data.cluster[i] : (chart.data.clusters ? chart.data.clusters[i] : undefined)
            })).slice(0, 400);
        }

        // Default: Dictionary to Array [{name: k, value: v}]
        return Object.entries(chart.data).map(([k, v]: any) => {
            if (typeof v === 'object' && v !== null) {
                return { name: k, ...v };
            }
            const numVal = typeof v === 'number' ? Math.round(v * 10000) / 10000 : v;
            return { name: k, value: numVal };
        }).slice(0, 30);
    }, [chart.data, chart.type, chart.title]);

    // Check if empty
    const isEmpty = !chartData || (Array.isArray(chartData) && chartData.length === 0) || (typeof chartData === 'object' && Object.keys(chartData).length === 0);

    if (isEmpty) {
        return (
            <div className="glass-card-static p-6 h-full flex flex-col items-center justify-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                <p className="text-sm text-[var(--text-muted)] italic">No data available</p>
            </div>
        );
    }

    const renderChart = (expanded = false) => {
        const axisStyle = { stroke: 'var(--text-muted)', fontSize: 10, tickLine: false, axisLine: false };
        const gridStyle = { strokeDasharray: "3 3", stroke: 'var(--card-border)', vertical: false };
        const tooltipContentStyle = {
            background: 'var(--glass-panel)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            color: 'var(--foreground)',
            fontSize: '12px',
            padding: '8px 12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        };
        const tooltipItemStyle = { color: 'var(--foreground)' };

        const type = chart.type?.toLowerCase() || 'bar';

        // Helper for Magma-like color scale (Black -> Purple -> Red -> Orange -> White)
        const getMagmaColor = (value: number) => {
            const val = Math.abs(value); // Assuming correlation magnitude
            if (val < 0.2) return '#000004'; // Black
            if (val < 0.4) return '#3b0f70'; // Dark Purple
            if (val < 0.6) return '#8c2981'; // Purple
            if (val < 0.8) return '#de4968'; // Red/Pink
            return '#fe9f6d'; // Orange/Peach
        };

        // --- Custom Renderers for Complex Types ---

        // 1. Stats Table
        if (type === 'stats_table') {
            const rows = Object.entries(chartData);
            return (
                <div className="h-full overflow-auto scrollbar-thin">
                    <table className="w-full text-left text-xs text-[var(--text-muted)]">
                        <thead className="text-[var(--text-muted)] font-medium border-b border-[var(--card-border)] bg-[var(--foreground)]/5 sticky top-0">
                            <tr>
                                <th className="p-2">Feature</th>
                                {Object.keys(rows[0][1] as any).map(k => <th key={k} className="p-2 capitalize">{k.replace(/_/g, ' ')}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(([key, stats]: any, i) => (
                                <tr key={key} className={`border-b border-[var(--card-border)] hover:bg-[var(--foreground)]/5 transition-colors ${i % 2 === 0 ? 'bg-[var(--foreground)]/2' : ''}`}>
                                    <td className="p-2 font-medium text-[var(--foreground)]">{key}</td>
                                    {Object.values(stats).map((val: any, j) => (
                                        <td key={j} className="p-2">{typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // 2. Correlation Matrix (Heatmap style)
        if (type === 'correlation_matrix' || type === 'heatmap') {
            const features = Object.keys(chartData);
            if (features.length === 0) return null;

            return (
                <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto scrollbar-thin flex flex-col items-center justify-center relative">
                        <div className="grid gap-px bg-[var(--card-border)] border border-[var(--card-border)]" style={{ gridTemplateColumns: `auto repeat(${features.length}, minmax(40px, 1fr))` }}>
                            {/* Header Row */}
                            <div className="bg-[var(--card-bg)] p-2"></div>
                            {features.map(f => (
                                <div key={f} className="p-1 sm:p-2 text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate -rotate-45 origin-bottom-left h-16 flex items-end justify-center z-10">{f.substring(0, 8)}</div>
                            ))}

                            {/* Data Rows */}
                            {features.map((rowF) => (
                                <div key={`row-container-${rowF}`} className="contents">
                                    <div key={`row-${rowF}`} className="p-1 sm:p-2 text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate font-medium flex items-center justify-end pr-3">{rowF.substring(0, 10)}</div>
                                    {features.map((colF) => {
                                        const val = (chartData as any)[rowF]?.[colF];
                                        const isNum = typeof val === 'number';
                                        const color = isNum ? getMagmaColor(val) : 'transparent';
                                        const textColor = isNum && Math.abs(val) > 0.6 ? 'white' : '#cbd5e1';

                                        return (
                                            <div
                                                key={`${rowF}-${colF}`}
                                                className="w-full h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-medium transition-transform hover:scale-110 hover:z-20 relative hover:shadow-lg cursor-default group"
                                                style={{ backgroundColor: color, color: textColor }}
                                                title={`${rowF} vs ${colF}: ${isNum ? val.toFixed(3) : '-'}`}
                                            >
                                                {isNum ? val.toFixed(2) : '-'}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Legend Color Scale */}
                    <div className="flex items-center justify-center gap-2 mt-4 px-4 pb-2">
                        <span className="text-[10px] text-[var(--text-muted)]">0.0</span>
                        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-[#000004] via-[#8c2981] to-[#fe9f6d]"></div>
                        <span className="text-[10px] text-[var(--text-muted)]">1.0</span>
                        <span className="text-[10px] text-[var(--text-muted)] ml-2 opacity-70">(Abs Correlation)</span>
                    </div>
                </div>
            );
        }

        // 3. PairPlot (Grid of Scatters)
        if (type === 'pairplot') {
            const pairs = Object.entries(chartData).slice(0, 9); // Limit to 3x3 grid
            if (pairs.length === 0) return null;

            return (
                <div className="h-full overflow-y-auto scrollbar-thin p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {pairs.map(([key, data]: any, i) => (
                            <div key={key} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-2 h-[150px] flex flex-col relative overflow-hidden group">
                                <p className="text-[10px] text-[var(--text-muted)] text-center mb-1 font-mono truncate z-10">{data.x_label} vs {data.y_label}</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 2, right: 2, left: 0, bottom: 2 }}>
                                        <XAxis type="number" dataKey="x" hide />
                                        <YAxis type="number" dataKey="y" hide />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[var(--glass-panel)] border border-[var(--card-border)] p-2 rounded text-[10px] text-[var(--foreground)] shadow-xl z-50">
                                                            <span className='font-bold text-blue-400'>{data.x_label}:</span> {payload[0].value}<br />
                                                            <span className='font-bold text-blue-400'>{data.y_label}:</span> {payload[1].value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Scatter
                                            data={data.x.map((x: any, idx: number) => ({ x, y: data.y[idx] }))}
                                            fill={i % 2 === 0 ? "#3b82f6" : "#f59e0b"}
                                            r={1.5}
                                            opacity={0.7}
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // --- Standard Recharts ---

        if (['bar', 'horizontal_bar', 'feature_importance'].includes(type) || type === 'histogram') {
            const isHorizontal = type !== 'bar' && type !== 'histogram'; // Default bar is vertical, others horizontal
            return (
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: isHorizontal ? 30 : 0, bottom: 5 }}
                    layout={isHorizontal ? "vertical" : "horizontal"}
                >
                    <CartesianGrid {...gridStyle} horizontal={!isHorizontal} vertical={isHorizontal} />

                    {isHorizontal ? (
                        <>
                            <XAxis type="number" {...axisStyle} />
                            <YAxis dataKey="name" type="category" {...axisStyle} width={80} tickFormatter={(val) => typeof val === 'string' && val.length > 10 ? val.substring(0, 8) + '..' : val} />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey="name" {...axisStyle} tickFormatter={(val) => typeof val === 'string' && val.length > 10 ? val.substring(0, 8) + '..' : val} />
                            <YAxis {...axisStyle} width={40} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                        </>
                    )}

                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'var(--text-muted)', opacity: 0.05 }} />
                    <Bar dataKey="value" fill={chart.color || "#3b82f6"} radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={50}>
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.9} />
                        ))}
                    </Bar>
                </BarChart>
            );
        }

        // BoxPlot (rendered as Bar Chart of means with detailed tooltip)
        if (type === 'boxplot') {
            return (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="name" {...axisStyle} tickFormatter={(val) => typeof val === 'string' && val.length > 10 ? val.substring(0, 8) + '..' : val} />
                    <YAxis {...axisStyle} width={40} />
                    <Tooltip
                        contentStyle={tooltipContentStyle}
                        itemStyle={tooltipItemStyle}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div style={tooltipContentStyle}>
                                        <p className="font-bold mb-1">{label}</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <span>Min: {data.min}</span>
                                            <span>Max: {data.max}</span>
                                            <span>Mean: {data.mean}</span>
                                            <span>Median: {data.median}</span>
                                            <span>Q1: {data.q1}</span>
                                            <span>Q3: {data.q3}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="mean" fill={chart.color || "#8b5cf6"} radius={[4, 4, 0, 0]} name="Mean Value">
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            );
        }

        // PCA / Scatter
        if (['scatter', 'bubble', 'pca'].includes(type) || (Array.isArray(chartData) && chartData[0] && chartData[0].x !== undefined)) {
            return (
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid {...gridStyle} />
                    <XAxis type="number" dataKey="x" name={chartData[0]?.xLabel || "X"} {...axisStyle} height={40} tickFormatter={(v) => v.toFixed ? v.toFixed(1) : v} />
                    <YAxis type="number" dataKey="y" name={chartData[0]?.yLabel || "Y"} {...axisStyle} width={40} tickFormatter={(v) => v.toFixed ? v.toFixed(1) : v} />
                    <ZAxis range={[50, 400]} />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3', stroke: 'var(--text-muted)' }}
                        contentStyle={tooltipContentStyle}
                        itemStyle={tooltipItemStyle}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div style={tooltipContentStyle}>
                                        <p className="font-bold mb-1 text-[var(--foreground)]">{data.name}</p>
                                        <div className="grid grid-cols-2 gap-x-3 text-[10px]">
                                            <span className="text-[var(--text-muted)]">X ({data.xLabel || 'Val'}):</span>
                                            <span className="text-[var(--foreground)] font-mono">{typeof data.x === 'number' ? data.x.toFixed(2) : data.x}</span>

                                            <span className="text-[var(--text-muted)]">Y ({data.yLabel || 'Val'}):</span>
                                            <span className="text-[var(--foreground)] font-mono">{typeof data.y === 'number' ? data.y.toFixed(2) : data.y}</span>

                                            {data.cluster !== undefined && (
                                                <>
                                                    <span className="text-[var(--text-muted)]">Cluster:</span>
                                                    <span className="font-bold" style={{ color: colors[Number(data.cluster) % colors.length] }}>{data.cluster}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter name={chart.title} data={chartData} fill={chart.color || "#3b82f6"}>
                        {chartData.map((entry: any, index: number) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.cluster !== undefined ? colors[Number(entry.cluster) % colors.length] : (chart.color || "#3b82f6")}
                                stroke={entry.cluster !== undefined ? colors[Number(entry.cluster) % colors.length] : undefined}
                                fillOpacity={0.7}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            );
        }

        if (type === 'line' || type === 'trend') {
            return (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="name" {...axisStyle} height={40} />
                    <YAxis {...axisStyle} width={40} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} />
                    <Line type="monotone" dataKey="value" stroke={chart.color || "#f59e0b"} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            );
        }

        if (type === 'pie') {
            const total = (chartData as any[]).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
            return (
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={expanded ? 80 : 50}
                        outerRadius={expanded ? 140 : 80}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                    >
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(30, 41, 59, 1)" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} />
                    <Legend
                        layout={expanded ? "horizontal" : "vertical"}
                        verticalAlign={expanded ? "bottom" : "middle"}
                        align={expanded ? "center" : "right"}
                        wrapperStyle={{ fontSize: '10px', opacity: 0.8, color: 'var(--text-muted)' }}
                    />
                </PieChart>
            );
        }

        if (type === 'area') {
            return (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`color-${chart.title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.color || "#8b5cf6"} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chart.color || "#8b5cf6"} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="name" {...axisStyle} height={40} />
                    <YAxis {...axisStyle} width={40} />
                    <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} />
                    <Area type="monotone" dataKey="value" stroke={chart.color || "#8b5cf6"} fillOpacity={1} fill={`url(#color-${chart.title.replace(/\s+/g, '')})`} strokeWidth={2} />
                </AreaChart>
            );
        }

        // Generic Fallback
        return (
            <div className="h-full overflow-y-auto scrollbar-thin pr-2">
                <div className="grid grid-cols-2 gap-3">
                    {(chartData as any[]).map((d, i) => (
                        <div key={i} className="bg-[var(--foreground)]/5 p-3 rounded-lg border border-[var(--card-border)]">
                            <p className="text-[10px] text-[var(--text-muted)] truncate mb-1">{d.name}</p>
                            <p className="text-sm font-bold text-[var(--foreground)] truncate">{typeof d.value === 'number' ? d.value.toLocaleString() : d.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card-static h-full flex flex-col cursor-pointer border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/80 hover:border-blue-500/30 transition-all rounded-2xl overflow-hidden shadow-lg shadow-black/10"
                onClick={() => setIsExpanded(true)}
            >
                <div className="p-4 pb-2 flex items-center justify-between shrink-0 border-b border-[var(--card-border)] bg-[var(--foreground)]/5">
                    <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wide truncate pr-2">{chart.title}</h3>
                    <div className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0 relative p-4">
                    {/* If it's the fallback metrics, HTML table, correlation, pairplot - don't wrap in ResponsiveContainer */}
                    {['stats_table', 'correlation_matrix', 'heatmap', 'pairplot'].includes(chart.type?.toLowerCase() || 'bar') ? (
                        renderChart(false)
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart(false)}
                        </ResponsiveContainer>
                    )}
                </div>
            </motion.div>

            {isExpanded && (
                <div className="fixed inset-0 z-[100] bg-[var(--background)]/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="fixed inset-0" onClick={() => setIsExpanded(false)} />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="w-full max-w-4xl bg-[var(--glass-panel)] border border-[var(--card-border)] relative z-10 flex flex-col shadow-2xl overflow-hidden rounded-2xl"
                    >
                        <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--glass-panel)]">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--foreground)]">{chart.title}</h2>
                                {chart.description && <p className="text-xs text-[var(--text-muted)] mt-1">{chart.description}</p>}
                            </div>
                            <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-5 h-[450px] bg-[var(--card-bg)]">
                            {/* Always use renderChart(true). If it's standard Recharts, it will be wrapped by logic inside renderChart if needed, BUT DynamicChart logic for Standard Types returns raw Chart component. We need a simpler approach here. */}

                            {/* Re-check logic: Standard types RETURN Recharts component directly. Complex types RETURN div wrappers. */}
                            {/* So we try to wrap everything in ResponsiveContainer via a helper, OR just let them be. */}
                            {/* Wait, the existing code:
                                if standard: returns <BarChart ...>
                                We need to wrap that in ResponsiveContainer inside the modal.
                                But if complex (stats_table), we DON'T wrap.
                             */}

                            {['stats_table', 'correlation_matrix', 'heatmap', 'pairplot'].includes(chart.type?.toLowerCase() || 'bar') ? (
                                renderChart(true)
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    {renderChart(true)}
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
