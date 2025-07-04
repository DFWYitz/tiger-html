import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, GripVertical, Lightbulb } from 'lucide-react';

const TigerAirRoadmap = () => {
  const [timeline, setTimeline] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const initiatives = {
    foundation: [
      {
        id: 'warehouse-org',
        title: 'Warehouse Organization',
        description: 'Physical inventory system with logical placement',
        dependencies: [],
        enables: ['digital-inventory', 'team-expansion'],
        risks: 'Without this, technicians waste time searching for parts',
        benefit: 'Faster job completion, reduced frustration, professional appearance'
      },
      {
        id: 'process-docs',
        title: 'Process Documentation',
        description: 'Written procedures for consistent service delivery',
        dependencies: [],
        enables: ['training-programs', 'quality-standards'],
        risks: 'Creating SOPs after digital systems may require rewrites',
        benefit: 'Consistent quality, easier training, business can operate without owner'
      },
      {
        id: 'digital-inventory',
        title: 'Digital Inventory System',
        description: 'Real-time tracking of parts and materials',
        dependencies: ['warehouse-org'],
        enables: ['scheduling-system', 'performance-tracking'],
        risks: 'Implementing before organization creates garbage-in-garbage-out',
        benefit: 'Accurate stock levels, automatic reordering, job cost tracking'
      }
    ],
    operational: [
      {
        id: 'training-programs',
        title: 'Structured Training Programs',
        description: 'Standardized onboarding and skill development',
        dependencies: ['process-docs'],
        enables: ['team-expansion', 'quality-standards'],
        risks: 'Without documented processes, training becomes inconsistent',
        benefit: 'Scalable workforce, consistent service, reduced supervision needs'
      },
      {
        id: 'scheduling-system',
        title: 'Digital Scheduling System',
        description: 'Automated appointment management and routing',
        dependencies: ['digital-inventory'],
        enables: ['performance-tracking', 'customer-communication'],
        risks: 'Poor data quality makes scheduling optimization ineffective',
        benefit: 'Optimized routes, better customer communication, capacity planning'
      },
      {
        id: 'team-expansion',
        title: 'Team Expansion',
        description: 'Hiring additional skilled technicians',
        dependencies: ['warehouse-org', 'training-programs'],
        enables: ['installation-division', 'geographic-expansion'],
        risks: 'Expanding without systems creates chaos and quality issues',
        benefit: 'Increased capacity, geographic coverage, specialization opportunities'
      }
    ],
    optimization: [
      {
        id: 'installation-division',
        title: 'Installation Division',
        description: 'Dedicated team for new system installations',
        dependencies: ['team-expansion', 'training-programs'],
        enables: ['commercial-market', 'service-contracts'],
        risks: 'Without proven service operations, installations may suffer',
        benefit: 'Higher-value projects, complete solutions, customer satisfaction'
      },
      {
        id: 'service-contracts',
        title: 'Service Contract Program',
        description: 'Recurring maintenance agreements',
        dependencies: ['installation-division', 'quality-standards'],
        enables: ['commercial-market', 'predictable-revenue'],
        risks: 'Poor service quality kills contract renewals',
        benefit: 'Predictable revenue, customer retention, premium pricing'
      },
      {
        id: 'commercial-market',
        title: 'Commercial Market Entry',
        description: 'Business and institutional customers',
        dependencies: ['service-contracts', 'team-expansion'],
        enables: ['geographic-expansion'],
        risks: 'Commercial customers demand higher reliability and accountability',
        benefit: 'Larger projects, recurring contracts, market diversification'
      }
    ]
  };

  const prompts = {
    'process-docs-before-digital': {
      title: 'Documentation First Strategy',
      question: 'What processes are already working well in your operation that you could document now?',
      consideration: 'Starting with proven processes ensures your SOPs reflect real-world success, but may require updates as digital systems reveal new efficiencies.'
    },
    'digital-before-docs': {
      title: 'Digital First Strategy',
      question: 'Are you comfortable rewriting your SOPs after implementing digital systems?',
      consideration: 'Digital systems often reveal process improvements, but may require documentation rewrites and team retraining.'
    },
    'team-expansion-early': {
      title: 'Early Team Growth',
      question: 'How would your team handle increased capacity without organized systems?',
      consideration: 'More technicians can increase revenue quickly, but without proper systems, quality and efficiency may suffer.'
    },
    'foundation-skip': {
      title: 'Foundation Dependencies',
      question: 'What happens to training consistency if we skip process documentation?',
      consideration: 'Skipping foundational elements often creates problems that are expensive to fix later.'
    }
  };

  const allItems = [...initiatives.foundation, ...initiatives.operational, ...initiatives.optimization];

  const checkDependencies = (newTimeline) => {
    const newAlerts = [];
    const completedItems = new Set();
    
    newTimeline.forEach((item, index) => {
      // Check if dependencies are met
      const unmetDependencies = item.dependencies.filter(dep => !completedItems.has(dep));
      
      if (unmetDependencies.length > 0) {
        const depNames = unmetDependencies.map(dep => 
          allItems.find(i => i.id === dep)?.title || dep
        ).join(', ');
        
        newAlerts.push({
          type: 'warning',
          title: `Dependency Alert: ${item.title}`,
          message: `This initiative depends on: ${depNames}`,
          consequence: item.risks
        });
      }
      
      completedItems.add(item.id);
    });
    
    setAlerts(newAlerts);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newTimeline = [...timeline];
    const draggedIndex = timeline.findIndex(item => item.id === draggedItem.id);
    
    if (draggedIndex !== -1) {
      // Moving within timeline
      newTimeline.splice(draggedIndex, 1);
      newTimeline.splice(targetIndex, 0, draggedItem);
    } else {
      // Adding from available items
      newTimeline.splice(targetIndex, 0, draggedItem);
    }
    
    setTimeline(newTimeline);
    checkDependencies(newTimeline);
    setDraggedItem(null);
  };

  const handleDropFromAvailable = (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const newTimeline = [...timeline, draggedItem];
    setTimeline(newTimeline);
    checkDependencies(newTimeline);
    setDraggedItem(null);
  };

  const removeFromTimeline = (itemId) => {
    const newTimeline = timeline.filter(item => item.id !== itemId);
    setTimeline(newTimeline);
    checkDependencies(newTimeline);
  };

  const availableItems = allItems.filter(item => !timeline.some(t => t.id === item.id));

  const getItemsByCategory = (category) => {
    return availableItems.filter(item => initiatives[category].some(i => i.id === item.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-thin text-gray-800 mb-4 tracking-wide">
            Strategic Roadmap Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Explore different implementation paths and understand the cause-and-effect relationships 
            that drive sustainable growth. Drag initiatives to build your custom roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Available Initiatives */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-thin text-gray-800 mb-6 tracking-wide">Available Initiatives</h2>
            
            {Object.entries(initiatives).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-widest">
                  {category.replace('-', ' ')}
                </h3>
                <div className="space-y-3">
                  {getItemsByCategory(category).map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 cursor-move hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
                      style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-2 font-light">{item.description}</p>
                        </div>
                        <GripVertical className="w-5 h-5 text-gray-400 ml-3 opacity-60" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Builder */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-thin text-gray-800 mb-6 tracking-wide">Your Implementation Timeline</h2>
            
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mb-6 space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mr-4 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900">{alert.title}</h4>
                        <p className="text-sm text-amber-700 mt-2 font-light">{alert.message}</p>
                        <p className="text-sm text-amber-600 mt-2 italic font-light">{alert.consequence}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropFromAvailable}
              className={`min-h-96 border-2 border-dashed rounded-xl p-6 ${
                timeline.length === 0 ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100' : 'border-transparent'
              }`}
              style={{
                boxShadow: timeline.length === 0 ? 'inset 0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {timeline.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg font-light">Drag initiatives here to build your roadmap</p>
                  <p className="text-sm text-gray-400 mt-3 font-light">
                    Start with foundational elements for optimal results
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div
                      key={item.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="relative"
                    >
                      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 shadow-lg backdrop-blur-sm"
                        style={{
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-light text-gray-700 mr-5 shadow-inner">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 text-lg">{item.title}</h4>
                              <p className="text-sm text-gray-600 mt-2 font-light leading-relaxed">{item.description}</p>
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                                  <span className="font-medium text-green-800">Benefits:</span>
                                  <p className="text-green-700 mt-1 font-light">{item.benefit}</p>
                                </div>
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border border-red-100">
                                  <span className="font-medium text-red-800">Risks:</span>
                                  <p className="text-red-700 mt-1 font-light">{item.risks}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromTimeline(item.id)}
                            className="ml-4 text-gray-400 hover:text-gray-600 text-sm font-light transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {index < timeline.length - 1 && (
                        <div className="flex justify-center py-3">
                          <ArrowRight className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strategic Prompts */}
            {timeline.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-lg backdrop-blur-sm">
                <div className="flex items-start">
                  <Lightbulb className="w-6 h-6 text-blue-600 mr-4 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 text-lg">Strategic Consideration</h4>
                    <p className="text-sm text-blue-700 mt-2 font-light leading-relaxed">
                      What existing processes could you leverage to accelerate this timeline?
                    </p>
                    <p className="text-sm text-blue-600 mt-3 font-light leading-relaxed">
                      Consider: Which systems are already working well? What proven methods could inform your approach?
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Insights */}
        <div className="mt-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-xl p-8 shadow-xl backdrop-blur-sm"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h3 className="text-2xl font-thin text-gray-800 mb-6 tracking-wide text-center">Implementation Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
              <h4 className="font-medium text-gray-800 mb-3">Foundation First</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Strong foundational systems create multiplicative effects. Each improvement 
                amplifies the benefits of subsequent initiatives.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
              <h4 className="font-medium text-gray-800 mb-3">Sequence Matters</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                The order of implementation affects both cost and effectiveness. Dependencies 
                exist for operational and strategic reasons.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
              <h4 className="font-medium text-gray-800 mb-3">Build on Success</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Starting with proven processes and existing strengths creates momentum 
                and reduces implementation risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TigerAirRoadmap;