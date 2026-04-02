"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, CheckCircle2, XCircle, Zap, AlertTriangle, Info, Sparkles, ChevronDown, ChevronUp, Settings2, SlidersHorizontal, ToggleLeft, ToggleRight } from "lucide-react";

interface PredictionTabProps {
    predictionInput: any;
    setPredictionInput: (input: any) => void;
    predictionResult: any;
    useAutoTarget: boolean;
    setUseAutoTarget: (val: boolean) => void;
    selectedTarget: string;
    setSelectedTarget: (val: string) => void;
    availableColumns: any;
    handlePredict: () => void;
    isPredicting: boolean;
}

export default function PredictionTab({
    predictionInput,
    setPredictionInput,
    predictionResult,
    useAutoTarget,
    setUseAutoTarget,
    selectedTarget,
    setSelectedTarget,
    availableColumns,
    handlePredict,
    isPredicting
}: PredictionTabProps) {

    const [manualFeatureMode, setManualFeatureMode] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get irrelevant column names to filter out
    const irrelevantColumnNames = (availableColumns?.irrelevant_columns || []).map((c: any) => c.column);

    // Determine the actual target (auto-detected or manual)
    const effectiveTarget = useAutoTarget
        ? (availableColumns?.recommended_target || '')
        : selectedTarget;

    // Column stats from backend
    const columnStats = availableColumns?.column_stats || {};

    // All prediction features (numeric + categorical)
    const allFeatures = availableColumns?.all_prediction_features || 
        (availableColumns?.prediction_features || []).concat(availableColumns?.categorical_features || []);
    
    // Fallback: use recommended_features if all_prediction_features is empty
    const featuresToUse = allFeatures.length > 0 
        ? allFeatures.filter((f: string) => f !== effectiveTarget)
        : (availableColumns?.recommended_features || []).filter((f: string) => f !== effectiveTarget);

    // If manual mode, filter to selected features
    const featuresToShow = manualFeatureMode && selectedFeatures.length > 0
        ? featuresToUse.filter((f: string) => selectedFeatures.includes(f))
        : featuresToUse;

    const toggleFeature = (feat: string) => {
        setSelectedFeatures(prev => 
            prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
        );
    };

    const selectAllFeatures = () => setSelectedFeatures([...featuresToUse]);
    const deselectAllFeatures = () => setSelectedFeatures([]);

    // Get placeholder text based on column stats
    const getPlaceholder = (col: string) => {
        const stat = columnStats[col];
        if (!stat) return `Enter ${col}`;
        if (stat.type === 'numeric') {
            if (stat.is_integer) {
                return `${stat.min} – ${stat.max}`;
            }
            return `${stat.min} – ${stat.max}`;
        }
        return `Select ${col}`;
    };

    // Get hint text for the field
    const getHint = (col: string) => {
        const stat = columnStats[col];
        if (!stat) return null;
        if (stat.type === 'numeric') {
            return `Mean: ${stat.mean} · Median: ${stat.median}`;
        }
        return `${stat.num_unique} unique values`;
    };

    // Handle slider change
    const handleSliderChange = (col: string, value: number) => {
        const stat = columnStats[col];
        const roundedVal = stat?.is_integer ? Math.round(value) : parseFloat(value.toFixed(2));
        setPredictionInput({ ...predictionInput, [col]: roundedVal });
    };

    return (
        <motion.div
            key="predict"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Main Prediction Card */}
            <div className="rounded-2xl bg-[var(--foreground)]/5 border border-[var(--card-border)] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[var(--card-border)] bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                                <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Prediction Engine</h2>
                                <p className="text-[var(--text-muted)] text-xs mt-0.5">Configure inputs and generate real-time predictions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{featuresToShow.length} features</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Target Variable Selection */}
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Settings2 className="w-3 h-3" /> Target Variable
                            </h3>
                            <button
                                onClick={() => setUseAutoTarget(!useAutoTarget)}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                {useAutoTarget ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                {useAutoTarget ? 'Auto' : 'Manual'}
                            </button>
                        </div>
                        {useAutoTarget ? (
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm font-mono font-bold text-blue-400">
                                    {availableColumns?.recommended_target || 'Auto-detecting...'}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)]">AI-selected target</span>
                            </div>
                        ) : (
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-blue-500 text-sm font-medium transition-colors"
                            >
                                <option value="">Select target column...</option>
                                {availableColumns?.columns?.filter((col: string) => !irrelevantColumnNames.includes(col)).map((col: string) => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Manual Feature Selection Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <span className="text-xs font-bold">Manual Feature Selection</span>
                        </div>
                        <button
                            onClick={() => {
                                setManualFeatureMode(!manualFeatureMode);
                                if (!manualFeatureMode) selectAllFeatures();
                            }}
                            className={`relative w-10 h-5 rounded-full transition-all ${manualFeatureMode ? 'bg-blue-600' : 'bg-[var(--foreground)]/20'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${manualFeatureMode ? 'left-5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    {/* Feature Selection Panel */}
                    <AnimatePresence>
                        {manualFeatureMode && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Select features for prediction</span>
                                        <div className="flex gap-2">
                                            <button onClick={selectAllFeatures} className="text-[10px] font-bold text-blue-400 hover:text-blue-300">Select All</button>
                                            <span className="text-[var(--text-muted)]">·</span>
                                            <button onClick={deselectAllFeatures} className="text-[10px] font-bold text-red-400 hover:text-red-300">Deselect All</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {featuresToUse.map((feat: string) => {
                                            const isSelected = selectedFeatures.includes(feat);
                                            const stat = columnStats[feat];
                                            return (
                                                <button
                                                    key={feat}
                                                    onClick={() => toggleFeature(feat)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected
                                                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                                        : 'bg-[var(--foreground)]/5 border border-[var(--card-border)] opacity-50 hover:opacity-80'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stat?.type === 'categorical' ? 'bg-purple-400' : 'bg-blue-400'}`} />
                                                        {feat}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Excluded Columns Notice */}
                    {irrelevantColumnNames.length > 0 && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Auto-Excluded</p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                    <span className="font-mono opacity-70">{irrelevantColumnNames.join(', ')}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Dynamic Input Features */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                                <SlidersHorizontal className="w-3.5 h-3.5" /> Input Features
                            </h3>
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                            >
                                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {showAdvanced ? 'Compact View' : 'Expanded View'}
                            </button>
                        </div>
                        
                        {featuresToShow.length > 0 ? (
                            <div className={`grid gap-4 ${showAdvanced ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                {featuresToShow.map((col: string, idx: number) => {
                                    const stat = columnStats[col];
                                    const isNumeric = !stat || stat?.type === 'numeric';
                                    const isCategorical = stat?.type === 'categorical';
                                    
                                    return (
                                        <motion.div 
                                            key={col}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={`rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/20 transition-all ${showAdvanced ? 'p-4' : 'p-3'}`}
                                        >
                                            {/* Label */}
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${isCategorical ? 'bg-purple-400' : 'bg-blue-400'}`} />
                                                    {col}
                                                </label>
                                                {stat && (
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isCategorical ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {isCategorical ? 'CAT' : 'NUM'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Categorical: Dropdown */}
                                            {isCategorical && stat?.unique_values ? (
                                                <div>
                                                    <select
                                                        value={predictionInput[col] ?? ""}
                                                        onChange={(e) => setPredictionInput({ ...predictionInput, [col]: e.target.value })}
                                                        className="w-full px-3 py-2.5 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-[var(--foreground)] focus:border-purple-500 focus:bg-[var(--foreground)]/10 transition-colors outline-none text-sm appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select {col}...</option>
                                                        {stat.unique_values.map((val: string) => (
                                                            <option key={val} value={val}>{val}</option>
                                                        ))}
                                                    </select>
                                                    {showAdvanced && (
                                                        <p className="text-[9px] text-[var(--text-muted)] mt-1.5 font-medium">{stat.num_unique} unique values</p>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Numeric: Input + Slider */
                                                <div>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="number"
                                                            value={predictionInput[col] ?? ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                                setPredictionInput({ ...predictionInput, [col]: val === '' ? '' : (isNaN(val as number) ? 0 : val) });
                                                            }}
                                                            placeholder={getPlaceholder(col)}
                                                            step={stat?.step || 1}
                                                            min={stat?.min}
                                                            max={stat?.max}
                                                            className="flex-1 px-3 py-2.5 bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-muted)]/40 focus:border-blue-500 focus:bg-[var(--foreground)]/10 transition-colors outline-none text-sm font-mono"
                                                        />
                                                        {stat && predictionInput[col] !== undefined && predictionInput[col] !== '' && (
                                                            <span className="text-[10px] font-bold text-blue-400 min-w-[40px] text-right">
                                                                {typeof predictionInput[col] === 'number' ? predictionInput[col].toFixed(stat.is_integer ? 0 : 1) : '—'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Slider */}
                                                    {stat && (showAdvanced || stat.max - stat.min <= 1000) && (
                                                        <div className="mt-2">
                                                            <input
                                                                type="range"
                                                                min={stat.min}
                                                                max={stat.max}
                                                                step={stat.step}
                                                                value={predictionInput[col] ?? stat.mean ?? stat.min}
                                                                onChange={(e) => handleSliderChange(col, parseFloat(e.target.value))}
                                                                className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:cursor-pointer"
                                                            />
                                                            <div className="flex justify-between mt-0.5">
                                                                <span className="text-[9px] text-[var(--text-muted)] font-mono">{stat.min}</span>
                                                                {showAdvanced && <span className="text-[9px] text-blue-400 font-mono font-bold">μ {stat.mean}</span>}
                                                                <span className="text-[9px] text-[var(--text-muted)] font-mono">{stat.max}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Hint */}
                                                    {showAdvanced && stat && (
                                                        <p className="text-[9px] text-[var(--text-muted)] mt-1 font-medium">{getHint(col)}</p>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-10 border border-dashed border-[var(--card-border)] rounded-xl">
                                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)] mr-2" />
                                <p className="text-[var(--text-muted)] text-sm">Loading feature columns...</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Fill Buttons */}
                    {Object.keys(columnStats).length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const filled: any = {};
                                    featuresToShow.forEach((col: string) => {
                                        const stat = columnStats[col];
                                        if (stat?.type === 'numeric') {
                                            filled[col] = stat.mean ?? stat.median ?? 0;
                                        } else if (stat?.type === 'categorical' && stat.unique_values?.length > 0) {
                                            filled[col] = stat.unique_values[0];
                                        }
                                    });
                                    setPredictionInput(filled);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-xs font-bold"
                            >
                                <Sparkles className="w-3 h-3 text-blue-400" /> Fill with Averages
                            </button>
                            <button
                                onClick={() => {
                                    const filled: any = {};
                                    featuresToShow.forEach((col: string) => {
                                        const stat = columnStats[col];
                                        if (stat?.type === 'numeric') {
                                            filled[col] = stat.median ?? stat.mean ?? 0;
                                        } else if (stat?.type === 'categorical' && stat.unique_values?.length > 0) {
                                            filled[col] = stat.unique_values[0];
                                        }
                                    });
                                    setPredictionInput(filled);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-xs font-bold"
                            >
                                <SlidersHorizontal className="w-3 h-3 text-purple-400" /> Fill with Medians
                            </button>
                            <button
                                onClick={() => setPredictionInput({})}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--foreground)]/5 border border-[var(--card-border)] hover:border-red-500/30 hover:bg-red-500/5 transition-all text-xs font-bold text-red-400"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Predict Button */}
                    <button
                        onClick={handlePredict}
                        disabled={isPredicting || Object.keys(predictionInput).length === 0}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-white group"
                    >
                        {isPredicting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Running inference...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 group-hover:animate-pulse" />
                                <span>Generate Prediction</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Prediction Result */}
            <AnimatePresence>
                {predictionResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-2xl border border-[var(--card-border)] overflow-hidden"
                    >
                        {predictionResult.error ? (
                            <div className="p-6 bg-red-500/5 border-l-4 border-red-500">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-red-400">Prediction Failed</p>
                                        <p className="text-sm text-[var(--text-muted)] mt-1">{predictionResult.error}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[var(--foreground)]/5">
                                {/* Result Header */}
                                <div className="p-6 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent border-b border-[var(--card-border)]">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Predicted Value</span>
                                            </div>
                                            <p className="text-4xl font-bold text-green-400 font-mono">{predictionResult.prediction}</p>
                                        </div>
                                        {predictionResult.confidence && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Confidence</p>
                                                <p className="text-2xl font-mono font-bold text-green-400">{predictionResult.confidence.toFixed(1)}%</p>
                                                <div className="w-24 h-2 bg-[var(--foreground)]/10 rounded-full overflow-hidden mt-1.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${predictionResult.confidence}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div className="p-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                            <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Model</p>
                                            <p className="text-xs font-bold capitalize">{predictionResult.model_type}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                            <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Target</p>
                                            <p className="text-xs font-bold font-mono">{predictionResult.target_column}</p>
                                        </div>
                                        {predictionResult.engine && (
                                            <div className="p-3 rounded-xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                                <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Engine</p>
                                                <p className="text-xs font-bold">{predictionResult.engine}</p>
                                            </div>
                                        )}
                                    </div>
                                    {predictionResult.target_suggestion && (
                                        <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl flex items-center gap-2">
                                            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                            <p className="text-[10px] text-blue-400 font-medium">{predictionResult.target_suggestion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
