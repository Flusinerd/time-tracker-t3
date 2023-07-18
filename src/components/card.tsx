export default function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <>
      <style jsx>{`
        // Create a border gradient from primary to secondary from tl to br
        #signin-modal {
          border: 2px solid transparent;
          background-clip: padding-box;
          border-radius: 0.5rem;
        }

        #signin-modal::after {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          bottom: -2px;
          right: -2px;
          background: linear-gradient(to bottom right, #00dc82, #36e4da);
          border-radius: 0.5rem;
          z-index: -1;
        }
      `}</style>
      <div
        className={`relative flex h-72 w-96 flex-col bg-base-100 p-4 ${className ?? ""}`}
        id="signin-modal"
      >
        {children}
      </div>
    </>
  );
}
