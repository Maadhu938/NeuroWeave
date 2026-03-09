import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, Info, Brain, Trash2 } from 'lucide-react';
import { getKnowledgeGraph, deleteKnowledgeNode, type GraphNode } from '@/lib/api';
import { ReviewQuiz } from '@/components/ReviewQuiz';

interface ConceptDetails {
  label: string;
  strength: number;
  category: string;
  status: string;
  relatedConcepts: string[];
}

interface BrainMapProps {
  onNavigate?: (page: string) => void;
}

export function BrainMap({ onNavigate }: BrainMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<ConceptDetails | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const animationFrameRef = useRef<number>();
  const pulseRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const lastTouchPosRef = useRef({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(true);
  const nodesRef = useRef<GraphNode[]>([]);
  const [reviewConcept, setReviewConcept] = useState<{ label: string; strength: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    getKnowledgeGraph()
      .then((data) => {
        setNodes(data.nodes);
        nodesRef.current = data.nodes;
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Build a stable index map for animation seeding (avoids parseInt on UUIDs)
  const nodeIndexMap = useCallback(() => {
    const map = new Map<string, number>();
    nodes.forEach((n, i) => map.set(n.id, i));
    return map;
  }, [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const idxMap = nodeIndexMap();

    // Center nodes to the canvas on first render
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

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
      // Offset so backend coords (centered at 400,300) map to actual canvas center
      const offsetX = pan.x + (centerX - 400) * zoom;
      const offsetY = pan.y + (centerY - 300) * zoom;
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);

      // Draw connections with pulse effect
      nodes.forEach(node => {
        const nodeIdx = idxMap.get(node.id) ?? 0;
        node.connections.forEach(connId => {
          const targetNode = nodes.find(n => n.id === connId);
          if (targetNode) {
            const avgStrength = (node.strength + targetNode.strength) / 2;
            const pulseIntensity = 0.15 + Math.sin(pulseRef.current + nodeIdx * 0.5) * 0.1;
            const opacity = avgStrength >= 85 ? 0.3 : avgStrength >= 70 ? 0.25 : 0.2;
            
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = `rgba(79, 140, 255, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
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
        const nodeIdx = idxMap.get(node.id) ?? 0;
        const isHovered = hoveredNode === node.id;
        const isSelected = selectedNode?.label === node.label;
        const radius = isHovered ? 35 : 30;
        
        const nodePulse = Math.sin(pulseRef.current + nodeIdx * 0.3) * 0.5 + 0.5;
        
        // Node glow with pulse
        const glowRadius = radius * (2 + nodePulse * 0.3);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        const color = getNodeColor(node.strength);
        const alphaHex = Math.floor(nodePulse * 60 + 20).toString(16).padStart(2, '0');
        gradient.addColorStop(0, `${color}${alphaHex}`);
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
        
        const strokeWidth = isHovered ? 4 : isSelected ? 3.5 : 3;
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        
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
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, zoom, pan, hoveredNode, selectedNode, nodeIndexMap]);

  const getNodeColor = (strength: number): string => {
    if (strength >= 85) return '#00FFA3'; // Green - strong
    if (strength >= 70) return '#FFB800'; // Yellow - moderate
    return '#FF4D6D'; // Red - weak
  };

  const canvasToWorld = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const offsetX = pan.x + (centerX - 400) * zoom;
    const offsetY = pan.y + (centerY - 300) * zoom;
    return {
      x: (e.clientX - rect.left - offsetX) / zoom,
      y: (e.clientY - rect.top - offsetY) / zoom,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't select if we just finished dragging
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = canvasToWorld(e);

    // Check if click is on a node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance < 30;
    });

    if (clickedNode) {
      const status = clickedNode.strength >= 85 ? 'Strong — no review needed soon'
        : clickedNode.strength >= 70 ? 'Moderate — review recommended this week'
        : clickedNode.strength >= 50 ? 'Weakening — review within 1-2 days'
        : 'Critical — immediate review needed';
      setSelectedNode({
        label: clickedNode.label,
        strength: clickedNode.strength,
        category: clickedNode.category,
        status,
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

    const { x, y } = canvasToWorld(e);

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

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchPosRef.current.x;
      const dy = touch.clientY - lastTouchPosRef.current.y;

      setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    
    // Handle click/selection on touch end if not dragging much
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const offsetX = pan.x + (centerX - 400) * zoom;
      const offsetY = pan.y + (centerY - 300) * zoom;
      
      const x = (touch.clientX - rect.left - offsetX) / zoom;
      const y = (touch.clientY - rect.top - offsetY) / zoom;

      // Check if click is on a node
      const clickedNode = nodes.find(node => {
        const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
        return distance < 35; // Slightly larger hit area for touch
      });

      if (clickedNode) {
        const status = clickedNode.strength >= 85 ? 'Strong — no review needed soon'
          : clickedNode.strength >= 70 ? 'Moderate — review recommended this week'
          : clickedNode.strength >= 50 ? 'Weakening — review within 1-2 days'
          : 'Critical — immediate review needed';
        setSelectedNode({
          label: clickedNode.label,
          strength: clickedNode.strength,
          category: clickedNode.category,
          status,
          relatedConcepts: clickedNode.connections.map(id => nodes.find(n => n.id === id)?.label || ''),
        });
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Knowledge Brain Map</h1>
          <p className="text-sm text-[#8B92A8]">Interactive visualization of your knowledge network</p>
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
      <div className="flex flex-wrap items-center gap-3 md:gap-6 bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-lg p-3 md:p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#00FFA3]" />
          <span className="text-xs md:text-sm text-[#E8EEF7]">Strong (85%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#FFB800]" />
          <span className="text-xs md:text-sm text-[#E8EEF7]">Moderate (70-84%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#FF4D6D]" />
          <span className="text-xs md:text-sm text-[#E8EEF7]">Weak (&lt;70%)</span>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-4 text-sm text-[#8B92A8]">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-[#131824] border border-[rgba(79,140,255,0.2)] rounded-xl overflow-hidden relative"
            style={{ height: 'min(600px, calc(100vh - 280px))' }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleCanvasMouseDown}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`w-full h-full ${isDragging ? 'cursor-grabbing' : hoveredNode ? 'cursor-pointer' : 'cursor-grab'}`}
              style={{ touchAction: 'none' }}
            />

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#131824]/80">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#4F8CFF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#8B92A8]">Loading knowledge graph…</span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-[#8B92A8] space-y-3">
                  <Brain className="w-16 h-16 mx-auto opacity-30" />
                  <p className="text-lg font-medium text-[#E8EEF7]">No knowledge nodes yet</p>
                  <p className="text-sm max-w-xs">Upload documents to start building your knowledge graph</p>
                  {onNavigate && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate('upload')}
                      className="mt-2 px-5 py-2 bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white rounded-lg text-sm"
                    >
                      Upload Knowledge
                    </motion.button>
                  )}
                </div>
              </div>
            )}
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
                <p className="text-sm text-[#8B92A8] mb-2">Status</p>
                <div className="text-sm text-[#E8EEF7] bg-[rgba(79,140,255,0.05)] rounded px-3 py-2">
                  {selectedNode.status}
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
                onClick={() => setReviewConcept({ label: selectedNode.label, strength: selectedNode.strength })}
                className="w-full bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white py-3 rounded-lg"
              >
                Review This Concept
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!confirm(`Delete "${selectedNode.label}"? This cannot be undone.`)) return;
                  try {
                    await deleteKnowledgeNode(selectedNode.label);
                    setSelectedNode(null);
                    // Re-fetch graph
                    const data = await getKnowledgeGraph();
                    setNodes(data.nodes || []);
                  } catch { /* ignore */ }
                }}
                className="w-full border border-[rgba(255,77,109,0.3)] text-[#FF4D6D] py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[rgba(255,77,109,0.1)] transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Concept
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

      {/* Review Quiz Modal */}
      {reviewConcept && (
        <ReviewQuiz
          concept={reviewConcept.label}
          strength={reviewConcept.strength}
          onClose={() => setReviewConcept(null)}
          onComplete={() => {
            // Re-fetch graph to reflect new strength
            getKnowledgeGraph()
              .then((data) => {
                setNodes(data.nodes);
                nodesRef.current = data.nodes;
              })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}