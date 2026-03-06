import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  strength: number; // 0-100
  connections: string[];
  category: string;
}

interface ConceptDetails {
  label: string;
  strength: number;
  category: string;
  reviewHistory: string[];
  relatedConcepts: string[];
}

export function BrainMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<ConceptDetails | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const animationFrameRef = useRef<number>();
  const pulseRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Mock knowledge graph data
  const nodes: Node[] = [
    { id: '1', label: 'Neural Networks', x: 400, y: 300, strength: 90, connections: ['2', '3', '4'], category: 'core' },
    { id: '2', label: 'Deep Learning', x: 600, y: 200, strength: 85, connections: ['1', '5', '6'], category: 'core' },
    { id: '3', label: 'Backpropagation', x: 300, y: 150, strength: 88, connections: ['1', '4'], category: 'theory' },
    { id: '4', label: 'Activation Functions', x: 250, y: 400, strength: 92, connections: ['1', '3'], category: 'theory' },
    { id: '5', label: 'CNN', x: 750, y: 150, strength: 82, connections: ['2', '7'], category: 'architecture' },
    { id: '6', label: 'RNN', x: 700, y: 350, strength: 78, connections: ['2', '8'], category: 'architecture' },
    { id: '7', label: 'Computer Vision', x: 900, y: 200, strength: 82, connections: ['5'], category: 'application' },
    { id: '8', label: 'NLP', x: 850, y: 400, strength: 75, connections: ['6', '9'], category: 'application' },
    { id: '9', label: 'Transformers', x: 1000, y: 450, strength: 70, connections: ['8', '10'], category: 'architecture' },
    { id: '10', label: 'BERT', x: 1100, y: 350, strength: 68, connections: ['9'], category: 'model' },
    { id: '11', label: 'Reinforcement Learning', x: 500, y: 500, strength: 65, connections: ['12', '13'], category: 'core' },
    { id: '12', label: 'Q-Learning', x: 400, y: 600, strength: 72, connections: ['11'], category: 'algorithm' },
    { id: '13', label: 'Policy Gradients', x: 600, y: 600, strength: 58, connections: ['11'], category: 'algorithm' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Update pulse animation
      pulseRef.current += 0.02;
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw connections with pulse effect
      nodes.forEach(node => {
        node.connections.forEach(connId => {
          const targetNode = nodes.find(n => n.id === connId);
          if (targetNode) {
            // Calculate pulse intensity based on connection strength
            const avgStrength = (node.strength + targetNode.strength) / 2;
            const pulseIntensity = 0.15 + Math.sin(pulseRef.current + parseInt(node.id) * 0.5) * 0.1;
            const opacity = avgStrength >= 85 ? 0.3 : avgStrength >= 70 ? 0.25 : 0.2;
            
            // Main connection line
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = `rgba(79, 140, 255, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Pulsing highlight on strong connections
            if (avgStrength >= 80) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(targetNode.x, targetNode.y);
              ctx.strokeStyle = `rgba(79, 140, 255, ${pulseIntensity})`;
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          }
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id;
        const isSelected = selectedNode?.label === node.label;
        const radius = isHovered ? 35 : 30;
        
        // Calculate pulse for this node
        const nodePulse = Math.sin(pulseRef.current + parseInt(node.id) * 0.3) * 0.5 + 0.5;
        
        // Node glow with pulse
        const glowRadius = radius * (2 + nodePulse * 0.3);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        const color = getNodeColor(node.strength);
        gradient.addColorStop(0, `${color}${Math.floor(nodePulse * 60 + 20).toString(16)}`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#131824';
        ctx.fill();
        
        // Animated stroke
        const strokeWidth = isHovered ? 4 : isSelected ? 3.5 : 3;
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        
        // Add shadow for selected node
        if (isSelected || isHovered) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Node label
        ctx.fillStyle = '#E8EEF7';
        ctx.font = `${isHovered ? '14px' : '12px'} Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const words = node.label.split(' ');
        if (words.length > 1) {
          ctx.fillText(words[0], node.x, node.y - 5);
          ctx.fillText(words.slice(1).join(' '), node.x, node.y + 10);
        } else {
          ctx.fillText(node.label, node.x, node.y);
        }
      });

      ctx.restore();
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [zoom, pan, hoveredNode, selectedNode]);

  const getNodeColor = (strength: number): string => {
    if (strength >= 85) return '#00FFA3'; // Green - strong
    if (strength >= 70) return '#FFB800'; // Yellow - moderate
    return '#FF4D6D'; // Red - weak
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't select if we just finished dragging
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if click is on a node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance < 30;
    });

    if (clickedNode) {
      setSelectedNode({
        label: clickedNode.label,
        strength: clickedNode.strength,
        category: clickedNode.category,
        reviewHistory: ['Reviewed 2 days ago', 'Reviewed 5 days ago', 'Reviewed 8 days ago'],
        relatedConcepts: clickedNode.connections.map(id => nodes.find(n => n.id === id)?.label || ''),
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle dragging
    if (isDragging) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if hovering over a node
    const hoveredNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance < 30;
    });

    setHoveredNode(hoveredNode?.id || null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prevZoom => Math.min(Math.max(prevZoom + delta, 0.5), 3));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Knowledge Brain Map</h1>
          <p className="text-[#8B92A8]">Interactive visualization of your knowledge network</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
            className="p-3 bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-lg hover:border-[rgba(79,140,255,0.4)] transition-all"
          >
            <ZoomIn className="w-5 h-5 text-[#4F8CFF]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
            className="p-3 bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-lg hover:border-[rgba(79,140,255,0.4)] transition-all"
          >
            <ZoomOut className="w-5 h-5 text-[#4F8CFF]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-3 bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-lg hover:border-[rgba(79,140,255,0.4)] transition-all"
          >
            <Maximize2 className="w-5 h-5 text-[#4F8CFF]" />
          </motion.button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#00FFA3]" />
          <span className="text-sm text-[#E8EEF7]">Strong (85%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FFB800]" />
          <span className="text-sm text-[#E8EEF7]">Moderate (70-84%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FF4D6D]" />
          <span className="text-sm text-[#E8EEF7]">Weak (&lt;70%)</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-[#8B92A8]">
          <span className="flex items-center gap-1.5">
            <span className="text-[#4F8CFF]">🖱️ Drag</span> to pan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#4F8CFF]">🎡 Scroll</span> to zoom
          </span>
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Click nodes for details
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl overflow-hidden"
            style={{ height: '600px' }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleCanvasMouseDown}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
              onWheel={handleWheel}
              className={`w-full h-full ${isDragging ? 'cursor-grabbing' : hoveredNode ? 'cursor-pointer' : 'cursor-grab'}`}
              style={{ touchAction: 'none' }}
            />
          </motion.div>
        </div>

        {/* Concept Details Panel */}
        <div>
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6 space-y-4"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedNode.label}</h3>
                <span className="inline-block px-3 py-1 bg-[rgba(79,140,255,0.2)] text-[#4F8CFF] rounded-full text-sm">
                  {selectedNode.category}
                </span>
              </div>

              <div>
                <p className="text-sm text-[#8B92A8] mb-2">Memory Strength</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedNode.strength}%` }}
                      className="h-full"
                      style={{
                        background: `linear-gradient(to right, ${getNodeColor(selectedNode.strength)}, ${getNodeColor(selectedNode.strength)}dd)`,
                      }}
                    />
                  </div>
                  <span className="text-lg font-bold text-white">{selectedNode.strength}%</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#8B92A8] mb-2">Review History</p>
                <div className="space-y-2">
                  {selectedNode.reviewHistory.map((history, index) => (
                    <div key={index} className="text-sm text-[#E8EEF7] bg-[rgba(79,140,255,0.05)] rounded px-3 py-2">
                      {history}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-[#8B92A8] mb-2">Related Concepts</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.relatedConcepts.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[rgba(122,92,255,0.2)] text-[#7A5CFF] rounded-lg text-sm border border-[rgba(122,92,255,0.3)]"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white py-3 rounded-lg"
              >
                Review This Concept
              </motion.button>
            </motion.div>
          ) : (
            <div className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl p-6 h-full flex items-center justify-center">
              <div className="text-center text-[#8B92A8]">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click on a node to view concept details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}