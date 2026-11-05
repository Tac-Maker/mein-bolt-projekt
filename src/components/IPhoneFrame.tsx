import { type ReactNode } from 'react';

interface IPhoneFrameProps {
  children: ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="min-h-screen w-full bg-[#EDEDEE] flex items-center justify-center sm:p-6">
      <div className="relative w-full sm:w-[393px] h-screen sm:h-[852px] sm:rounded-[3.2rem] sm:border-[10px] sm:border-black bg-black sm:shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="relative w-full h-full bg-base-white overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
