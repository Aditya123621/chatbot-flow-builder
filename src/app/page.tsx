"use client";

import {
  ReactFlow,
  addEdge,
  Handle,
  Position,
  type Node,
  type NodeProps,
  type Connection,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Edge,
} from "@xyflow/react";
import { debounce } from "lodash";
import { DragEvent, useRef } from "react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import MessageIcon from "@@/icons/message-icon.svg";
import LeftIcon from "@@/icons/left-icon.svg";
import WhatsAppIcon from "@@/icons/whatsapp-icon.svg";
import { DnDProvider, useDnD } from "@/components/Common/DnDContext";
import toast from "react-hot-toast";

type NumberNode = Node<
  {
    message: string;
  },
  "number"
>;

interface SelectedNodeData {
  selectedNodeID: string | null;
  selectedNodeMessage: string | null | unknown;
}

interface NodeSelectedProps {
  setNodes: Dispatch<SetStateAction<Node[]>>;
  selectedNodeData: SelectedNodeData;
  setSelectedNodeData: Dispatch<SetStateAction<SelectedNodeData>>;
}

const CustomNode = () => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const [type, setType] = useDnD();
  const idRef = useRef(1);
  // Generate unique node id
  const getId = () => `dndnode_${idRef.current++}`;
  // Store which node is selected and its message
  const [selectedNodeData, setSelectedNodeData] = useState<SelectedNodeData>({
    selectedNodeID: null,
    selectedNodeMessage: null,
  });
  const nodeTypes = {
    textUpdater: TextUpdaterNode,
  };

  // Initial node to render on canvas
  const initialNodes: Node[] = [
    { id: "node-1", type: "textUpdater", position: { x: 0, y: 0 }, data: {} },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Check which nodes don’t have any incoming edges
  const nodesWchHasNoIncEdge = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  const onConnect = useCallback((params: Connection) => {
    // Prevent adding more than one outgoing edge from a node
    setEdges((edgeSnapshot) => {
      const hasOutgoingEdge = edgeSnapshot.some(
        (edge) => edge.source === params.source
      );

      if (hasOutgoingEdge) {
        return edgeSnapshot;
      }

      return addEdge(params, edgeSnapshot);
    });
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Allow dropping nodes inside flow area
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      // Create new node when dropped
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type]
  );

  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    setType("textUpdater");
    event.dataTransfer.setData("text/plain", "textUpdater");
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-[#f2f3f2] flex justify-end items-center py-2 px-10">
        <button
          className="bg-white font-semibold text-blue-900 cursor-pointer py-2 px-8 border border-blue-900 rounded-lg hover:bg-blue-100"
          onClick={() => {
            if (nodes.length > 1 && nodesWchHasNoIncEdge.length > 1) {
              toast.error("Cannot save flow!");
              return;
            } else {
              toast.success("Flow saved successfully!");
            }
          }}
        >
          Save changes
        </button>
      </div>
      <div className="flex flex-col xl:flex-row flex-auto h-screen">
        <div className="h-3/4 xl:h-auto xl:w-3/4">
          <ReactFlow
            ref={reactFlowWrapper}
            className="w-full h-full"
            nodes={nodes}
            nodeTypes={nodeTypes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_event, node) => {
              setSelectedNodeData({
                selectedNodeID: node.id,
                selectedNodeMessage: node.data.message,
              });
            }}
            onPaneClick={() => {
              setSelectedNodeData({
                selectedNodeID: null,
                selectedNodeMessage: null,
              });
            }}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            fitView
          />
        </div>

        <div className="h-1/4 xl:h-auto xl:w-1/4 border-t xl:border-t-0 xl:border-l border-gray-400 overflow-auto">
          {selectedNodeData.selectedNodeID ? (
            <NodeSelected
              setNodes={setNodes}
              selectedNodeData={selectedNodeData}
              setSelectedNodeData={setSelectedNodeData}
            />
          ) : (
            <RenderAddNode />
          )}
        </div>
      </div>
    </div>
  );
};

function TextUpdaterNode(props: NodeProps<NumberNode>) {
  const { data, selected } = props;
  return (
    <button
      type="button"
      className={`border rounded-xl overflow-hidden w-80 shadow-xl cursor-grab bg-white ${
        selected ? "border-blue-900 " : "border-gray-300"
      }`}
    >
      <div className="flex bg-[#b1f0e4] justify-between items-center px-4 py-2">
        <div className="flex gap-2 items-center">
          <MessageIcon width={15} height={15} />
          <h1 className="font-semibold">Send Message</h1>
        </div>
        <WhatsAppIcon width={20} height={20} alt="whatsapp-icon" />
      </div>
      <p className="px-4 py-2 break-all text-start">
        {data?.message ?? (
          <span className="text-gray-300">Click to edit</span>
        )}
      </p>

      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !bg-gray-600"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !bg-gray-600"
      />
    </button>
  );
}

function RenderAddNode() {
  const [_, setType] = useDnD();

  // When we try to start dragging the message box
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    setType("textUpdater");
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <div className="p-4">
      <div
        className="border border-blue-900 rounded-md flex flex-col justify-center items-center gap-4 p-4 w-2/3 max-w-80 cursor-grab m-auto"
        onDragStart={(event) => onDragStart(event)}
        draggable
      >
        <MessageIcon width={40} height={40} className="text-blue-900" />
        <p className="text-blue-900">Message</p>
      </div>
    </div>
  );
}

function NodeSelected({
  setNodes,
  selectedNodeData,
  setSelectedNodeData,
}: NodeSelectedProps) {
  const [textAreaValue, setTextAreaValue] = useState<string | unknown>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Setting textarea value
    setTextAreaValue(selectedNodeData.selectedNodeMessage ?? "");

    // Auto-focus textarea when node is selected
    if (selectedNodeData.selectedNodeID && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [selectedNodeData.selectedNodeID, selectedNodeData.selectedNodeMessage]);

  // Debounced text update for node data(hit after 3 second)
  const debouncingEffectFn = useMemo(
    () =>
      debounce((msg) => {
        setNodes((nodePrev) =>
          nodePrev.map((eachNode) => {
            return eachNode.id === selectedNodeData.selectedNodeID
              ? {
                  ...eachNode,
                  data: {
                    ...eachNode.data,
                    message: msg,
                  },
                }
              : eachNode;
          })
        );
      }, 300),
    [setNodes, selectedNodeData.selectedNodeID]
  );

  return (
    <div>
      <div className="relative py-2 border-b border-gray-300">
        <LeftIcon
          width={20}
          height={20}
          alt="left-icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
          onClick={() => {
            setSelectedNodeData({
              selectedNodeID: null,
              selectedNodeMessage: null,
            });
          }}
        />
        <h1 className="text-center text-gray-600">Message</h1>
      </div>

      <div className="pt-8 px-3 flex flex-col gap-3">
        <label className="text-gray-400">Text</label>
        <textarea
          ref={textAreaRef}
          value={String(textAreaValue)}
          rows={4}
          className="border border-gray-400 px-3 py-2 rounded w-full focus:outline-none max-h-80"
          onChange={(evnt) => {
            const inputVal = evnt.target.value;
            setTextAreaValue(inputVal);
            debouncingEffectFn(inputVal);
          }}
          placeholder="Enter your message..."
        />
      </div>
    </div>
  );
}

const MyCustomReactFlowEditor = () => (
  <ReactFlowProvider>
    <DnDProvider>
      <CustomNode />
    </DnDProvider>
  </ReactFlowProvider>
);

export default MyCustomReactFlowEditor;
