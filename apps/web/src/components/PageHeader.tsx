interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-divider"
            style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <h1 className="text-xl font-bold">{title}</h1>
        {action}
      </div>
    </header>
  );
}
