import {
  createContext,
  ReactNode,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

// Define the type for our DnD context:
type DnDContextType = [string | null, Dispatch<SetStateAction<string | null>>];

// Create context with default value
const DnDContext = createContext<DnDContextType>([null, () => {}]);

// Context provider to wrap around components that need drag-and-drop type state
export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => useContext(DnDContext);
