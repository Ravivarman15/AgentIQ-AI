"use client";

import { motion } from "framer-motion";
import { Brain, Settings2, Target, Trophy, Flame } from "lucide-react";
import React from "react";

export default function MachineLearningPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans text-gray-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Brain className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Machine Learning</h1>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">
                    Zero-code model training powered by PyCaret. Automatically setup environments, compare topologies, tune hyperparameters, and select the best algorithms for your data.
                </p>
            </motion.div>

            <section className="mb-16">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-2xl bg-[#111] border border-white/5 text-center group hover:border-emerald-500/30 transition-colors">
                           <Target className="w-8 h-8 text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                           <h3 className="font-bold text-white mb-2">1. Select Target</h3>
                           <p className="text-xs text-gray-400">Choose the column you wish to predict. Classification or Regression is auto-detected.</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#111] border border-white/5 text-center group hover:border-emerald-500/30 transition-colors">
                           <Settings2 className="w-8 h-8 text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                           <h3 className="font-bold text-white mb-2">2. Preprocess</h3>
                           <p className="text-xs text-gray-400">Imputation, one-hot encoding, and normalizations are applied transparently via the backend agent.</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#111] border border-white/5 text-center group hover:border-emerald-500/30 transition-colors">
                           <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                           <h3 className="font-bold text-white mb-2">3. Compare</h3>
                           <p className="text-xs text-gray-400">Dozens of base models are run in parallel. The winning model based on Accuracy/R2 is surfaced.</p>
                      </div>
                 </div>
            </section>

             <section>
                 <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center">
                    <Flame className="w-5 h-5 text-orange-500 mr-2" /> Supported Algorithms
                 </h2>
                 <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-black/40 text-gray-400 text-xs uppercase">
                              <tr>
                                  <th className="px-6 py-4 font-medium">Task Type</th>
                                  <th className="px-6 py-4 font-medium">Auto-Evaluated Models</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              <tr className="hover:bg-white/5">
                                  <td className="px-6 py-4 font-bold text-white">Classification</td>
                                  <td className="px-6 py-4 text-gray-400">Random Forest, LightGBM, XGBoost, Logistic Regression, SVM, KNN...</td>
                              </tr>
                              <tr className="hover:bg-white/5">
                                  <td className="px-6 py-4 font-bold text-white">Regression</td>
                                  <td className="px-6 py-4 text-gray-400">Linear Regression, Ridge, Lasso, Elastic Net, CatBoost Regressor...</td>
                              </tr>
                          </tbody>
                      </table>
                 </div>
            </section>
        </div>
    );
}
