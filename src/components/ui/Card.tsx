import { ReactNode, CSSProperties } from "react";

export function Card({ children, className="", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`ios-card ios-stroke ${className}`} style={style}>{children}</div>;
}

export function CardContent({ children, className="" }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export default Card;
