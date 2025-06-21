export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full space-y-6">{children}</div>;
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full items-center justify-between">{children}</div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full space-y-1">{children}</div>;
};

export const PageHeaderTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <h1 className="text-2xl font-bold">{children}</h1>;
};

export const PageHeaderDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="text-muted-foreground text-sm">{children}</p>;
};

export const PageHeaderActions = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-end gap-2 align-middle">
      {children}
    </div>
  );
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-6">{children}</div>;
};

export const PageFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-end">{children}</div>;
};
