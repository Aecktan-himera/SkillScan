import  { FC } from "react";

interface LoaderProps {
  className?: string;
}

const Loader: FC<LoaderProps> = ({ className = "" }) => (
  <div className={`inline-block animate-spin rounded-full ${className}`} 
       style={{ 
         border: "2px solid transparent",
         borderTopColor: "currentColor",
         borderRightColor: "currentColor",
         width: "1.5rem",
         height: "1.5rem"
       }} />
);

export default Loader;