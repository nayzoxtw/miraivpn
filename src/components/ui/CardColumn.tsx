import { ReactNode } from "react";

export function CardColumn({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="grow">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
